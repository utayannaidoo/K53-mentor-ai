import Stripe from "stripe";
import { z } from "zod";
import { isStripeConfigured } from "@/lib/env";
import { SITE_URL } from "@/lib/constants";

export const runtime = "nodejs";

const schema = z.object({ plan: z.enum(["premium", "premium_plus"]) });

/**
 * Stripe-ready subscription checkout. When Stripe env vars are absent (the
 * default in this demo) it returns 501 and the client unlocks the tier locally.
 * When configured, it creates a real Checkout Session.
 */
export async function POST(req: Request) {
  let plan: "premium" | "premium_plus";
  try {
    plan = schema.parse(await req.json()).plan;
  } catch {
    return Response.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (!isStripeConfigured) {
    return Response.json(
      { error: "Billing is not configured in this demo.", demo: true },
      { status: 501 },
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const priceId =
    plan === "premium"
      ? process.env.STRIPE_PRICE_PREMIUM_MONTHLY
      : process.env.STRIPE_PRICE_PREMIUM_PLUS_MONTHLY;

  if (!priceId) {
    return Response.json({ error: "Price not configured for this plan." }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${SITE_URL}/account/billing?status=success&plan=${plan}`,
    cancel_url: `${SITE_URL}/account/billing?status=cancelled`,
  });

  return Response.json({ url: session.url });
}
