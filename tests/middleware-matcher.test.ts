import { describe, expect, it } from "vitest";
import { config } from "../middleware";

/**
 * The matcher decides which requests get session refresh + route protection.
 * It is a hand-written negative lookahead, and a typo in it fails silently and
 * dangerously: a protected page that stops matching simply stops being
 * protected. So assert both directions explicitly.
 */

const pattern = config.matcher[0];
// Next anchors matcher patterns; mirror that so the assertions match runtime.
const matches = (path: string) => new RegExp(`^${pattern}$`).test(path);

describe("middleware matcher", () => {
  it("still covers every protected app page", () => {
    for (const p of [
      "/dashboard",
      "/dashboard/progress",
      "/study",
      "/study/questions",
      "/study/mock-exam",
      "/tutor",
      "/licence-prep",
      "/licence-prep/left-turn",
      "/account",
      "/account/billing",
    ]) {
      expect(matches(p), `${p} must run middleware`).toBe(true);
    }
  });

  it("still covers the auth pages it redirects signed-in users away from", () => {
    expect(matches("/login")).toBe(true);
    expect(matches("/signup")).toBe(true);
  });

  it("still covers the Supabase auth callback, which sets session cookies", () => {
    expect(matches("/auth/callback")).toBe(true);
  });

  it("skips API routes — every handler authenticates itself", () => {
    for (const p of [
      "/api/tutor",
      "/api/coach",
      "/api/vision",
      "/api/checkout",
      "/api/paystack/webhook",
      "/api/account/delete",
      "/api/cron/notifications",
    ]) {
      expect(matches(p), `${p} must not run middleware`).toBe(false);
    }
  });

  it("skips public endpoints that have no session to refresh", () => {
    for (const p of [
      "/sw.js",
      "/manifest.webmanifest",
      "/robots.txt",
      "/sitemap.xml",
      "/opengraph-image",
      "/favicon.svg",
    ]) {
      expect(matches(p), `${p} must not run middleware`).toBe(false);
    }
  });

  it("skips static assets and images", () => {
    for (const p of [
      "/_next/static/chunks/main.js",
      "/_next/image",
      "/signs/regulatory/regulatory-006-01.png",
      "/icon-192.png",
    ]) {
      expect(matches(p), `${p} must not run middleware`).toBe(false);
    }
  });

  it("does not accidentally exclude pages that merely start with 'api'", () => {
    // The lookahead is anchored after the leading slash, so only /api/* is skipped.
    expect(matches("/apiary")).toBe(true);
  });
});
