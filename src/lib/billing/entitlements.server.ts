import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertSupabaseConfiguredInProduction, isSupabaseConfigured } from "@/lib/env";
import { FREE_TRIAL_DAYS, PLAN_MAP } from "@/lib/billing/plans";
import type { SubscriptionTier } from "@/types";

// The demo-mode branch below grants premium_plus with no account. That must
// never be reachable on a hosted deploy.
assertSupabaseConfiguredInProduction();

/**
 * Server-side paid-tier enforcement for the AI routes.
 *
 * The client's tier (localStorage / study store) is display state only — a
 * tampered browser can change what the UI shows, never what these routes
 * serve. Tier truth is the `subscriptions` row, which only the Paystack
 * webhook writes (RLS blocks client writes), and every AI call resolves it
 * fresh here.
 */

export type AiSurface = "tutor" | "coach" | "vision";

/**
 * Per-user daily AI allowances by tier — the money guard behind the plan
 * caps in plans.ts. Tutor mirrors PlanLimits.tutorMessages; coach covers the
 * automatic recap/rationale/second-opinion calls a day of studying at that
 * tier can legitimately produce; vision is paid-only (0 = feature locked).
 */
const DAILY_ALLOWANCE: Record<AiSurface, Record<SubscriptionTier, number>> = {
  // free mirrors PlanLimits.tutorMessages. The client additionally stops
  // refilling once the 7-day trial window is up; this stays a plain per-day
  // ceiling because it is a cost guard, not the product rule — and a per-day
  // ceiling is strictly tighter than what the old lifetime-vs-daily mismatch
  // allowed, where a free account could spend 3 messages every single day
  // server-side while the client believed the pool was lifetime.
  // Lowered from 15/40 on 11 Aug 2026. At Haiku 4.5 rates a subscriber who used
  // the old Premium Plus allowance every day cost about their whole R70
  // subscription in tokens, and Premium about 44% of R60 — see
  // docs/ops/ai-cost-model.md. 20/day is still more tutor than a ten-minute
  // study session uses; the ceiling was never the product, only the guard.
  tutor: { free: 2, premium: 10, premium_plus: 20 },
  coach: { free: 12, premium: 60, premium_plus: 100 },
  vision: { free: 0, premium: 12, premium_plus: 25 },
};

export interface Entitlement {
  /** null only in demo mode (no Supabase configured, so no accounts exist). */
  userId: string | null;
  tier: SubscriptionTier;
  /** Requests this user may make on this surface today. */
  allowance: number;
}

/**
 * Resolve the caller's entitlement for an AI surface, or an error Response.
 *
 * - Demo mode (no Supabase env): no accounts exist; the generous premium_plus
 *   allowance applies and the per-IP limits remain the only real guard.
 * - Production: requires a session (401), reads tier from `subscriptions`.
 *   A missing row, inactive status, or lookup failure all resolve to `free`
 *   — entitlement fails closed, never open.
 */
export async function resolveEntitlement(surface: AiSurface): Promise<Entitlement | Response> {
  const resolved = await resolveTier();
  if (resolved instanceof Response) return resolved;
  return { ...resolved, allowance: DAILY_ALLOWANCE[surface][resolved.tier] };
}

/** Who is calling and what they've paid for, with no surface-specific allowance. */
export interface ResolvedTier {
  /** null only in demo mode (no Supabase configured, so no accounts exist). */
  userId: string | null;
  tier: SubscriptionTier;
}

/**
 * The server's answer to "what has this caller paid for", shared by the AI
 * routes and the content pack.
 *
 * Extracted from resolveEntitlement so the content paywall is enforced by the
 * exact same lookup that already guards AI spend, rather than a second
 * implementation that could drift from it. Same posture throughout: a missing
 * row, an inactive status or a failed lookup all resolve to `free`, never open.
 */
export async function resolveTier(): Promise<ResolvedTier | Response> {
  if (!isSupabaseConfigured) {
    return { userId: null, tier: "premium_plus" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!user || !supabase) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let tier: SubscriptionTier = "free";
  try {
    const { data } = await supabase
      .from("subscriptions")
      .select("tier,status")
      .eq("user_id", user.id)
      .maybeSingle();
    const row = data as { tier: SubscriptionTier; status: string } | null;
    // past_due = failed renewal inside Paystack's retry window — a grace
    // state. The hard cutoff is subscription.disable → tier back to free.
    if (row && (row.status === "active" || row.status === "trialing" || row.status === "past_due")) {
      tier = row.tier;
    }
  } catch {
    // Fail closed: an unreadable subscription is a free one.
  }

  return { userId: user.id, tier };
}

const DAY_MS = 86_400_000;

/**
 * Is this free account still inside its free week?
 *
 * The free tier *is* the trial (`PLAN_MAP.free.limits.trialDays`), so `tier ===
 * "free"` on its own doesn't separate a prospect three days into evaluating the
 * product from an account that lapsed months ago. Callers that want to spend
 * money on someone — a real model call rather than the rule-based explainer —
 * need that distinction.
 *
 * Deliberately mirrors `trialStartedAt()` in `src/lib/billing/trial.ts`, which
 * anchors on the **earliest** timestamp it can see. That client function is
 * what renders "3 days left in your free week"; if the server resolved the
 * window differently, the banner and the tutor would disagree about the same
 * seven days, which is worse than either answer alone.
 *
 * `created_at` is normally the floor (it is `not null` and precedes onboarding),
 * but `onboarded_at` is read too so a profile row that was ever backfilled or
 * recreated can't hand someone a second free week.
 *
 * **Forgiving on failure, unlike the tier lookup above.** A missing profile, an
 * unreadable one, or no admin client all resolve to *within* trial — matching
 * the client, which treats an unanchored week as untouched rather than expired.
 * The asymmetry is deliberate: `resolveTier` fails closed because it decides
 * what someone paid for, whereas this only decides which engine answers a
 * message that is already capped at `DAILY_ALLOWANCE.tutor.free` a day. Failing
 * closed here would silently serve the worse tutor to new signups during an
 * outage — the exact people the week exists to convince.
 */
export async function isWithinFreeTrial(userId: string, now = Date.now()): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return true;

  const days = PLAN_MAP.free.limits.trialDays ?? FREE_TRIAL_DAYS;
  try {
    const { data } = await admin
      .from("profiles")
      .select("onboarded_at,created_at")
      .eq("id", userId)
      .maybeSingle();
    const row = data as { onboarded_at: string | null; created_at: string | null } | null;
    if (!row) return true;

    const started = [row.created_at, row.onboarded_at]
      .map((v) => (typeof v === "string" ? Date.parse(v) : NaN))
      .filter((t) => Number.isFinite(t));
    if (started.length === 0) return true;

    return now - Math.min(...started) < days * DAY_MS;
  } catch {
    return true;
  }
}

/**
 * Spend one purchased tutor top-up credit. Credits are granted only by the
 * Paystack webhook and decremented atomically by an RPC the client roles can't
 * execute — returns false when the balance is zero or anything fails.
 */
export async function spendTutorCredit(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;
  try {
    const { data, error } = await admin.rpc("use_tutor_credit", { p_user: userId });
    return !error && data === true;
  } catch {
    return false;
  }
}
