import type { DriverModule, Flashcard, Question, Scenario } from "@/types";
import { CONTENT_VERSION } from "@/lib/content/meta";

/**
 * Entitlement-aware Cache Storage for the downloaded content pack.
 *
 * The pack is paid content, so its cache cannot be a dumb blob that outlives
 * the subscription it was downloaded under. Three properties make it safe:
 *
 *  1. **Server-validated reads.** The client never decides on its own that a
 *     cached pack may be served. Every session starts with a cheap
 *     `/api/content/pack?probe=1` call; only a live server answer of "still
 *     paid" unlocks the cache immediately, and only a stamp THIS route issued
 *     (the entitlement grant below) can unlock it offline. A tampered
 *     localStorage tier authorizes nothing — the probe answers from the
 *     subscriptions table, not the browser.
 *  2. **A bounded offline grace window.** Each successful probe/full download
 *     writes a tiny grant record stamped with the server's deadline
 *     (`expiresAt`, now + 72h). Offline, a cached copy is served only while
 *     that stamp is unexpired. After it lapses, study falls back to the
 *     starter set until the next successful online check. A cancelled learner
 *     who goes dark keeps access for days, not forever — and the moment they
 *     are reachable again, the probe ends it.
 *  3. **Per-identity keys.** Packs and grants are keyed by content version +
 *     issuing tier + owner id, so account B never reads account A's pack, a
 *     Premium cache never satisfies a Plus session, and a content sprint
 *     invalidates every old entry simply by changing CONTENT_VERSION. Writes
 *     prune every other entry, and any downgrade/sign-out purges the lot.
 *
 * Everything here is best-effort around Cache Storage being unavailable
 * (private mode, quota): callers fall back to the network or the starter pack
 * exactly as before.
 */

export const PACK_CACHE_NAME = "k53-content";

export interface Pack {
  version: string;
  questions: Question[];
  flashcards: Flashcard[];
  scenarios: Scenario[];
  modules: DriverModule[];
}

/** What identifies one cached copy: version + the tier it was issued to + whose it is. */
export interface PackCacheScope {
  version: string;
  /** The server-resolved tier at issue time — "premium" | "premium_plus". */
  tier: string;
  /** Stable per-account id (profile.id); falls back to the local uid in demo mode. */
  ownerId: string;
}

/**
 * The server's last word on this account's entitlement, kept beside the pack.
 * Written on every confirmed-probe/download; read whenever the pack is wanted
 * without a live server answer (i.e. offline).
 */
export interface EntitlementGrant {
  version: string;
  tier: string;
  /** Epoch ms — the server-stamped deadline, not a client-computed one. */
  expiresAt: number;
}

const packKeyOf = (scope: PackCacheScope) =>
  `/__k53-content/${scope.version}/${scope.tier}/${encodeURIComponent(scope.ownerId)}`;
const grantKeyOf = (ownerId: string) =>
  `/__k53-content/__grant/${encodeURIComponent(ownerId)}`;

function hasCacheStorage(): boolean {
  return typeof caches !== "undefined";
}

/** Delete EVERY entry in the pack cache: downgrades, sign-out, account wipes. */
export async function purgePackCache(): Promise<void> {
  if (!hasCacheStorage()) return;
  try {
    await caches.delete(PACK_CACHE_NAME);
  } catch {
    // Storage refused or nothing stored — nothing to clean up.
  }
}

/** Record the server's latest entitlement confirmation for this owner. */
export async function writeEntitlementGrant(
  ownerId: string,
  grant: EntitlementGrant,
): Promise<void> {
  if (!hasCacheStorage()) return;
  try {
    const cache = await caches.open(PACK_CACHE_NAME);
    const key = grantKeyOf(ownerId);
    await cache.put(
      key,
      new Response(JSON.stringify(grant), { headers: { "content-type": "application/json" } }),
    );
    // Prune grants belonging to other owners so a shared browser doesn't
    // accumulate one per account that ever signed in. Pack entries are left
    // alone here — their own writer prunes them.
    for (const req of await cache.keys()) {
      if (req.url.includes("/__grant/") && req.url !== key) await cache.delete(req);
    }
  } catch {
    // Quota/private mode: the in-memory pack still works this session.
  }
}

/** The last recorded server confirmation for this owner, if any. */
export async function readEntitlementGrant(ownerId: string): Promise<EntitlementGrant | null> {
  if (!hasCacheStorage()) return null;
  try {
    const cache = await caches.open(PACK_CACHE_NAME);
    const hit = await cache.match(grantKeyOf(ownerId));
    if (!hit) return null;
    const grant = (await hit.json()) as EntitlementGrant;
    if (!grant || typeof grant.expiresAt !== "number") return null;
    return grant;
  } catch {
    return null;
  }
}

/** Read this scope's cached pack, if one exists. */
export async function readCachedPack(scope: PackCacheScope): Promise<Pack | null> {
  if (!hasCacheStorage()) return null;
  try {
    const cache = await caches.open(PACK_CACHE_NAME);
    const hit = await cache.match(packKeyOf(scope));
    return hit ? ((await hit.json()) as Pack) : null;
  } catch {
    return null;
  }
}

/** Write the pack under this scope's key and prune every other pack entry. */
export async function writeCachedPack(
  pack: Pack,
  scope: Omit<PackCacheScope, "version">,
): Promise<void> {
  if (!hasCacheStorage()) return;
  try {
    const cache = await caches.open(PACK_CACHE_NAME);
    const key = packKeyOf({ ...scope, version: pack.version });
    await cache.put(
      key,
      new Response(JSON.stringify(pack), {
        headers: { "content-type": "application/json" },
      }),
    );
    for (const req of await cache.keys()) {
      // Leave grant entries alone — they belong to the probe path.
      if (!req.url.includes("/__grant/") && req.url !== key) await cache.delete(req);
    }
  } catch {
    // Quota or private mode: the pack stays in memory for this session.
  }
}

/**
 * May a cached copy be served right now?
 *
 * `serverConfirmed` — a live probe just answered "paid": serve whatever cache
 * matches. Offline (or the server could not answer): only while the recorded
 * grant is unexpired AND describes exactly the scope being served. Pure so the
 * anti-stale policy is unit-testable without a browser.
 */
export function mayServeCached(
  grant: EntitlementGrant | null,
  scope: PackCacheScope,
  now: number,
  serverConfirmed: boolean,
): boolean {
  if (!grant) return false;
  if (grant.version !== scope.version || grant.tier !== scope.tier) return false;
  if (serverConfirmed) return true;
  return Number.isFinite(grant.expiresAt) && now < grant.expiresAt;
}

/**
 * Convenience: the current content version, so callers build scopes against
 * one constant instead of importing meta.ts separately.
 */
export const currentContentVersion = (): string => CONTENT_VERSION;
