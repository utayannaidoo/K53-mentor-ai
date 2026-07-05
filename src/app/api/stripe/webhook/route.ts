import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Stripe webhook — the only writer of the paid subscription tier.
 *
 * The client can no longer set its own tier (RLS allows SELECT only on
 * subscriptions), so payment truth flows exclusively through here:
 * signature-verified events, applied with the service-role key.
 */

/** Map a Stripe price id back to our tier via the configured env prices. */
function tierForPrice(priceId: string | undefined): "premium" | "premium_plus" | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_PREMIUM_MONTHLY) return "premium";
  if (priceId === process.env.STRIPE_PRICE_PREMIUM_PLUS_MONTHLY) return "premium_plus";
  return null;
}

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return Response.json({ error: "Webhook not configured" }, { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  // Signature verification needs the raw body, byte-for-byte.
  const payload = await req.text();
  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    // Configured Stripe without the service key — surface loudly in logs.
    console.error("stripe webhook: SUPABASE_SERVICE_ROLE_KEY not set; cannot apply event", event.type);
    return Response.json({ error: "Storage not configured" }, { status: 500 });
  }

  /** Grant the tier for a paid checkout session. */
  async function applyPaidCheckout(session: Stripe.Checkout.Session) {
    const userId = session.client_reference_id ?? session.metadata?.user_id;
    const plan = session.metadata?.plan;
    if (!userId || (plan !== "premium" && plan !== "premium_plus")) return;
    // Delayed payment methods complete the session before money moves —
    // only "paid" grants the tier (async_payment_succeeded re-delivers it).
    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return;
    }
    await admin!.from("subscriptions").upsert(
      {
        user_id: userId,
        tier: plan,
        status: "active",
        provider: "stripe",
        provider_customer_id:
          typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null),
        provider_subscription_id:
          typeof session.subscription === "string"
            ? session.subscription
            : (session.subscription?.id ?? null),
      },
      { onConflict: "user_id" },
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      await applyPaidCheckout(event.data.object);
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object;
      const userId = sub.metadata?.user_id;
      if (!userId) break;
      const tier = tierForPrice(sub.items.data[0]?.price?.id);
      const active = sub.status === "active" || sub.status === "trialing";
      // Billing-period end lives on the subscription item in current API versions.
      const periodEnd = (sub.items.data[0] as { current_period_end?: number } | undefined)
        ?.current_period_end;
      await admin.from("subscriptions").upsert(
        {
          user_id: userId,
          tier: active && tier ? tier : "free",
          status: sub.status,
          provider: "stripe",
          provider_subscription_id: sub.id,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        },
        { onConflict: "user_id" },
      );
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const userId = sub.metadata?.user_id;
      if (!userId) break;
      await admin.from("subscriptions").upsert(
        {
          user_id: userId,
          tier: "free",
          status: "canceled",
          provider: "stripe",
          provider_subscription_id: sub.id,
        },
        { onConflict: "user_id" },
      );
      break;
    }

    default:
      // Unhandled event types are acknowledged so Stripe stops retrying them.
      break;
  }

  return Response.json({ received: true });
}
