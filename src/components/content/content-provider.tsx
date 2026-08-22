"use client";

import * as React from "react";
import type { DriverModule, Flashcard, Question, Scenario, SubscriptionTier } from "@/types";
import { isPaidTier } from "@/lib/billing/plans";
import { useStudyStore } from "@/hooks/use-study-store";
import {
  mayServeCached,
  purgePackCache,
  readCachedPack,
  readEntitlementGrant,
  writeCachedPack,
  writeEntitlementGrant,
  type Pack,
  type PackCacheScope,
} from "@/lib/content/pack-cache";
import {
  STARTER_QUESTIONS,
  STARTER_FLASHCARDS,
  STARTER_SCENARIOS,
} from "@/lib/content/starter";
import { CONTENT_VERSION } from "@/lib/content/meta";

/**
 * Where study content comes from.
 *
 * The browser bundle carries only the starter pack. The full bank — everything
 * a subscription pays for — is fetched once from /api/content/pack and kept in
 * Cache Storage, so it is downloaded on a device once rather than shipped to
 * every visitor on every route.
 *
 * The starter pack is available synchronously, which is the point: there is no
 * loading state on first paint, free learners never wait for a network call,
 * and a paid learner studies immediately while the rest arrives behind them.
 * Planning does not depend on any of this — due counts, today's plan, mastery
 * and CP all read the generated index in meta.ts — so only the surfaces that
 * actually render an item consume this.
 *
 * Entitlement-aware caching: the client's own tier (localStorage) decides
 * nothing here except whether to bother syncing at all. Every cached read goes
 * through the pack-cache module, which requires either a live server probe or
 * an unexpired server-stamped grant — see pack-cache.ts for why. A lapsed
 * subscription therefore loses its cached bank within days even if this
 * browser's stored tier still says "premium", and a manipulated one never
 * gains it.
 */

export type ContentStatus = "starter" | "syncing" | "full" | "error" | "paused";

export interface ContentPool {
  questions: Question[];
  flashcards: Flashcard[];
  scenarios: Scenario[];
  /**
   * Yard-test modules with their steps. Empty until synced — the licence-prep
   * *list* renders from the bundled MODULE_META regardless, so only the
   * step-by-step guide waits on this.
   */
  modules: DriverModule[];
  /** True once the full bank is in memory. */
  full: boolean;
  status: ContentStatus;
  /** Manual trigger, for the data-saver path and for retrying after an error. */
  sync: () => void;
}

interface PackResponse extends Pack {
  entitlement?: { expiresAt?: string };
}

interface ProbeResponse {
  version: string;
  tier: string;
  modules: boolean;
  entitlement?: { expiresAt?: string };
}

const STARTER: Pick<ContentPool, "questions" | "flashcards" | "scenarios" | "modules"> = {
  questions: STARTER_QUESTIONS,
  flashcards: STARTER_FLASHCARDS,
  scenarios: STARTER_SCENARIOS,
  // No bundled modules at all: every step of every guide is Premium Plus
  // content, and the list page renders from metadata instead.
  modules: [],
};

/** Outcome of one load attempt against the server + cache. */
type LoadOutcome =
  | { kind: "full"; pack: Pack }
  | { kind: "cached"; pack: Pack }
  | { kind: "denied" } // server says not paid — purge and drop to starter
  | { kind: "unavailable" }; // could not confirm and no usable cache

const ContentContext = React.createContext<ContentPool | null>(null);

/**
 * One entitlement check + cache-or-fetch decision. Exported for tests; pure
 * with respect to its injected fetchers.
 */
export async function loadPack(
  scope: PackCacheScope,
  doFetch: typeof fetch,
  now = Date.now(),
): Promise<LoadOutcome> {
  // Ask the server first — always. Even when a cache exists: this is what
  // makes the browser's own tier state worthless as authorization.
  try {
    const res = await doFetch("/api/content/pack?probe=1");
    if (res.ok) {
      const probe = (await res.json()) as ProbeResponse;
      if (!isPaidTier(probe.tier as SubscriptionTier)) return { kind: "denied" };
      const expiresAt = Date.parse(probe.entitlement?.expiresAt ?? "") || now;
      const grant = {
        version: CONTENT_VERSION,
        tier: probe.tier,
        expiresAt: Number.isFinite(expiresAt) ? expiresAt : now,
      };
      await writeEntitlementGrant(scope.ownerId, grant);

      const cached = await readCachedPack(scope);
      if (cached) return { kind: "cached", pack: cached };

      return await fetchFull(scope, doFetch);
    }
    if (res.status === 401 || res.status === 403) {
      // Authoritative: signed out or no longer entitled. The cached copy of
      // paid content must go with it.
      return { kind: "denied" };
    }
    // 429/5xx — the server spoke but cannot answer properly right now. Fall
    // through to the offline-grace path rather than locking a paying learner
    // out during a blip.
  } catch {
    // Network unreachable — offline path below.
  }

  const grant = await readEntitlementGrant(scope.ownerId);
  const cached = await readCachedPack(scope);
  if (mayServeCached(grant, scope, now, false) && cached) {
    return { kind: "cached", pack: cached };
  }
  return { kind: "unavailable" };
}

