import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertSupabaseConfiguredInProduction, isHostedProduction, isSupabaseConfigured } from "@/lib/env";
import { FREE_TRIAL_DAYS, PLAN_MAP } from "@/lib/billing/plans";
import type { SubscriptionTier } from "@/types";

// Production must never ship without Supabase. Previews may — they are inert
// without it, because the demo branches below are gated on the runtime rather
// than on this throw. See resolveTier.
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
  // Cut to 10/20 on 11 Aug 2026 because Haiku 4.5 made the old 15/40 unaffordable
  // — a Premium Plus subscriber at their ceiling cost their whole R70 in tokens.
  // Restored the same day, to 15/35, when the fast tier moved to DeepSeek
  // V4-Flash at roughly a ninth the price: 35/day now costs ~$0.37/month against
  // R70 revenue, where 40/day on Haiku cost $3.90. The cap came down to fix a
  // margin, so a cheaper model is the thing that lets it go back up — see
  // docs/ops/ai-cost-model.md. Anthropic remains the fallback, and these numbers
  // are only affordable while DeepSeek is the one answering; if the cascade ever
  // falls back for a sustained period, revisit here first.
  tutor: { free: 2, premium: 15, premium_plus: 35 },
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
  // A hosted deploy with no Supabase has no accounts, so there is nobody to
  // attribute a model call to and nobody to bill it against — every caller is
  // anonymous and the URL is public. Refuse outright rather than fall through
  // to a tier. This is the money half of what used to be defended by crashing
  // the whole deployment at boot; the study app itself is unaffected.
  if (!isSupabaseConfigured && isHostedProduction()) {
    return Response.json({ error: "AI is unavailable on this deployment." }, { status: 503 });
  }
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
    // Demo mode's open `premium_plus` is a *local* convenience: no accounts
    // exist, so there is nothing to protect and everything should be visible.
    //
    // On a hosted runtime the same answer is an open product on a public URL,
    // which is what the boot guard in env.ts used to prevent by refusing to
    // start — and what it cost was every preview deployment, since previews
    // legitimately run without Supabase. Failing closed to `free` here gives
    // both: the preview boots and the app renders, but nothing paid is served
    // to callers who cannot be identified.
    return { userId: null, tier: isHostedProduction() ? "free" : "premium_plus" };
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
      .select("tier,status,cancel_at_period_end,current_period_end")
      .eq("user_id", user.id)
      .maybeSingle();
    tier = tierFromSubscriptionRow(
      data as SubscriptionRowLike | null,
      Date.now(),
    );
  } catch {
    // Fail closed: an unreadable subscription is a free one.
  }

  return { userId: user.id, tier };
}

const DAY_MS = 86_400_000;

/**
 * How far past `current_period_end` a still-"active" row is treated as expired.
 *
 * Paystack charges ON the renewal date, and a card retry can leave the stored
 * end date stale by a day or two while the customer is still current — so the
 * cutoff needs slack. Three days covers that retry window; anything longer is
 * a subscription Paystack has stopped renewing but whose `subscription.disable`
 * event we never received (dropped webhook, ledger gap). Without this check
 * such a row resolves paid forever.
 */
export const EXPIRY_GRACE_MS = 3 * DAY_MS;

export interface SubscriptionRowLike {
  tier: SubscriptionTier;
  status: string;
  cancel_at_period_end: boolean | null;
  current_period_end: string | null;
}

/**
 * Resolve a `subscriptions` row to the tier it entitles, right now.
 *
 * Rules, in order:
 *  - only active / trialing / past_due statuses carry a paid tier at all;
 *  - a row flagged `cancel_at_period_end` expires the moment its period ends —
 *    no grace, because the learner was told access stops on that date;
 *  - ANY paid row whose period ended more than EXPIRY_GRACE_MS ago expires too,
 *    flag or no flag. This is the backstop for a missed
 *    `subscription.disable`: before it existed, an `active` row with a stale
 *    date resolved paid forever.
 */
export function tierFromSubscriptionRow(
  row: SubscriptionRowLike | null,
  now = Date.now(),
): SubscriptionTier {
  let tier: SubscriptionTier = "free";
  if (row && (row.status === "active" || row.status === "trialing" || row.status === "past_due")) {
    tier = row.tier;
  }
  if (tier === "free" || !row?.current_period_end) return tier;

  const endsAt = Date.parse(row.current_period_end);
  if (!Number.isFinite(endsAt)) return tier;

  if (row.cancel_at_period_end && now >= endsAt) return "free";
  if (now >= endsAt + EXPIRY_GRACE_MS) return "free";
  return tier;
}

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
