import { QUESTIONS } from "@/lib/content/questions";
import { FLASHCARDS } from "@/lib/content/flashcards";
import { SCENARIOS } from "@/lib/content/scenarios";
import { DRIVER_MODULES } from "@/lib/content/driver-modules";
import { CONTENT_VERSION } from "@/lib/content/meta";
import { clientIp, limitContent, limitUserDaily } from "@/lib/ai/rate-limit";
import { resolveTier } from "@/lib/billing/entitlements.server";
import { isPaidTier } from "@/lib/billing/plans";

export const runtime = "nodejs";

/**
 * The full content bank, for subscribers.
 *
 * Only the starter pack (src/lib/content/starter.ts) ships in the browser
 * bundle. Everything else — the full 1,296 questions, 974 flashcards, 68 scenarios and
 * the licence-prep modules — comes from here, behind the same server-side tier
 * check that guards AI spend. This is what makes the paywall real: before it,
 * every gate was `hasFeature(state.tier, …)` read from localStorage, so the
 * whole product was one devtools window away.
 *
 * Served whole rather than paginated, because the client caches it and studies
 * from it offline. The selectors need the entire eligible pool in memory to
 * rank it by freshness against the learner's attempt history, and that history
 * lives in the browser (CLAUDE.md rule 3) — so slicing this into pages would
 * mean shipping attempt history up on every request and moving selection to the
 * server, for no benefit.
 */

/** Per-account sync ceiling. Generous for real devices, tight for a scraper. */
const SYNCS_PER_DAY = 10;

export async function GET(req: Request) {
  // Per-IP guard first, before auth's round-trips — the ordering every other
  // route in this app uses.
  const rl = await limitContent(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  // Server truth, shared with the AI routes. 401 when signed out; fails closed
  // to `free` on any lookup problem. Demo mode (no Supabase) resolves to
  // premium_plus with a null user, so a zero-config checkout still gets the
  // whole bank and CLAUDE.md rule 1 holds.
  const resolved = await resolveTier();
  if (resolved instanceof Response) return resolved;

  // Any paid tier gets the whole bank. Note this is NOT a FeatureKey check:
  // the individual flags split Premium from Premium Plus (licencePrep and
  // advancedAnalytics are Plus-only), so gating on one would have quietly
  // denied the bank to every Premium subscriber.
  if (!isPaidTier(resolved.tier)) {
    return Response.json({ error: "upgrade_required", tier: resolved.tier }, { status: 403 });
  }

  // Per-account ceiling on top of the per-IP one. A device syncs once and then
  // serves from cache, so anything approaching this is scraping — and being
  // keyed by account is what makes that attributable.
  if (resolved.userId) {
    const cap = await limitUserDaily("content", resolved.userId, SYNCS_PER_DAY);
    if (!cap.success) {
      return Response.json(
        { error: "sync_cap", retryAfter: cap.retryAfter },
        { status: 429, headers: { "Retry-After": String(cap.retryAfter) } },
      );
    }
  }

  return Response.json(
    {
      version: CONTENT_VERSION,
      questions: QUESTIONS,
      flashcards: FLASHCARDS,
      scenarios: SCENARIOS,
      modules: DRIVER_MODULES,
    },
    {
      headers: {
        // `private` is not optional: the response depends on who asked, so it
        // must never be stored by a shared CDN. The client caches it itself,
        // keyed on `version`.
        "cache-control": "private, max-age=0, must-revalidate",
      },
    },
  );
}
