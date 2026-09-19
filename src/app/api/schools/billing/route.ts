import { z } from "zod";
import { isPaystackConfigured, isSupabaseConfigured } from "@/lib/env";
import { ACCOUNT_DAILY_LIMIT, clientIp, limitCheckout, limitUserDaily } from "@/lib/ai/rate-limit";
import { fetchCustomer, manageSubscriptionLink } from "@/lib/paystack/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireSchool } from "@/lib/schools/auth";
import { findSchoolSubscription, stopSchoolRenewal, type SchoolBillingRow } from "@/lib/billing/school-billing";

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
  const row = data as SchoolBillingRow | null;
  if (!row?.provider_customer_id || !row.plan_code) {
    return Response.json({ error: "There's no paid plan on this school to change." }, { status: 404 });
  }

  if (action === "update_card") {
    try {
      const live = findSchoolSubscription((await fetchCustomer(row.provider_customer_id)).subscriptions, row);
      if (!live) {
        return Response.json({ error: "We couldn't find this school's subscription at Paystack." }, { status: 404 });
      }
      const { link } = await manageSubscriptionLink(live.subscription_code);
      return Response.json({ url: link });
    } catch (err) {
      console.error("schools/billing: manage link failed", err);
      return Response.json({ error: "Paystack didn't answer. Please try again shortly." }, { status: 502 });
    }
  }

  // ── Cancel: stop renewing, keep what has been paid for ──────────────────────
  const admin = createAdminClient();
  if (!admin) {
    console.error("schools/billing: SUPABASE_SERVICE_ROLE_KEY not set; cannot record a cancellation");
    return Response.json({ error: "Billing isn't fully configured on this deployment." }, { status: 500 });
  }
  const stopped = await stopSchoolRenewal(admin, schoolId);
  if (!stopped.ok) return Response.json({ error: stopped.message }, { status: stopped.status });
  return Response.json({ ok: true, accessUntil: stopped.periodEnd });
}
