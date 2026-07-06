import Stripe from "stripe";
import { z } from "zod";
import { isStripeConfigured, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { clientIp, limitCheckout } from "@/lib/ai/rate-limit";
import { SITE_URL } from "@/lib/constants";
import { TUTOR_TOPUP_CREDITS } from "@/lib/billing/plans";

export const runtime = "nodejs";

const schema = z.object({
  plan: z.enum(["premium", "premium_plus", "tutor_topup"]),
  track: z.enum(["car", "bike_heavy"]).optional(),
  cycle: z.enum(["monthly", "annual"]).optional(),
});

/** Stripe price id for a plan + billing cycle, from env. */
function priceFor(plan: "premium" | "premium_plus", cycle: "monthly" | "annual"): string | undefined {
  if (plan === "premium") {
    return cycle === "annual"
      ? process.env.STRIPE_PRICE_PREMIUM_ANNUAL
      : process.env.STRIPE_PRICE_PREMIUM_MONTHLY;
  }
  return cycle === "annual"
    ? process.env.STRIPE_PRICE_PREMIUM_PLUS_ANNUAL
    : process.env.STRIPE_PRICE_PREMIUM_PLUS_MONTHLY;
}

/**
 * Stripe checkout: subscriptions (monthly or annual) and one-off tutor
 * top-up packs. When Stripe env vars are absent (the local demo) it returns
 * 501 and the client may unlock the tier locally — demo builds only.
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

  if (!isStripeConfigured) {
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

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // ── One-off tutor top-up (Premium Plus perk) ───────────────────────────────
  if (parsed.plan === "tutor_topup") {
    if (tier !== "premium_plus") {
      return Response.json({ error: "upgrade_required" }, { status: 403 });
    }
    const priceId = process.env.STRIPE_PRICE_TUTOR_TOPUP;
    if (!priceId) {
      return Response.json({ error: "Top-ups not configured." }, { status: 500 });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/tutor?topup=success`,
      cancel_url: `${SITE_URL}/tutor?topup=cancelled`,
      ...(userEmail ? { customer_email: userEmail } : {}),
      ...(userId ? { client_reference_id: userId } : {}),
      metadata: {
        kind: "tutor_topup",
        credits: String(TUTOR_TOPUP_CREDITS),
        ...(userId ? { user_id: userId } : {}),
      },
    });
    return Response.json({ url: session.url });
  }

  // ── Subscription checkout ──────────────────────────────────────────────────
  const cycle = parsed.cycle ?? "monthly";
  const priceId = priceFor(parsed.plan, cycle);
  if (!priceId) {
    return Response.json({ error: "Price not configured for this plan." }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${SITE_URL}/account/billing?status=success&plan=${parsed.plan}`,
    cancel_url: `${SITE_URL}/account/billing?status=cancelled`,
    // Tie the subscription to the authenticated user so a webhook can reconcile it.
    ...(userEmail ? { customer_email: userEmail } : {}),
    ...(userId ? { client_reference_id: userId } : {}),
    metadata: {
      plan: parsed.plan,
      cycle,
      ...(parsed.track ? { track: parsed.track } : {}),
      ...(userId ? { user_id: userId } : {}),
    },
    ...(userId ? { subscription_data: { metadata: { user_id: userId } } } : {}),
  });

  return Response.json({ url: session.url });
}
