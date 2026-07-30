"use client";

import * as React from "react";
import type { Flashcard, Question, Scenario } from "@/types";
import {
  STARTER_QUESTIONS,
  STARTER_FLASHCARDS,
  STARTER_SCENARIOS,
} from "@/lib/content/starter";
import { CONTENT_VERSION } from "@/lib/content/meta";
import { isPaidTier } from "@/lib/billing/plans";
import { useStudyStore } from "@/hooks/use-study-store";

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
 */

export type ContentStatus = "starter" | "syncing" | "full" | "error";

export interface ContentPool {
  questions: Question[];
  flashcards: Flashcard[];
  scenarios: Scenario[];
  /** True once the full bank is in memory. */
  full: boolean;
  status: ContentStatus;
  /** Manual trigger, for the data-saver path and for retrying after an error. */
  sync: () => void;
}

interface Pack {
  version: string;
  questions: Question[];
  flashcards: Flashcard[];
  scenarios: Scenario[];
}

const STARTER: Pick<ContentPool, "questions" | "flashcards" | "scenarios"> = {
  questions: STARTER_QUESTIONS,
  flashcards: STARTER_FLASHCARDS,
  scenarios: STARTER_SCENARIOS,
};

const CACHE_NAME = "k53-content";
/**
 * The version is *in the cache key*, so a content sprint can't be served stale:
 * the new build asks for a key that does not exist yet and re-syncs. Old
 * entries are pruned on write rather than accumulating a copy per release.
 */
const cacheKey = (version: string) => `/__k53-content/${version}`;

async function readCached(version: string): Promise<Pack | null> {
  if (typeof caches === "undefined") return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const hit = await cache.match(cacheKey(version));
    return hit ? ((await hit.json()) as Pack) : null;
  } catch {
    // Private mode, quota, or no Cache Storage — fall back to the network.
    return null;
  }
}

async function writeCached(pack: Pack): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(
      cacheKey(pack.version),
      new Response(JSON.stringify(pack), { headers: { "content-type": "application/json" } }),
    );
    for (const req of await cache.keys()) {
      if (!req.url.endsWith(cacheKey(pack.version))) await cache.delete(req);
    }
  } catch {
    // Cache write failed — the pack is still in memory for this session.
  }
}

/** Data-saver is a deliberate "don't spend my bundle" signal; honour it. */
function dataSaverOn(): boolean {
  try {
    return window.localStorage.getItem("k53.dataSaver") === "1";
  } catch {
    return false;
  }
}

const ContentContext = React.createContext<ContentPool | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const { state } = useStudyStore();
  const paid = isPaidTier(state.tier);

  const [pack, setPack] = React.useState<Pack | null>(null);
  const [status, setStatus] = React.useState<ContentStatus>("starter");
  // Guards against two syncs racing (auto-sync and a manual tap, say).
  const syncing = React.useRef(false);

  const sync = React.useCallback(async () => {
    if (syncing.current || !paid) return;
    syncing.current = true;
    try {
      const cached = await readCached(CONTENT_VERSION);
      if (cached) {
        setPack(cached);
        setStatus("full");
        return;
      }
      setStatus("syncing");
      const res = await fetch("/api/content/pack");
      if (!res.ok) {
        // 403 means the tier changed under us (a lapsed subscription); 429 and
        // 5xx are transient. Either way the starter pack still works, so the
        // learner is degraded rather than blocked.
        setStatus("error");
        return;
      }
      const fresh = (await res.json()) as Pack;
      setPack(fresh);
      setStatus("full");
      void writeCached(fresh);
    } catch {
      setStatus("error");
    } finally {
      syncing.current = false;
    }
  }, [paid]);

  React.useEffect(() => {
    if (!paid) {
      // Free accounts never fetch — their whole allowance fits in the starter
      // pack, so the bank is only ever served to accounts that paid for it.
      setPack(null);
      setStatus("starter");
      return;
    }
    // Auto-sync, unless the learner has asked us not to spend their data. This
    // app targets prepaid connections; on data-saver the sync waits for an
    // explicit tap instead.
    if (dataSaverOn()) return;
    void sync();
  }, [paid, sync]);

  const value = React.useMemo<ContentPool>(
    () => ({
      questions: pack?.questions ?? STARTER.questions,
      flashcards: pack?.flashcards ?? STARTER.flashcards,
      scenarios: pack?.scenarios ?? STARTER.scenarios,
      full: pack !== null,
      status,
      sync: () => void sync(),
    }),
    [pack, status, sync],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContentPool(): ContentPool {
  const ctx = React.useContext(ContentContext);
  if (!ctx) throw new Error("useContentPool must be used within <ContentProvider>");
  return ctx;
}
