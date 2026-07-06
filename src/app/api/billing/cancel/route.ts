import { isPaystackConfigured, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, limitCheckout } from "@/lib/ai/rate-limit";
import { disableSubscription, fetchCustomer } from "@/lib/paystack/client";

export const runtime = "nodejs";

/**
 * Self-serve cancellation. Paystack has no Stripe-style hosted billing
 * portal, so this calls Paystack's disable-subscription API directly: fetch
 * the customer (which embeds their subscriptions, including the email_token
 * only Paystack's API can hand out) and disable the active one.
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
    .select("provider_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  const customerCode = (data as { provider_customer_id: string | null } | null)?.provider_customer_id;
  if (!customerCode) {
    return Response.json({ error: "no_billing_account" }, { status: 404 });
  }

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

  // RLS only allows the client to SELECT its own subscription row — the
  // downgrade needs the service-role client, same as the webhook uses.
  const admin = createAdminClient();
  await admin
    ?.from("subscriptions")
    .update({ tier: "free", status: "canceled" })
    .eq("user_id", user.id);

  return Response.json({ ok: true });
}
