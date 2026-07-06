import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import type { SubscriptionTier } from "@/types";

/**
 * Server-side paid-tier enforcement for the AI routes.
 *
 * The client's tier (localStorage / study store) is display state only — a
 * tampered browser can change what the UI shows, never what these routes
 * serve. Tier truth is the `subscriptions` row, which only the Stripe
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
  tutor: { free: 3, premium: 15, premium_plus: 40 },
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
  if (!isSupabaseConfigured) {
    return { userId: null, tier: "premium_plus", allowance: DAILY_ALLOWANCE[surface].premium_plus };
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
    if (row && (row.status === "active" || row.status === "trialing")) {
      tier = row.tier;
    }
  } catch {
    // Fail closed: an unreadable subscription is a free one.
  }

  return { userId: user.id, tier, allowance: DAILY_ALLOWANCE[surface][tier] };
}

/**
 * Spend one purchased tutor top-up credit. Credits are granted only by the
 * Stripe webhook and decremented atomically by an RPC the client roles can't
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
