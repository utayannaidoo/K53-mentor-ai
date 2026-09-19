import { z } from "zod";
import { isPaystackConfigured, isSupabaseConfigured } from "@/lib/env";
import { clientIp, limitCheckout } from "@/lib/ai/rate-limit";
import { initializeTransaction } from "@/lib/paystack/client";
import { callbackOrigin } from "@/lib/billing/callback-origin";
import { reportCheckoutFailure } from "@/lib/ops/checkout-alert";
import { requireSchool } from "@/lib/schools/auth";
import {
  isSchoolBillingConfigured,
  SCHOOL_PLAN_ENV_KEYS,
  schoolChargeCents,
  schoolPlanCodeFor,
} from "@/lib/billing/school-billing";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Paystack hosted checkout for a school plan — the school product's twin of
 * /api/checkout, with the same rules:
 *
 *  - a signed-in user, and specifically the school's OWNER: the person who
 *    pays is the person who can lose the workspace;
 *  - the price and the Plan code are server constants — nothing the browser
 *    sends is trusted beyond "which plan, which cycle";
 *  - the charge is bound to the school in metadata (kind, school_id), which is
 *    how applyChargeSuccess routes it to school_subscriptions and never to the
 *    learner `subscriptions` table (src/lib/billing/school-billing.ts);
 *  - with no Plan code configured it refuses rather than taking money that
 *    could not be granted.
 */

const schema = z.object({
  plan: z.enum(["solo", "team", "fleet"]),
  cycle: z.enum(["monthly", "annual"]).default("monthly"),
});

/**
 * Boot-time audit, the school twin of the learner route's. Having NO school
 * codes is the normal state until the product launches, so that is silent;
 * having SOME is a half-finished deploy, and the first owner to reach for a
 * missing one would find out mid-purchase.
 */
if (isPaystackConfigured && isSchoolBillingConfigured()) {
  const missing = SCHOOL_PLAN_ENV_KEYS.filter((k) => !process.env[k]?.trim());
  if (missing.length > 0) {
    console.error(
      `[billing] Some school Plan codes are set but these are missing: ${missing.join(", ")}. ` +
        "Checkout for those school plans will refuse until they are set.",
    );
  }
}

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

  if (!isPaystackConfigured || !isSupabaseConfigured) {
    return Response.json({ error: "Billing isn't available in the demo.", demo: true }, { status: 501 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!supabase || !user?.email) {
    return Response.json({ error: "Sign in again to continue." }, { status: 401 });
  }

  const guard = await requireSchool({ roles: ["owner"] });
  if (!guard.ok) return Response.json({ error: guard.message }, { status: 403 });
  const school = guard.school;

  const planCode = schoolPlanCodeFor(parsed.plan, parsed.cycle);
  if (!planCode) {
    // Not the buyer's problem and not retryable, so say so plainly. No ops
    // alert when NO school code exists — that is simply "not launched yet".
    if (isSchoolBillingConfigured()) {
      reportCheckoutFailure({
        reason: "plan_code_missing",
        plan: `school ${parsed.plan}`,
        cycle: parsed.cycle,
        userId: user.id,
        product: "school",
      });
    }
    return Response.json(
      { error: "Paid plans aren't switched on yet. Your trial carries on in the meantime.", fault: "ours" },
      { status: 503 },
    );
  }

  // Buying the plan that is already running would start a second Paystack
  // subscription on the same plan, billing the school twice every month.
  // (A plan that is set to end is fine to buy again: that is how it resumes.)
  const { data: current } = await supabase
    .from("school_subscriptions")
    .select("status, plan_code, cancel_at_period_end")
    .eq("school_id", school.schoolId)
    .maybeSingle();
  const running = current as { status: string; plan_code: string | null; cancel_at_period_end: boolean } | null;
  if (
    running &&
    (running.status === "active" || running.status === "past_due") &&
    !running.cancel_at_period_end &&
    running.plan_code === planCode
  ) {
    return Response.json({ error: "You're already on this plan." }, { status: 409 });
  }

  try {
    const { authorization_url } = await initializeTransaction({
      email: user.email,
      // Paystack rejects an initialize without an amount even when a Plan sets
      // the recurring price; send the Plan's own amount so the two agree.
      amount: schoolChargeCents(parsed.plan, parsed.cycle),
      plan: planCode,
      callback_url: `${callbackOrigin(req)}/schools/settings?billing=success`,
      metadata: {
        kind: "school_subscription",
        school_id: school.schoolId,
        plan: parsed.plan,
        cycle: parsed.cycle,
        // Who clicked: the shared verify route only confirms a charge for the
        // person whose checkout it was. Never used to grant anything learner-side.
        user_id: user.id,
      },
    });
    return Response.json({ url: authorization_url });
  } catch (err) {
    console.error("schools/checkout: paystack error", err);
    reportCheckoutFailure({
      reason: "paystack_error",
      plan: `school ${parsed.plan}`,
      cycle: parsed.cycle,
      userId: user.id,
      err,
      product: "school",
    });
    return Response.json({ error: "Checkout could not start. Please try again.", fault: "ours" }, { status: 502 });
  }
}
