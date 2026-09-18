import { z } from "zod";
import { isPaystackConfigured, isSupabaseConfigured } from "@/lib/env";
import { ACCOUNT_DAILY_LIMIT, clientIp, limitCheckout, limitUserDaily } from "@/lib/ai/rate-limit";
import { disableSubscription, fetchCustomer, manageSubscriptionLink, type PaystackSubscription } from "@/lib/paystack/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireSchool } from "@/lib/schools/auth";
import { subscriptionPlanCode } from "@/lib/paystack/apply";

export const runtime = "nodejs";

/**
 * The two things an owner does to a running school plan besides changing it:
 * stop it renewing, and put a new card on it.
 *
 * Paystack has no hosted billing portal. Cancelling is a disable-subscription
 * call (which Paystack turns into "non-renewing" — the paid period still runs
 * out), and a card change is a link to Paystack's own subscription page, so we
 * never see a card. Same shape as the learner routes in /api/billing, minus the
 * money-back refund: a school has a 30-day free trial instead.
 *
 * Changing plan is not here: that is a fresh checkout, and the grant disables
 * the old plan once the new one is paid (src/lib/billing/school-billing.ts).
 */

const schema = z.object({ action: z.enum(["cancel", "update_card"]) });

interface BillingRow {
  status: string;
  plan_code: string | null;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export async function POST(req: Request) {
  const rl = await limitCheckout(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let action: z.infer<typeof schema>["action"];
  try {
    action = schema.parse(await req.json()).action;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!isPaystackConfigured || !isSupabaseConfigured) {
    return Response.json({ error: "Billing isn't available in the demo.", demo: true }, { status: 501 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!supabase || !user) return Response.json({ error: "Sign in again to continue." }, { status: 401 });

  // Per-account cap under the per-IP one, as the learner billing routes do:
  // both actions reach Paystack on every call.
  const userRl = await limitUserDaily(`school_${action}`, user.id, ACCOUNT_DAILY_LIMIT.cancel);
  if (!userRl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: userRl.retryAfter },
      { status: 429, headers: { "Retry-After": String(userRl.retryAfter) } },
    );
  }

  const guard = await requireSchool({ roles: ["owner"] });
  if (!guard.ok) return Response.json({ error: guard.message }, { status: 403 });
  const schoolId = guard.school.schoolId;

  const { data } = await supabase
    .from("school_subscriptions")
    .select("status, plan_code, provider_customer_id, provider_subscription_id, current_period_end, cancel_at_period_end")
    .eq("school_id", schoolId)
    .maybeSingle();
  const row = data as BillingRow | null;
  if (!row?.provider_customer_id || !row.plan_code) {
    return Response.json({ error: "There's no paid plan on this school to change." }, { status: 404 });
  }

  // The school's own subscription, and never the owner's learner plan on the
  // same Paystack customer: matched by the recorded code first, then by the
  // school's plan code.
  let live: PaystackSubscription | undefined;
  try {
    const customer = await fetchCustomer(row.provider_customer_id);
    live =
      customer.subscriptions.find((s) => row.provider_subscription_id && s.subscription_code === row.provider_subscription_id) ??
      customer.subscriptions.find(
        (s) => ["active", "attention", "non-renewing"].includes(s.status) && subscriptionPlanCode(s) === row.plan_code,
      );
  } catch (err) {
    console.error("schools/billing: customer lookup failed", err);
    return Response.json({ error: "Paystack didn't answer. Please try again shortly." }, { status: 502 });
  }
  if (!live) {
    return Response.json({ error: "We couldn't find this school's subscription at Paystack." }, { status: 404 });
  }

  if (action === "update_card") {
    try {
      const { link } = await manageSubscriptionLink(live.subscription_code);
      return Response.json({ url: link });
    } catch (err) {
      console.error("schools/billing: manage link failed", err);
      return Response.json({ error: "Paystack didn't answer. Please try again shortly." }, { status: 502 });
    }
  }

  // ── Cancel: stop renewing, keep what has been paid for ──────────────────────
  if (live.status !== "active" || row.cancel_at_period_end) {
    return Response.json({ ok: true, accessUntil: row.current_period_end });
  }
  const admin = createAdminClient();
  if (!admin) {
    console.error("schools/billing: SUPABASE_SERVICE_ROLE_KEY not set; cannot record a cancellation");
    return Response.json({ error: "Billing isn't fully configured on this deployment." }, { status: 500 });
  }

  // Record the flag AND the period end before disabling: Paystack nulls
  // next_payment_date the moment a subscription stops renewing, and the
  // subscription.disable webhook that follows reads this row to decide
  // whether the school keeps its paid-for days (see applySchoolLifecycle).
  const periodEnd = live.next_payment_date
    ? new Date(live.next_payment_date).toISOString()
    : row.current_period_end;
  const { error: flagError } = await admin
    .from("school_subscriptions")
    .update({ cancel_at_period_end: true, ...(periodEnd ? { current_period_end: periodEnd } : {}) })
    .eq("school_id", schoolId);
  if (flagError) {
    console.error("schools/billing: could not flag cancellation", flagError.message);
    return Response.json({ error: "Cancellation failed. Please try again." }, { status: 500 });
  }

  try {
    await disableSubscription(live.subscription_code, live.email_token);
  } catch (err) {
    // Billing is still running, so the row must not say it is ending.
    console.error("schools/billing: disable failed; un-flagging", err);
    await admin.from("school_subscriptions").update({ cancel_at_period_end: false }).eq("school_id", schoolId);
    return Response.json({ error: "Cancellation failed. Please try again." }, { status: 502 });
  }

  return Response.json({ ok: true, accessUntil: periodEnd });
}