async function fetchFull(scope: PackCacheScope, doFetch: typeof fetch): Promise<LoadOutcome> {
  const res = await doFetch("/api/content/pack");
  if (!res.ok) return { kind: "unavailable" };
  const fresh = (await res.json()) as PackResponse;
  const expiresAt = Date.parse(fresh.entitlement?.expiresAt ?? "");
  await writeCachedPack(fresh, scope);
  if (Number.isFinite(expiresAt)) {
    await writeEntitlementGrant(scope.ownerId, {
      version: fresh.version,
      tier: scope.tier,
      expiresAt,
    });
  }
  return { kind: "full", pack: fresh };
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const { state, ready, accountHydrated } = useStudyStore();
  const paid = isPaidTier(state.tier);
  const ownerId = state.profile?.id ?? null;
  // Only act once hydration has told us who this browser belongs to. Before
  // that, a paying account can look free for a few hundred milliseconds —
  // acting then would purge their cached bank on every cold load.
  const settled = ready && accountHydrated;


  const [pack, setPack] = React.useState<Pack | null>(null);
  const [status, setStatus] = React.useState<ContentStatus>("starter");
  // Guards against two syncs racing (auto-sync and a manual tap, say).
  const syncing = React.useRef(false);

  const scopeOf = React.useCallback((): PackCacheScope | null => {
    // The owner id anchors the cache to one account. Without it (no profile
    // yet) there is nothing to key a paid download to, so wait — hydration
    // sets it moments later.
    if (!ownerId || !paid) return null;
    return { version: CONTENT_VERSION, tier: state.tier, ownerId };
  }, [ownerId, paid, state.tier]);

  const runLoad = React.useCallback(async () => {
    if (syncing.current || !settled) return;
    const scope = scopeOf();
    if (!scope) return;
    syncing.current = true;
    setStatus((s) => (s === "full" ? s : "syncing"));
    try {
      const outcome = await loadPack(scope, fetch);
      switch (outcome.kind) {
        case "full":
        case "cached":
          setPack(outcome.pack);
          setStatus("full");
          break;
        case "denied":
          // Server truth says this account may not hold the bank — wipe any
          // cached copy this browser is holding, whatever it believes.
          setPack(null);
          setStatus("starter");
          void purgePackCache();
          break;
        case "unavailable":
          setStatus("error");
          break;
      }
    } catch {
      setStatus("error");
    } finally {
      syncing.current = false;
    }
  }, [scopeOf, settled]);

  const sync = React.useCallback(() => void runLoad(), [runLoad]);

  React.useEffect(() => {
    if (!settled) return;
    if (!paid || !ownerId) {
      // Free accounts never fetch AND never keep: their whole allowance fits in
      // the starter pack, so anything in Cache Storage belongs to a payment
      // that is over. Purge on the way down — but only once hydration has
      // actually established this account is free (see `settled`).
      setPack(null);
      setStatus("starter");
      void purgePackCache();
      return;
    }
    // Auto-sync, unless the learner has asked us not to spend their data. This
    // app targets prepaid connections; on data-saver the sync waits for an
    // explicit tap instead. Report that pause as its own status — leaving
    // "starter" made surfaces like the scenario player render an endless
    // loading skeleton for a download nobody had been given a button for.
    let dataSaver = false;
    try {
      dataSaver = window.localStorage.getItem("k53.dataSaver") === "1";
    } catch {
      dataSaver = false;
    }
    if (dataSaver) {
      setStatus((s) => (s === "full" ? s : "paused"));
      return;
    }
    void runLoad();
  }, [paid, ownerId, settled, runLoad]);

  React.useEffect(() => {
    if (!settled) return;
    // Re-probe when connectivity returns. Without this, a session that opened
    // offline (or through an outage) kept serving the cached pack on the
    // grace grant until the next full reload — a downgraded account could
    // study paid content for as long as the tab stayed open.
    const onOnline = () => void runLoad();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [settled, runLoad]);

  const value = React.useMemo<ContentPool>(
    () => ({
      questions: pack?.questions ?? STARTER.questions,
      flashcards: pack?.flashcards ?? STARTER.flashcards,
      scenarios: pack?.scenarios ?? STARTER.scenarios,
      modules: pack?.modules ?? STARTER.modules,
      full: pack !== null,
      status,
      sync: () => void runLoad(),
    }),
    [pack, status, runLoad],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContentPool(): ContentPool {
  const ctx = React.useContext(ContentContext);
  if (!ctx) throw new Error("useContentPool must be used within <ContentProvider>");
  return ctx;
}
