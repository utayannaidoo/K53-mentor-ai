import { createAdminClient } from "@/lib/supabase/admin";
import {
  manageSubscriptionLink,
  verifyPaystackSignature,
  verifyTransaction,
} from "@/lib/paystack/client";
import { applyChargeSuccess, type ChargeSuccessData } from "@/lib/paystack/apply";
import { webhookLedgerId } from "@/lib/paystack/ledger";
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
  // The id must be unique per event INSTANCE: lifecycle events carry no
  // transaction id, so the id comes from webhookLedgerId (subscription code,
  // refund reference, dispute id). When no reliable identity exists the event
  // is applied without a ledger claim — every such handler is an idempotent
  // state write, so a redelivery converges on the same state. charge.success
  // is the exception: its grant is NOT idempotent (credits), so an unclaimable
  // one fails instead of applying unprotected.
  const ledgerId = webhookLedgerId(payload.event, payload.data);
  // Correlation anchor: every decision below can be traced from this line —
  // user → charge reference → ledger id → applied outcome. Logged before any
  // branch so even a refused/duplicate event leaves a trail.
  console.error(
    `paystack webhook: ${payload.event} ledger=${ledgerId ?? "unclaimed"}`,
  );
  if (ledgerId === null) {
    if (payload.event === "charge.success") {
      console.error("paystack webhook: charge.success without transaction id; refusing to apply unclaimed");
      return Response.json({ error: "Event has no dedup identity" }, { status: 400 });
    }
    console.error("paystack webhook: no ledger id derivable, applying unclaimed", payload.event);
  }
  if (ledgerId !== null) {
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
        // Paystack fires this as soon as a subscription is disabled — which is
        // the moment self-serve cancellation calls /subscription/disable, not
        // when the paid period runs out.
        //
        // Downgrading unconditionally here would therefore undo
        // cancel-at-period-end entirely: the learner cancels, Paystack pings us
        // within seconds, and they lose the month they already paid for anyway.
        // That is precisely the bug this event *looks* like it is preventing.
        //
        // So: always stop the renewal, but only drop the tier once the paid
        // period is actually over (or was never recorded). The date is written
        // on charge success, and entitlements re-checks it on every request, so
        // access still ends on time without this event having to be the thing
        // that ends it.
        //
        // Plan switches also fire this event — applyChargeSuccess deliberately
        // disables every superseded plan after granting the newly-paid one. The
        // disabled code belongs to the OLD plan; our row already points at the
        // new subscription. Acting anyway would downgrade a learner seconds
        // after they paid (observed in production: a Plus→Premium switch landed
        // as "no subscription"). So when the row names its subscription and the
        // event is for a different one, ignore it. Rows without a recorded id
        // (pre-0008 data) fall through to the customer-based rule below.
        const data = payload.data as SubscriptionEventData;
        const customerCode = data.customer?.customer_code;
        if (!customerCode) break;

        const { data: row } = await admin
          .from("subscriptions")
          .select("current_period_end, provider_subscription_id")
          .eq("provider_customer_id", customerCode)
          .maybeSingle();
        const sub = row as {
          current_period_end: string | null;
          provider_subscription_id: string | null;
        } | null;

        if (
          sub?.provider_subscription_id &&
          data.subscription_code &&
          data.subscription_code !== sub.provider_subscription_id
        ) {
          console.error(
            "subscription.disable for a superseded plan; ignoring",
            data.subscription_code,
            "row points at",
            sub.provider_subscription_id,
          );
          break;
        }

        const endsAt = sub?.current_period_end ?? null;
        const stillPaidFor = endsAt ? Date.parse(endsAt) > Date.now() : false;

        const { error } = await admin
          .from("subscriptions")
          .update(
            stillPaidFor
              ? { cancel_at_period_end: true }
              : { tier: "free", status: "canceled", cancel_at_period_end: false },
          )
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
        // The refunded charge is resolved through Paystack's API first: a
        // renewal charge carries no checkout metadata and never lands in
        // `last_charge_reference`, so reference-matching alone silently kept
        // every renewal refundee on a paid tier. Verifying the transaction
        // also tells a subscription charge (it has a plan) from a one-off
        // tutor top-up (it doesn't) — only the former may strip the tier.
        // If Paystack can't be reached, fall back to the legacy
        // last_charge_reference match, which still covers first charges.
        const data = payload.data as {
          transaction?: { reference?: string };
          transaction_reference?: string;
          status?: string;
        };
        const reference = data.transaction?.reference ?? data.transaction_reference;
        if (!reference) break;

        let applied = false;
        try {
          const tx = await verifyTransaction(reference);
          const customerCode = tx.customer?.customer_code;
          if (customerCode && tx.plan) {
            const { error } = await admin
              .from("subscriptions")
              .update({
                tier: "free",
                status: "canceled",
                refunded_at: new Date().toISOString(),
              })
              .eq("provider_customer_id", customerCode)
              .neq("tier", "free");
            if (error) throw new Error(`refund downgrade failed: ${error.message}`);
            applied = true;
          } else if (customerCode && !tx.plan) {
            // A refunded tutor top-up: credits stay spent, subscription stays.
            applied = true;
          }
        } catch (err) {
          console.error("paystack webhook: refund lookup failed, falling back", err);
        }

        if (!applied) {
          const { error } = await admin
            .from("subscriptions")
            .update({
              tier: "free",
              status: "canceled",
              refunded_at: new Date().toISOString(),
            })
            .eq("last_charge_reference", reference);
          if (error) throw new Error(`refund downgrade failed: ${error.message}`);
        }
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
    if (ledgerId !== null) {
      await admin
        .from("payment_events")
        .delete()
        .eq("id", ledgerId)
        .then(({ error }) => {
          if (error) console.error("paystack webhook: ledger release failed", ledgerId, error.message);
        });
    }
    return Response.json({ error: "Event could not be applied" }, { status: 500 });
  }

  return Response.json({ received: true });
}
