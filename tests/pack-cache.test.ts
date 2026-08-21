import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The entitlement-aware pack cache is the thing standing between a lapsed
 * subscription and its cached copy of paid content. These tests pin the
 * policy: server-confirmed reads always serve; offline reads only serve inside
 * a server-stamped window; a grant that describes a different tier/version
 * authorizes nothing.
 */

import {
  mayServeCached,
  readCachedPack,
  readEntitlementGrant,
  writeCachedPack,
  writeEntitlementGrant,
  type EntitlementGrant,
  type PackCacheScope,
} from "@/lib/content/pack-cache";
import { CONTENT_VERSION } from "@/lib/content/meta";

const scope: PackCacheScope = {
  version: CONTENT_VERSION,
  tier: "premium",
  ownerId: "user-1",
};

const HOUR = 60 * 60 * 1000;

function grant(overrides: Partial<EntitlementGrant> = {}): EntitlementGrant {
  return { version: CONTENT_VERSION, tier: "premium", expiresAt: Date.now() + HOUR, ...overrides };
}

describe("mayServeCached", () => {
  it("never serves without a grant, even online", () => {
    // No recorded confirmation from the server at all — e.g. storage cleared
    // between sessions. The network decides, not the client.
    expect(mayServeCached(null, scope, Date.now(), true)).toBe(false);
  });

  it("serves when the server just confirmed, regardless of the stamp", () => {
    const expired = grant({ expiresAt: Date.now() - 1000 });
    expect(mayServeCached(expired, scope, Date.now(), true)).toBe(true);
  });

  it("serves offline inside the grace window", () => {
    const fresh = grant({ expiresAt: Date.now() + HOUR });
    expect(mayServeCached(fresh, scope, Date.now(), false)).toBe(true);
  });

  it("stops serving offline once the stamp lapses", () => {
    const stale = grant({ expiresAt: Date.now() - HOUR });
    expect(mayServeCached(stale, scope, Date.now(), false)).toBe(false);
  });

  it("a premium grant never unlocks a premium_plus session, or vice versa", () => {
    const plus = grant({ tier: "premium_plus" });
    expect(mayServeCached(plus, scope, Date.now(), false)).toBe(false);
    // Even server-confirmed: the mismatch means this cache was not issued to
    // this scope, so refetch rather than serve someone else's shape.
    expect(mayServeCached(plus, scope, Date.now(), true)).toBe(false);
  });

  it("a stale content version never serves against a new one", () => {
    const old = grant({ version: "000000000000" });
    expect(mayServeCached(old, scope, Date.now(), false)).toBe(false);
  });
});

/**
 * Minimal Cache Storage stand-in: enough of the API surface pack-cache touches
 * (open / put / match / keys / delete) to exercise the real read/write paths.
 */
class FakeCacheStorage {
  stores = new Map<string, Map<string, Response>>();
  async open(name: string) {
    if (!this.stores.has(name)) this.stores.set(name, new Map());
    const store = this.stores.get(name)!;
    return {
      put: async (req: RequestInfo, res: Response) => {
        store.set(String(req), res.clone());
      },
      match: async (req: RequestInfo) => store.get(String(req)) ?? undefined,
      keys: async () => [...store.keys()].map((u) => new Request(u)),
      delete: async (req: RequestInfo) => store.delete(String(req)),
    };
  }
}

async function installFakeCaches() {
  const fake = new FakeCacheStorage();
  vi.stubGlobal("caches", fake);
  return fake;
}

const PACK_BODY = {
  version: CONTENT_VERSION,
  questions: [],
  flashcards: [],
  scenarios: [],
  modules: [],
};

beforeEach(() => {
  vi.unstubAllGlobals();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("pack cache storage paths", () => {
  it("round-trips a pack under its scope key and prunes other packs", async () => {
    await installFakeCaches();

    await writeCachedPack({ ...PACK_BODY }, scope);
    // An older entry another account/tier left behind must be pruned on write.
    await writeEntitlementGrant("user-2", grant());

    const hit = await readCachedPack(scope);
    expect(hit?.version).toBe(CONTENT_VERSION);

    const other = await readCachedPack({ ...scope, ownerId: "someone-else" });
    expect(other).toBeNull();
  });

  it("grant round-trips per owner", async () => {
    await installFakeCaches();
    const g = grant({ expiresAt: 12345 });
    await writeEntitlementGrant("user-1", g);
    const read = await readEntitlementGrant("user-1");
    expect(read).toEqual(g);
    expect(await readEntitlementGrant("nobody")).toBeNull();
  });

  it("reads fail soft when Cache Storage is unavailable", async () => {
    // No caches global at all (old Safari, SSR) — every helper degrades to null.
    expect(await readCachedPack(scope)).toBeNull();
    expect(await readEntitlementGrant("user-1")).toBeNull();
    await expect(writeCachedPack({ ...PACK_BODY }, scope)).resolves.toBeUndefined();
  });
});
