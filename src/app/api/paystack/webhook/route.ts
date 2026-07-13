import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaystackSignature } from "@/lib/paystack/client";
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
      };
      const customerCode = data.customer?.customer_code;
      if (!customerCode) break;
      const { data: row } = await admin
        .from("subscriptions")
        .update({ status: "past_due" })
        .eq("provider_customer_id", customerCode)
        .select("tier")
        .maybeSingle();
      const tier = (row as { tier?: string } | null)?.tier;
      if (isEmailConfigured && data.customer?.email && (tier === "premium" || tier === "premium_plus")) {
        const nudge = buildPaymentFailedEmail({
          firstName: data.customer.first_name ?? "",
          planName: PLAN_MAP[tier].name,
        });
        await sendEmail({ to: data.customer.email, ...nudge }).catch(() => {});
      }
      break;
    }

    case "subscription.disable": {
      const data = payload.data as SubscriptionEventData;
      const customerCode = data.customer?.customer_code;
      if (!customerCode) break;
      await admin
        .from("subscriptions")
        .update({ tier: "free", status: "canceled" })
        .eq("provider_customer_id", customerCode);
      break;
    }

    default:
      // Unhandled event types are acknowledged so Paystack stops retrying them.
      break;
  }

  return Response.json({ received: true });
}
