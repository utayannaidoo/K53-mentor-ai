import { QUESTIONS } from "@/lib/content/questions";
import { FLASHCARDS } from "@/lib/content/flashcards";
import { SCENARIOS } from "@/lib/content/scenarios";
import { DRIVER_MODULES } from "@/lib/content/driver-modules";
import { CONTENT_VERSION } from "@/lib/content/meta";
import { clientIp, limitContent, limitContentProbe, limitUserDaily } from "@/lib/ai/rate-limit";
import { resolveTier } from "@/lib/billing/entitlements.server";

export const runtime = "nodejs";

/**
 * The full content bank, for every signed-in learner.
 *
 * Only the starter pack (src/lib/content/starter.ts) ships in the browser
 * bundle. Everything else — the full question, flashcard and scenario bank and
 * the licence-prep modules — comes from here. The bank is free on every plan
 * (the free tier is ad-supported; a subscription buys the AI and no ads), so
 * this route no longer checks what the caller paid for. It still requires an
 * account: that is what keeps a sync attributable and lets the per-account
 * ceiling below tell a learner's devices from a scraper.
 *
 * Served whole rather than paginated, because the client caches it and studies
 * from it offline. The selectors need the entire eligible pool in memory to
 * rank it by freshness against the learner's attempt history, and that history
 * lives in the browser (CLAUDE.md rule 3) — so slicing this into pages would
 * mean shipping attempt history up on every request and moving selection to the
 * server, for no benefit.
 *
 * Caching (see src/lib/content/pack-cache.ts): every response carries an
 * `entitlement.expiresAt` stamp — how long the client may keep serving its
 * cached copy without re-checking with the server. The client probes this route
 * (`?probe=1`) before trusting a cached copy, which is what ties a cached pack
 * to a live session rather than to whatever this browser last stored.
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
  // route in this app uses. Probes and full downloads are capped separately:
  // a probe is the cheap heartbeat ordinary browsing repeats all day, and
  // sharing the tight sync bucket starved it (429 → grace path) on
  // carrier-grade NAT addresses within minutes of normal use.
  const rl = await (probe ? limitContentProbe(clientIp(req)) : limitContent(clientIp(req)));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  // 401 when signed out. Demo mode (no Supabase) resolves with a null user, so
  // a zero-config checkout still gets the whole bank and CLAUDE.md rule 1 holds.
  const resolved = await resolveTier();
  if (resolved instanceof Response) return resolved;

  // The grace deadline both response shapes carry: from now, the client may
  // serve its cached copy offline until this moment, but no further, without a
  // fresh server confirmation.
  const expiresAt = new Date(Date.now() + ENTITLEMENT_GRACE_MS).toISOString();

  // ── Probe: "am I still signed in, and on which plan?" without the megabytes ─
  // One auth round-trip + one subscriptions read, answered before any content
  // is touched. The client runs this before every cached-pack read.
  if (probe) {
    return Response.json(
      {
        version: CONTENT_VERSION,
        tier: resolved.tier,
        modules: true,
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

  return Response.json(
    {
      version: CONTENT_VERSION,
      questions: QUESTIONS,
      flashcards: FLASHCARDS,
      scenarios: SCENARIOS,
      modules: DRIVER_MODULES,
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
