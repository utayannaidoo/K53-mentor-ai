import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AiSurface } from "@/lib/billing/entitlements.server";
import type { SubscriptionTier } from "@/types";

/**
 * Record one AI request against the per-user daily aggregate (migration 0021).
 *
 * ── Why this is worth a round trip ──────────────────────────────────────────
 *
 * Three documents in docs/ops say some version of "instrument per-user message
 * counts before touching the caps again", and the caps have since been changed
 * twice in one day on estimates alone. Upstash counts the same requests, but as
 * a rate limiter: its keys expire within about a day, so nothing accumulates
 * into a trend. This is the durable half, and it is the only thing that can
 * distinguish "the cap is generous" from "we have never looked".
 *
 * ── Never blocks, never throws ──────────────────────────────────────────────
 *
 * Awaited rather than fired and forgotten, because a serverless function can be
 * frozen the moment it returns and a dropped write is a silent hole in the
 * data. It is one upsert on a primary key, so the cost is a single round trip
 * on a route that already makes several.
 *
 * Every failure is swallowed. Analytics must never be the reason a paying
 * learner cannot ask a question — if this table is unreachable, the right
 * outcome is missing data, not a broken tutor.
 *
 * Demo mode (no service-role key) no-ops: there are no accounts to attribute
 * anything to.
 */
export async function recordAiUsage(args: {
  surface: AiSurface;
  /** Null in demo mode — nothing is recorded. */
  userId: string | null;
  tier: SubscriptionTier;
  /** True when the request was refused for exceeding the daily allowance. */
  capped: boolean;
}): Promise<void> {
  if (!args.userId) return;
  const admin = createAdminClient();
  if (!admin) return;

  try {
    const { error } = await admin.rpc("record_ai_usage", {
      p_user: args.userId,
      p_surface: args.surface,
      p_tier: args.tier,
      p_capped: args.capped,
    });
    // Logged, not thrown. A missing migration or a permissions slip should be
    // visible in the function logs rather than mistaken for "nobody uses the
    // tutor" six weeks from now, when this data is what a cap change rests on.
    if (error) console.error("recordAiUsage failed", args.surface, error.message);
  } catch (err) {
    console.error("recordAiUsage threw", args.surface, err);
  }
}
