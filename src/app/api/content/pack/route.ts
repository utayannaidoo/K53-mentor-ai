import { QUESTIONS } from "@/lib/content/questions";
import { FLASHCARDS } from "@/lib/content/flashcards";
import { SCENARIOS } from "@/lib/content/scenarios";
import { DRIVER_MODULES } from "@/lib/content/driver-modules";
import { CONTENT_VERSION } from "@/lib/content/meta";
import { clientIp, limitContent, limitUserDaily } from "@/lib/ai/rate-limit";
import { resolveTier } from "@/lib/billing/entitlements.server";
import { hasFeature, isPaidTier } from "@/lib/billing/plans";

export const runtime = "nodejs";

/**
 * The full content bank, for subscribers.
 *
 * Only the starter pack (src/lib/content/starter.ts) ships in the browser
 * bundle. Everything else — the full 1,296 questions, 974 flashcards, 68
 * scenarios, plus the licence-prep modules where the plan includes them —
 * comes from here, behind the same server-side tier check that guards AI
 * spend. This is what makes the paywall real: before it, every gate was
 * `hasFeature(state.tier, …)` read from localStorage, so the whole product was
 * one devtools window away.
 *
 * Served whole rather than paginated, because the client caches it and studies
 * from it offline. The selectors need the entire eligible pool in memory to
 * rank it by freshness against the learner's attempt history, and that history
 * lives in the browser (CLAUDE.md rule 3) — so slicing this into pages would
 * mean shipping attempt history up on every request and moving selection to the
 * server, for no benefit.
 *
 * Entitlement-aware caching (see src/lib/content/pack-cache.ts): every response
 * carries an `entitlement.expiresAt` stamp — how long the client may keep serving its
 * cached copy without re-checking with the server. The client must probe this
 * route (`?probe=1`) before trusting a cached copy; a lapsed subscription then
 * ends cached access within ENTITLEMENT_GRACE_MS instead of never. The stamp is a
 * deadline, not a token: it grants nothing by itself, because the cache is only
 * ever unlocked by a live server answer or a not-yet-expired stamp issued by
 * this route while the account was paid.
 *
 * Premium vs Premium Plus: the yard-test modules are a Plus feature
 * (`licencePrep`, listed as such on the pricing page), so they are filtered out
 * of a Premium response rather than shipped and hidden in the UI — if the
 * browser receives bytes, assume the buyer will read them.
 */

/** Per-account sync ceiling. Generous for real devices, tight for a scraper. */
const SYNCS_PER_DAY = 10;

/**
 * How long a downloaded pack may be trusted offline. The server owns this
 * number outright: it stamps `entitlement.expiresAt` on every probe/download,
 * and the client (pack-cache.ts) only ever compares its cached grant against
 * that server-supplied deadline — it computes no grace of its own. One
 * constant, one author.
 */
const ENTITLEMENT_GRACE_MS = 72 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const probe = new URL(req.url).searchParams.get("probe") === "1";

  // Per-IP guard first, before auth's round-trips — the ordering every other
  // route in this app uses. Probes are cheap but authenticated, so they ride
  // the same IP limiter as everything else here.
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

  // Any paid tier gets the study bank. Note this is NOT a FeatureKey check:
  // the individual flags split Premium from Premium Plus (advancedAnalytics and
  // licencePrep are Plus-only), so gating the whole bank on one would have
  // quietly denied every Premium subscriber their questions. The Plus-only
  // *pieces* are filtered below instead.
  if (!isPaidTier(resolved.tier)) {
    return Response.json({ error: "upgrade_required", tier: resolved.tier }, { status: 403 });
  }

  // The grace deadline both response shapes carry: from now, the client may
  // serve its cached copy offline until this moment, but no further, without a
  // fresh server confirmation.
  const expiresAt = new Date(Date.now() + ENTITLEMENT_GRACE_MS).toISOString();

  // ── Entitlement probe: "am I still paid?" without the megabytes ────────────
  // One auth round-trip + one subscriptions read, answered before any content
  // is touched. The client runs this before every cached-pack read, which is
  // what makes stale localStorage tiers worthless as authorization.
  if (probe) {
    return Response.json(
      {
        version: CONTENT_VERSION,
        tier: resolved.tier,
        modules: hasFeature(resolved.tier, "licencePrep"),
        entitlement: { expiresAt },
      },
      { headers: { "cache-control": "private, max-age=0, must-revalidate" } },
    );
  }

  // ── Full bank ───────────────────────────────────────────────────────────────
  // Per-account ceiling on top of the per-IP one. A device syncs once and then
  // serves from cache, so anything approaching this is scraping — and being
  // keyed by account is what makes that attributable. (Probes skip it: they
  // are the cheap heartbeat, not a sync.)
  if (resolved.userId) {
    const cap = await limitUserDaily("content", resolved.userId, SYNCS_PER_DAY);
    if (!cap.success) {
      return Response.json(
        { error: "sync_cap", retryAfter: cap.retryAfter },
        { status: 429, headers: { "Retry-After": String(cap.retryAfter) } },
      );
    }
  }

  // Yard-test modules are Premium Plus content (`licencePrep`). Premium still
  // gets the entire question/flashcard/scenario bank — that is the point of the
  // regression guard above — but not the one piece of the catalogue its plan
  // does not include.
  const modules = hasFeature(resolved.tier, "licencePrep") ? DRIVER_MODULES : [];

  return Response.json(
    {
      version: CONTENT_VERSION,
      questions: QUESTIONS,
      flashcards: FLASHCARDS,
      scenarios: SCENARIOS,
      modules,
      entitlement: { expiresAt },
    },
    {
      headers: {
        // `private` is not optional: the response depends on who asked, so it
        // must never be stored by a shared CDN. The client caches it itself,
        // keyed on version + tier + owner.
        "cache-control": "private, max-age=0, must-revalidate",
      },
    },
  );
}
