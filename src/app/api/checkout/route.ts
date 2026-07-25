import { z } from "zod";
import { isPaystackConfigured, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { clientIp, limitCheckout } from "@/lib/ai/rate-limit";
import { SITE_URL } from "@/lib/constants";
import {
  TUTOR_TOPUP_CREDITS,
  TUTOR_TOPUP_PRICE,
  PLAN_MAP,
  monthlyPrice,
  annualPrice,
} from "@/lib/billing/plans";
import { initializeTransaction } from "@/lib/paystack/client";

export const runtime = "nodejs";

/**
 * Where Paystack sends the buyer back after hosted checkout. Prefer the
 * request's own origin so a checkout started on a given domain always returns
 * to that same domain — a checkout begun on production lands back on
 * production, a preview returns to the preview. This makes the callback
 * immune to a stale or preview-pointed `NEXT_PUBLIC_SITE_URL`, which had been
 * silently bouncing production buyers onto a preview deployment (where the
 * post-payment `verify` ran against the wrong session and 403'd). The Origin
 * header on a browser fetch is set by the browser, not user script, so it is
 * safe to trust here; this only controls a post-payment redirect, never the
 * entitlement grant (that stays webhook-only). Falls back to the forwarded
 * host, then the configured SITE_URL.
 */
function callbackOrigin(req: Request): string {
  const origin = req.headers.get("origin");
  if (origin && /^https?:\/\//i.test(origin)) return origin;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) {
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }
  return SITE_URL;
}

const schema = z.object({
  plan: z.enum(["premium", "premium_plus", "tutor_topup"]),
  cycle: z.enum(["monthly", "annual"]).optional(),
  // `track` was the car vs bike+heavy split. One plan now covers every
  // licence code, so it is accepted and ignored rather than rejected — old
  // bookmarks and in-flight clients must not start 400ing on deploy.
  track: z.string().optional(),
});

/**
 * Paystack Plan code for a plan + cycle, from env. One price per tier now, so
 * there are four Plans (2 tiers x 2 cycles) rather than eight — the bike+heavy
 * variants are retired. These are the same Plan codes that were already live
 * for the car track, so no new Paystack Plans need creating.
 */
function planCodeFor(
  plan: "premium" | "premium_plus",
  cycle: "monthly" | "annual",
): string | undefined {
  const e = process.env;
  const codes =
    plan === "premium"
      ? { monthly: e.PAYSTACK_PLAN_PREMIUM_MONTHLY, annual: e.PAYSTACK_PLAN_PREMIUM_ANNUAL }
      : { monthly: e.PAYSTACK_PLAN_PREMIUM_PLUS_MONTHLY, annual: e.PAYSTACK_PLAN_PREMIUM_PLUS_ANNUAL };
  return codes[cycle] || undefined;
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
      tier =
        data && (data.status === "active" || data.status === "trialing" || data.status === "past_due")
          ? data.tier
          : "free";
    }
  }
  // Paystack needs an email even in demo-without-auth; it's never charged.
  const email = userEmail ?? "guest@k53mentor.ai";
  // Return the buyer to whatever domain they checked out from (see helper).
  const returnOrigin = callbackOrigin(req);

  try {
    // ── One-off tutor top-up (Premium Plus perk) ─────────────────────────────
    if (parsed.plan === "tutor_topup") {
      if (tier !== "premium_plus") {
        return Response.json({ error: "upgrade_required" }, { status: 403 });
      }
      const { authorization_url } = await initializeTransaction({
        email,
        amount: TUTOR_TOPUP_PRICE * 100, // ZAR → cents
        callback_url: `${returnOrigin}/tutor?topup=success`,
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

    // Paystack's initialize endpoint rejects the request ("Invalid Amount Sent")
    // unless an amount is present, even when a plan sets the recurring price.
    // Send the plan's own amount (ZAR → cents) so amount and Plan agree.
    const planDef = PLAN_MAP[parsed.plan];
    const amountZar = cycle === "annual" ? annualPrice(planDef) : monthlyPrice(planDef);

    const { authorization_url } = await initializeTransaction({
      email,
      amount: amountZar * 100,
      plan: planCode,
      callback_url: `${returnOrigin}/account/billing?status=success&plan=${parsed.plan}`,
      metadata: {
        kind: "subscription",
        plan: parsed.plan,
        cycle,
        ...(userId ? { user_id: userId } : {}),
      },
    });
    return Response.json({ url: authorization_url });
  } catch (err) {
    console.error("checkout: paystack error", err);
    return Response.json({ error: "Checkout could not start." }, { status: 502 });
  }
}
