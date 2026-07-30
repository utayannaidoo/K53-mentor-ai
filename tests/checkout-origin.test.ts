import { describe, expect, it } from "vitest";
import { callbackOrigin } from "@/lib/billing/callback-origin";
import { SITE_URL } from "@/lib/constants";

/**
 * callbackOrigin decides where Paystack returns the buyer after payment. It
 * grants nothing — entitlement is webhook-only — but a legitimate, correctly
 * signed Paystack checkout page that redirects to a domain the attacker owns
 * is a ready-made phishing step, so a caller must not be able to choose it.
 *
 * The header split is the whole point: x-forwarded-host is set by the
 * platform's proxy and cannot be forged by the caller; Origin can be anything
 * a non-browser client types.
 */

const req = (headers: Record<string, string>) =>
  new Request("https://example.test/api/checkout", { method: "POST", headers });

const siteHost = new URL(SITE_URL).host;

describe("callbackOrigin", () => {
  it("uses the proxy-set host, which is what identifies the deployment", () => {
    expect(
      callbackOrigin(req({ "x-forwarded-host": "k53mentor.ai", "x-forwarded-proto": "https" })),
    ).toBe("https://k53mentor.ai");
  });

  it("keeps a preview checkout on the preview deployment", () => {
    expect(
      callbackOrigin(req({ "x-forwarded-host": "k53-git-preview.vercel.app" })),
    ).toBe("https://k53-git-preview.vercel.app");
  });

  it("honours Origin when it agrees with the proxy host (the browser case)", () => {
    expect(
      callbackOrigin(req({ origin: "https://k53mentor.ai", "x-forwarded-host": "k53mentor.ai" })),
    ).toBe("https://k53mentor.ai");
  });

  it("discards a forged Origin and falls back to the trusted host", () => {
    expect(
      callbackOrigin(req({ origin: "https://evil.example", "x-forwarded-host": "k53mentor.ai" })),
    ).toBe("https://k53mentor.ai");
  });

  it("discards a forged Origin even when no proxy host is present", () => {
    expect(callbackOrigin(req({ origin: "https://evil.example" }))).toBe(SITE_URL);
  });

  it("is not fooled by a lookalike subdomain", () => {
    expect(
      callbackOrigin(req({ origin: "https://k53mentor.ai.evil.example", "x-forwarded-host": "k53mentor.ai" })),
    ).toBe("https://k53mentor.ai");
  });

  it("ignores a non-http scheme", () => {
    expect(
      callbackOrigin(req({ origin: "javascript:alert(1)", "x-forwarded-host": "k53mentor.ai" })),
    ).toBe("https://k53mentor.ai");
  });

  it("still accepts an Origin matching the configured site", () => {
    expect(callbackOrigin(req({ origin: SITE_URL }))).toBe(SITE_URL);
  });

  it("falls back to SITE_URL when the request carries no host at all", () => {
    expect(callbackOrigin(req({}))).toBe(SITE_URL);
  });

  it("never returns a caller-chosen host", () => {
    for (const evil of [
      "https://evil.example",
      "http://localhost:1337",
      "https://paystack.co.evil.example",
    ]) {
      const out = callbackOrigin(req({ origin: evil, "x-forwarded-host": "k53mentor.ai" }));
      expect(new URL(out).host === "k53mentor.ai" || new URL(out).host === siteHost).toBe(true);
    }
  });
});
