import { z } from "zod";
import { isPaystackConfigured, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { clientIp, limitCheckout } from "@/lib/ai/rate-limit";
import { SITE_URL } from "@/lib/constants";
import { TUTOR_TOPUP_CREDITS, TUTOR_TOPUP_PRICE } from "@/lib/billing/plans";
import { initializeTransaction } from "@/lib/paystack/client";

export const runtime = "nodejs";

const schema = z.object({
  plan: z.enum(["premium", "premium_plus", "tutor_topup"]),
  track: z.enum(["car", "bike_heavy"]).optional(),
  cycle: z.enum(["monthly", "annual"]).optional(),
});

/** Paystack Plan code for a plan + billing cycle, from env. */
function planCodeFor(plan: "premium" | "premium_plus", cycle: "monthly" | "annual"): string | undefined {
  if (plan === "premium") {
    return cycle === "annual"
      ? process.env.PAYSTACK_PLAN_PREMIUM_ANNUAL
      : process.env.PAYSTACK_PLAN_PREMIUM_MONTHLY;
  }
  return cycle === "annual"
    ? process.env.PAYSTACK_PLAN_PREMIUM_PLUS_ANNUAL
    : process.env.PAYSTACK_PLAN_PREMIUM_PLUS_MONTHLY;
}

/**
 * Paystack hosted checkout: subscriptions (monthly or annual, via a Plan
 * code) and one-off tutor top-up packs (a plain amount, no Plan). When
 * Paystack env vars are absent (the local demo) it returns 501 and the
 * client may unlock the tier locally — demo builds only.
 */
export async function POST(req: Request) {
  const rl = await limitCheckout(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let parsed: z.infer<typeof schema>;
  try {
    parsed = schema.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (!isPaystackConfigured) {
    return Response.json(
      { error: "Billing is not configured in this demo.", demo: true },
      { status: 501 },
    );
  }

  // Require a signed-in user and bind the checkout to them (prod only).
  let userId: string | undefined;
  let userEmail: string | undefined;
  let tier: string | undefined;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    if (!user || !supabase) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = user.id;
    userEmail = user.email ?? undefined;
    if (parsed.plan === "tutor_topup") {
      const { data } = await supabase
        .from("subscriptions")
        .select("tier,status")
        .eq("user_id", user.id)
        .maybeSingle();
      tier = data && (data.status === "active" || data.status === "trialing") ? data.tier : "free";
    }
  }
  // Paystack needs an email even in demo-without-auth; it's never charged.
  const email = userEmail ?? "guest@k53mentor.ai";

  try {
    // ── One-off tutor top-up (Premium Plus perk) ─────────────────────────────
    if (parsed.plan === "tutor_topup") {
      if (tier !== "premium_plus") {
        return Response.json({ error: "upgrade_required" }, { status: 403 });
      }
      const { authorization_url } = await initializeTransaction({
        email,
        amount: TUTOR_TOPUP_PRICE * 100, // ZAR → cents
        callback_url: `${SITE_URL}/tutor?topup=success`,
        metadata: {
          kind: "tutor_topup",
          credits: String(TUTOR_TOPUP_CREDITS),
          ...(userId ? { user_id: userId } : {}),
        },
      });
      return Response.json({ url: authorization_url });
    }

    // ── Subscription checkout ────────────────────────────────────────────────
    const cycle = parsed.cycle ?? "monthly";
    const planCode = planCodeFor(parsed.plan, cycle);
    if (!planCode) {
      return Response.json({ error: "Price not configured for this plan." }, { status: 500 });
    }

    const { authorization_url } = await initializeTransaction({
      email,
      plan: planCode,
      callback_url: `${SITE_URL}/account/billing?status=success&plan=${parsed.plan}`,
      metadata: {
        kind: "subscription",
        plan: parsed.plan,
        cycle,
        ...(parsed.track ? { track: parsed.track } : {}),
        ...(userId ? { user_id: userId } : {}),
      },
    });
    return Response.json({ url: authorization_url });
  } catch (err) {
    console.error("checkout: paystack error", err);
    return Response.json({ error: "Checkout could not start." }, { status: 502 });
  }
}
