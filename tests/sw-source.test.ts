import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * The service worker's entitlement guarantee rests on ONE line: `/api/`
 * requests are never intercepted, so a cached content-pack response can never
 * be served by the SW — pack caching lives entirely in the app's
 * entitlement-aware pack-cache module. That line is load-bearing for paid
 * content and previously existed only as a code-review convention. These tests
 * read the shipped source and fail if anyone makes the SW cacheable of API
 * responses.
 */

const sw = readFileSync(
  fileURLToPath(new URL("../public/sw.js", import.meta.url)),
  "utf8",
);

describe("service worker source policy", () => {
  it("never serves /api/ from cache", () => {
    expect(sw).toMatch(/pathname\.startsWith\("\/api\/"\)\s*\)?\s*return/);
  });

  it("only ever responds to GET navigations and static assets", () => {
    // respondWith must be unreachable for POST (webhooks, checkout, AI) —
    // belt and braces with the method guard.
    expect(sw).toMatch(/request\.method !== "GET"\s*\)\s*return/);
    expect(sw).toMatch(/url\.origin !== self\.location\.origin\s*\)\s*return/);
  });

  it("carries a stampable VERSION so each deploy invalidates old caches", () => {
    // scripts/stamp-sw.mjs rewrites this line on Vercel; if the constant is
    // renamed or inlined, stale shells survive deploys.
    expect(sw).toMatch(/const VERSION = "[^"]+";/);
  });

  it("keeps an offline fallback wired for navigations", () => {
    expect(sw).toContain('"/offline"');
  });
});
