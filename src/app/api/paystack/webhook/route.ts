import { createAdminClient } from "@/lib/supabase/admin";
import { manageSubscriptionLink, verifyPaystackSignature } from "@/lib/paystack/client";
import { applyChargeSuccess, type ChargeSuccessData } from "@/lib/paystack/apply";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { buildPaymentFailedEmail } from "@/lib/notify/templates";
import { PLAN_MAP } from "@/lib/billing/plans";

export const runtime = "nodejs";

/**
 * Paystack webhook — the only writer of the paid subscription tier.
 *
 * The client can no longer set its own tier (RLS allows SELECT only on
 * subscriptions), so payment truth flows exclusively through here:
 * signature-verified events, applied with the service-role key.
 *
 * Metadata set at /transaction/initialize is echoed back on charge.success,
 * which is how we tie a payment to a user without ever handling card data.
 * subscription.disable has no such metadata (it's not initiated by us), so
 * it's resolved by matching the Paystack customer_code we stored earlier.
 */

interface SubscriptionEventData {
  subscription_code: string;
  customer: { customer_code: string };
}

export async function POST(req: Request) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return Response.json({ error: "Webhook not configured" }, { status: 501 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!verifyPaystackSignature(rawBody, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: { event: string; data: unknown };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    console.error("paystack webhook: SUPABASE_SERVICE_ROLE_KEY not set; cannot apply event", payload.event);
    return Response.json({ error: "Storage not configured" }, { status: 500 });
  }

  // Paystack redelivers events. The ledger makes every event apply exactly
  // once — a duplicate charge.success can't double-grant top-up credits.
  const dataId =
    typeof (payload.data as { id?: unknown; reference?: unknown })?.id !== "undefined"
      ? String((payload.data as { id: unknown }).id)
      : String((payload.data as { reference?: unknown })?.reference ?? "");
  const ledgerId = `${payload.event}:${dataId}`;
  const { error: ledgerError } = await admin
    .from("payment_events")
    .insert({ id: ledgerId, type: payload.event });
  if (ledgerError?.code === "23505") {
    return Response.json({ received: true, duplicate: true });
  }
  if (ledgerError) {
    // The dedup state is unknown — applying anyway could double-grant on a
    // redelivery. Fail so Paystack retries once the ledger is reachable.
    console.error("paystack webhook: ledger insert failed", payload.event, ledgerError.message);
    return Response.json({ error: "Ledger unavailable" }, { status: 500 });
  }

  try {
    switch (payload.event) {
      case "charge.success": {
        // Shared with the callback verify route — one grant path, however the
        // charge is confirmed first. The ledger insert above makes it once-only.
        await applyChargeSuccess(admin, payload.data as ChargeSuccessData);
        break;
      }

      case "invoice.payment_failed": {
        // A renewal charge failed. Paystack keeps retrying — mark the row
        // past_due (a grace state the entitlement check still honours) and
        // nudge the learner. The hard cutoff is subscription.disable, which
        // Paystack sends when it gives up.
        const data = payload.data as {
          customer?: { customer_code?: string; email?: string; first_name?: string | null };
          subscription?: { subscription_code?: string } | null;
        };
        const customerCode = data.customer?.customer_code;
        if (!customerCode) break;
        const { data: row, error } = await admin
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("provider_customer_id", customerCode)
          .select("tier, provider_subscription_id")
          .maybeSingle();
        if (error) throw new Error(`past_due update failed: ${error.message}`);
        const sub = row as { tier?: string; provider_subscription_id?: string | null } | null;
        const tier = sub?.tier;
        if (isEmailConfigured && data.customer?.email && (tier === "premium" || tier === "premium_plus")) {
          // This email exists because a card needs replacing, so put the
          // hosted card-update page *in* it rather than making the reader sign
          // in and hunt for a button. Best-effort: if Paystack won't give us
          // the link, the template falls back to /account/billing, which has
          // the same thing one click deeper. A dunning email that fails to
          // send is far worse than one without a deep link.
          const code =
            data.subscription?.subscription_code ?? sub?.provider_subscription_id ?? null;
          const manageUrl = code
            ? await manageSubscriptionLink(code)
                .then((r) => r.link)
                .catch(() => null)
            : null;
          const nudge = buildPaymentFailedEmail({
            firstName: data.customer.first_name ?? "",
            planName: PLAN_MAP[tier].name,
            manageUrl,
          });
          await sendEmail({ to: data.customer.email, ...nudge }).catch(() => {});
        }
        break;
      }

      case "subscription.disable": {
        const data = payload.data as SubscriptionEventData;
        const customerCode = data.customer?.customer_code;
        if (!customerCode) break;
        const { error } = await admin
          .from("subscriptions")
          .update({ tier: "free", status: "canceled" })
          .eq("provider_customer_id", customerCode);
        if (error) throw new Error(`downgrade failed: ${error.message}`);
        break;
      }

      case "subscription.not_renew": {
        // Auto-renew switched off. The learner has paid through the current
        // period, so this must NOT touch tier or status — setting a status
        // outside active/trialing/past_due would make entitlements fail closed
        // and revoke access they are still owed. Paystack sends
        // subscription.disable when the period actually ends; that is the
        // downgrade. This only records the intent so the billing page can say
        // "renews: no" instead of implying another charge is coming.
        const data = payload.data as SubscriptionEventData;
        const customerCode = data.customer?.customer_code;
        if (!customerCode) break;
        const { error } = await admin
          .from("subscriptions")
          .update({ cancel_at_period_end: true })
          .eq("provider_customer_id", customerCode);
        if (error) throw new Error(`not_renew flag failed: ${error.message}`);
        break;
      }

      case "charge.dispute.create": {
        // A chargeback was opened. Deliberately does not downgrade: a dispute
        // is a claim, not an outcome, and banks open them in error often
        // enough that auto-revoking access would punish real customers. If it
        // resolves against us Paystack issues a refund, and refund.processed
        // below does the downgrade.
        //
        // What matters is that it stops being invisible — it currently lands
        // in the default branch and is acknowledged with no trace anywhere.
        const data = payload.data as {
          transaction?: { reference?: string };
          customer?: { customer_code?: string };
          amount?: number;
          status?: string;
        };
        const customerCode = data.customer?.customer_code;
        console.error(
          "[dispute] chargeback opened",
          JSON.stringify({
            reference: data.transaction?.reference,
            customer: customerCode,
            amount: data.amount,
            status: data.status,
          }),
        );
        if (!customerCode) break;
        const { error } = await admin
          .from("subscriptions")
          .update({ disputed_at: new Date().toISOString() })
          .eq("provider_customer_id", customerCode);
        if (error) throw new Error(`dispute flag failed: ${error.message}`);
        break;
      }

      case "refund.processed": {
        // The money is back with the customer, so the tier goes with it.
        //
        // Our own 7-day money-back flow already downgrades before refunding,
        // which makes this a no-op there — writing tier: "free" twice is
        // harmless. The case this exists for is a refund issued from the
        // Paystack dashboard, which previously left the account paid forever.
        //
        // Matched on the refunded transaction's reference rather than the
        // customer, so refunding a one-off tutor top-up cannot strip someone's
        // subscription: only the charge recorded as the subscription's own
        // last_charge_reference downgrades it.
        const data = payload.data as {
          transaction?: { reference?: string };
          transaction_reference?: string;
          status?: string;
        };
        const reference = data.transaction?.reference ?? data.transaction_reference;
        if (!reference) break;
        const { error } = await admin
          .from("subscriptions")
          .update({
            tier: "free",
            status: "canceled",
            refunded_at: new Date().toISOString(),
          })
          .eq("last_charge_reference", reference);
        if (error) throw new Error(`refund downgrade failed: ${error.message}`);
        break;
      }

      default:
        // Unhandled event types are acknowledged so Paystack stops retrying them.
        break;
    }
  } catch (err) {
    // The event was NOT applied. Release the ledger row so Paystack's
    // redelivery isn't treated as a duplicate — otherwise a transient DB
    // error becomes a paid-but-never-granted account that only manual ops
    // can fix. The delete is best-effort; if it also fails, the retry hits
    // the 23505 path and ops must reconcile from the logs.
    console.error("paystack webhook: apply failed, releasing ledger row", payload.event, err);
    await admin
      .from("payment_events")
      .delete()
      .eq("id", ledgerId)
      .then(({ error }) => {
        if (error) console.error("paystack webhook: ledger release failed", ledgerId, error.message);
      });
    return Response.json({ error: "Event could not be applied" }, { status: 500 });
  }

  return Response.json({ received: true });
}
