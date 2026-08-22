import type { SubscriptionTier } from "@/types";

/**
 * The subscription-row → tier rule, defined once and shared by both sides.
 *
 * This module must stay dependency-free apart from types: the SERVER resolves
 * money through it (`entitlements.server.ts`, `/api/billing/status`) while the
 * CLIENT resolves its *display* copy through it
 * (`src/lib/supabase/account.ts`), so importing "server-only" here would break
 * the browser build. The rule being literally the same code is the point — a
 * second hand-rolled copy is how the two sides drift.
 */

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
