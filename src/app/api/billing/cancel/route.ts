import { isPaystackConfigured, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, limitCheckout } from "@/lib/ai/rate-limit";
import { disableSubscription, fetchCustomer, refundTransaction } from "@/lib/paystack/client";

export const runtime = "nodejs";

/** Cancel within this many days of the first charge for an automatic full refund. */
const MONEY_BACK_DAYS = 7;

/**
 * Self-serve cancellation. Paystack has no Stripe-style hosted billing
 * portal, so this calls Paystack's disable-subscription API directly: fetch
 * the customer (which embeds their subscriptions, including the email_token
 * only Paystack's API can hand out) and disable the active one.
 *
 * If the learner is still inside the 7-day money-back window of their first
 * charge, the same request also refunds that charge automatically — the
 * guarantee needs no email.
 *
 * Downgrades the local row immediately for a snappy UI; the subsequent
 * subscription.disable webhook re-applies the same values (idempotent).
 */
export async function POST(req: Request) {
  const rl = await limitCheckout(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  if (!isPaystackConfigured || !isSupabaseConfigured) {
    return Response.json({ error: "Billing not configured", demo: true }, { status: 501 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!user || !supabase) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("tier, provider_customer_id, last_charge_reference, paid_at, money_back_used")
    .eq("user_id", user.id)
    .maybeSingle();
  const sub = data as {
    tier: string | null;
    provider_customer_id: string | null;
    last_charge_reference: string | null;
    paid_at: string | null;
    money_back_used: boolean | null;
  } | null;
  const customerCode = sub?.provider_customer_id;
  if (!customerCode) {
    return Response.json({ error: "no_billing_account" }, { status: 404 });
  }

  // Eligible for an automatic full refund? Within the money-back window of the
  // first charge, on a paid tier, guarantee not already used. These fields are
  // written only by trusted server code (RLS is SELECT-only), so they're safe
  // to trust here.
  const paidAtMs = sub?.paid_at ? Date.parse(sub.paid_at) : NaN;
  const withinWindow =
    Number.isFinite(paidAtMs) && Date.now() - paidAtMs <= MONEY_BACK_DAYS * 86_400_000;
  const refundEligible =
    withinWindow && sub?.tier !== "free" && !sub?.money_back_used && Boolean(sub?.last_charge_reference);

  try {
    const customer = await fetchCustomer(customerCode);
    const active = customer.subscriptions.find((s) => s.status === "active");
    if (!active) {
      return Response.json({ error: "no_active_subscription" }, { status: 404 });
    }
    await disableSubscription(active.subscription_code, active.email_token);
  } catch (err) {
    console.error("billing/cancel: paystack error", err);
    return Response.json({ error: "Cancellation failed — please try again shortly." }, { status: 502 });
  }

  // Issue the money-back refund (best-effort). Billing is already stopped, so a
  // refund hiccup mustn't block the cancellation — we report it and the learner
  // can email us instead.
  let refunded = false;
  let refundError = false;
  if (refundEligible && sub?.last_charge_reference) {
    try {
      await refundTransaction(sub.last_charge_reference);
      refunded = true;
    } catch (err) {
      console.error("billing/cancel: refund error", err);
      refundError = true;
    }
  }

  // RLS only allows the client to SELECT its own subscription row — the
  // downgrade needs the service-role client, same as the webhook uses.
  // `money_back_used` is latched on a successful refund so the guarantee can't
  // be claimed twice.
  const admin = createAdminClient();
  await admin
    ?.from("subscriptions")
    .update({ tier: "free", status: "canceled", ...(refunded ? { money_back_used: true } : {}) })
    .eq("user_id", user.id);

  return Response.json({ ok: true, refunded, refundError });
}
