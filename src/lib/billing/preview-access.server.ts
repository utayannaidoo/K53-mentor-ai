import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isProductionRuntime, isSupabaseConfigured } from "@/lib/env";

/**
 * Server-side gate for features that are built but not yet released.
 *
 * Two independent switches, both server-only so a tampered client can never
 * flip them:
 *
 * - `EYE_TEST_ALLOWLIST` — comma-separated emails that may preview the feature
 *   before it is released. This is how the owner reviews it in production
 *   before anyone else can reach it.
 * - `EYE_TEST_RELEASED=1` — opens the feature to its real audience: every
 *   signed-in learner, on any tier. The screener is free — it is a DLTC admin
 *   step, not study content, so no plan gates it.
 *
 * With neither set the route 404s for everyone who was never shown the feature,
 * which is the default. The gate is a *route* gate, not a UX gate: an unreleased
 * page must not merely hide its link, it must not render at all, or the URL
 * leaks the feature.
 *
 * The one exception is a signed-in learner, who resolves to "coming-soon"
 * instead: /licence-prep links them to the screener, so a 404 at the end of one
 * of our own links is a dead end rather than a secret. See resolveEyeTestAccess.
 */
export type PreviewAccess = "owner" | "entitled" | "coming-soon" | "denied";

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
  // other anonymous caller. Keyed on isProductionRuntime (any host), not Vercel
  // alone — a production build on another platform is equally public.
  if (!isSupabaseConfigured) return isProductionRuntime() ? "denied" : "owner";

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  const email = user?.email?.toLowerCase();
  if (email && allowlist().includes(email)) return "owner";

  // Having an account is the whole entitlement: the screener is free on every
  // tier. It used to be gated on `licencePrep` and sold in the Premium Plus
  // perk list, which is why `resolveTier()` was called here — now that the
  // answer does not depend on what anyone paid, `getUser()` above has already
  // established the only fact this needs, and asking again would cost a second
  // auth round-trip plus a `subscriptions` read on every page load.
  //
  // A signed-out caller still gets nothing, so the URL does not advertise the
  // feature to the open web while it is dark.
  if (!user) return "denied";

  // Released decides *what* a signed-in learner sees, not whether they exist
  // to us. The check used to come first and 404'd everyone when the flag was
  // off — but /licence-prep draws these learners an Eye test tile, so a 404
  // was not keeping a secret, it was a dead end at the end of our own link.
  return isEyeTestReleased() ? "entitled" : "coming-soon";
}
