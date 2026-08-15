import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isHostedProduction, isSupabaseConfigured } from "@/lib/env";
import { hasFeature } from "@/lib/billing/plans";
import { resolveTier } from "@/lib/billing/entitlements.server";

/**
 * Server-side gate for features that are built but not yet released.
 *
 * Two independent switches, both server-only so a tampered client can never
 * flip them:
 *
 * - `EYE_TEST_ALLOWLIST` — comma-separated emails that may preview the feature
 *   regardless of tier. This is how the owner reviews it in production before
 *   anyone else can reach it.
 * - `EYE_TEST_RELEASED=1` — opens the feature to its real audience
 *   (Premium Plus, via the `licencePrep` feature flag in plans.ts).
 *
 * With neither set the route 404s for everyone, which is the default. Note the
 * gate is a *route* gate, not a UX gate: unreleased pages must not merely hide
 * their link, they must not render at all, or the URL leaks the feature.
 */
export type PreviewAccess = "owner" | "entitled" | "denied";

function allowlist(): string[] {
  return (process.env.EYE_TEST_ALLOWLIST ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Exported so the page can tell "I'm in via the allowlist override" apart from
 * "the feature is actually live" — once EYE_TEST_RELEASED=1, an allowlisted
 * account (the owner's, or a support account added for debugging) still
 * resolves to "owner" below, and without this the page would keep showing a
 * stale "unreleased" banner forever.
 */
export const isEyeTestReleased = () => process.env.EYE_TEST_RELEASED === "1";

export async function resolveEyeTestAccess(): Promise<PreviewAccess> {
  // Demo mode: no Supabase, so no accounts and nothing to protect — locally.
  //
  // This used to lean on assertSupabaseConfiguredInProduction() throwing at
  // boot to make the branch unreachable on any hosted deploy. That guard is now
  // scoped to production (it was 500ing every preview), so "hosted without
  // Supabase" is a real state and has to be handled here rather than assumed
  // away: a public preview URL must not hand out an unreleased feature to
  // anyone who guesses the path. Denied is the same answer it gives every
  // other anonymous caller.
  if (!isSupabaseConfigured) return isHostedProduction() ? "denied" : "owner";

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  const email = user?.email?.toLowerCase();
  if (email && allowlist().includes(email)) return "owner";

  if (!isEyeTestReleased()) return "denied";

  const resolved = await resolveTier();
  // resolveTier hands back a 401 Response for signed-out callers; for a page
  // that is simply "no access".
  if (resolved instanceof Response) return "denied";
  return hasFeature(resolved.tier, "licencePrep") ? "entitled" : "denied";
}
