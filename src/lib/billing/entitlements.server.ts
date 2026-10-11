import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertSupabaseConfiguredInProduction, isProductionRuntime, isSupabaseConfigured } from "@/lib/env";
import { tierFromSubscriptionRow, type SubscriptionRowLike } from "@/lib/billing/tier-rule";
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
  // free is 0 on tutor and vision: the AI is what a subscription buys, and an
  // ad-supported account earns cents a month, nowhere near a model call. The
  // free `coach` number is not a spend allowance at all (the coach route
  // answers free accounts from its local templates); it only bounds how often
  // a free account can hit that route in a day.
  // Cut to 10/20 on 11 Aug 2026 because Haiku 4.5 made the old 15/40 unaffordable
  // — a Premium Plus subscriber at their ceiling cost their whole R70 in tokens.
  // Restored the same day, to 15/35, when the fast tier moved to DeepSeek
  // V4-Flash at roughly a ninth the price: 35/day now costs ~$0.37/month against
  // R70 revenue, where 40/day on Haiku cost $3.90. The cap came down to fix a
  // margin, so a cheaper model is the thing that lets it go back up — see
  // docs/ops/ai-cost-model.md. Anthropic remains the fallback, and these numbers
  // are only affordable while DeepSeek is the one answering; if the cascade ever
  // falls back for a sustained period, revisit here first.
  tutor: { free: 0, premium: 15, premium_plus: 35 },
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
  // A production runtime with no Supabase has no accounts, so there is nobody
  // to attribute a model call to and nobody to bill it against — every caller
  // is anonymous and the URL is public. Refuse outright rather than fall
  // through to a tier. This is the money half of what used to be defended by
  // crashing the whole deployment at boot; the study app itself is unaffected.
  // Keyed on isProductionRuntime (any host), not Vercel alone — a production
  // build on another platform is just as anonymous and just as public.
  if (!isSupabaseConfigured && isProductionRuntime()) {
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
    // On any production runtime the same answer is an open product on a public
    // URL, which is what the boot guard in env.ts used to prevent by refusing to
    // start — and what it cost was every preview deployment, since previews
    // legitimately run without Supabase. Failing closed to `free` here gives
    // both: the preview boots and the app renders, but nothing paid is served
    // to callers who cannot be identified. Keyed on isProductionRuntime (any
    // host), not Vercel alone — see env.ts.
    return { userId: null, tier: isProductionRuntime() ? "free" : "premium_plus" };
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

/**
 * The row → tier rule lives in `src/lib/billing/tier-rule.ts`, dependency-free
 * so the CLIENT copy of the tier (src/lib/supabase/account.ts) can resolve
 * through the exact same code. Re-exported here because every server consumer
 * already imports it from this module.
 */
export { EXPIRY_GRACE_MS, tierFromSubscriptionRow, type SubscriptionRowLike } from "@/lib/billing/tier-rule";

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

/**
 * Give back a purchased top-up credit that bought nothing.
 *
 * A Premium Plus learner past their daily cap spends a credit to send one more
 * message. If the provider cascade then falls through to the study-notes
 * explainer, they paid for an AI answer and got the free one. Refunding the
 * *daily* allowance is no use here — it was already exhausted, which is why a
 * credit was spent in the first place — so the credit itself goes back.
 *
 * Reuses the same grant the Paystack webhook uses, so a refund and a purchase
 * land through one audited path. Best-effort: a failed refund leaves the burn
 * rather than failing the learner's reply.
 */
export async function refundTutorCredit(userId: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;
  try {
    const { error } = await admin.rpc("grant_tutor_credits", { p_user: userId, p_credits: 1 });
    if (error) console.error("tutor credit refund failed", error.message);
  } catch (err) {
    console.error("tutor credit refund threw", err);
  }
}
