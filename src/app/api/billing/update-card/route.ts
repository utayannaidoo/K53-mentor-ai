import { isPaystackConfigured, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { ACCOUNT_DAILY_LIMIT, clientIp, limitCheckout, limitUserDaily } from "@/lib/ai/rate-limit";
import { fetchCustomer, manageSubscriptionLink } from "@/lib/paystack/client";

export const runtime = "nodejs";

/**
 * Hand the learner a link to Paystack's hosted subscription-management page,
 * where they can put a new card on an existing subscription.
 *
 * Before this existed, the billing page told people to *cancel and resubscribe*
 * to change a card. That is a terrible instruction for the one moment it is
 * needed — a card has expired, the renewal has already failed, and the fix on
 * offer is to first give up the subscription. Anyone who hesitates churns, and
 * anyone inside the 7-day window who follows it triggers a refund and a fresh
 * charge for no reason. Expiring cards are ordinary and constant; this was the
 * largest avoidable support and churn item on the list.
 *
 * We never see the card. Paystack hosts the page precisely so that stays true.
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

  // Same per-account cap as cancellation: this reaches Paystack on every call,
  // and it sits behind the per-IP limit so a shared NAT can't lock someone out
  // of fixing their own card.
  const userRl = await limitUserDaily("update_card", user.id, ACCOUNT_DAILY_LIMIT.cancel);
  if (!userRl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: userRl.retryAfter },
      { status: 429, headers: { "Retry-After": String(userRl.retryAfter) } },
    );
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("provider_customer_id, provider_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();
  const sub = data as {
    provider_customer_id: string | null;
    provider_subscription_id: string | null;
  } | null;

  if (!sub?.provider_customer_id) {
    return Response.json({ error: "no_billing_account" }, { status: 404 });
  }

  try {
    // Prefer the stored code — one Paystack call instead of two. It is null for
    // everyone who subscribed before applyChargeSuccess started recording it,
    // so the customer fetch stays as the fallback rather than being replaced.
    let code = sub.provider_subscription_id;
    if (!code) {
      const customer = await fetchCustomer(sub.provider_customer_id);
      // Newest active subscription. `attention`/`non-renewing` are exactly the
      // states a failed card produces, and are the reason someone is here.
      const usable = customer.subscriptions.filter((s) =>
        ["active", "attention", "non-renewing"].includes(s.status),
      );
      code = usable.at(-1)?.subscription_code ?? null;
    }
    if (!code) {
      return Response.json({ error: "no_active_subscription" }, { status: 404 });
    }

    const { link } = await manageSubscriptionLink(code);
    return Response.json({ url: link });
  } catch (err) {
    console.error("billing/update-card: paystack error", err);
    return Response.json(
      { error: "Couldn't open the card update page — please try again shortly." },
      { status: 502 },
    );
  }
}
