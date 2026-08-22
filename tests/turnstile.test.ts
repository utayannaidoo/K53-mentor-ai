import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildAuthCaptchaOptions,
  isCaptchaConfigured,
  shouldBlockSubmit,
  TURNSTILE_SCRIPT_SRC,
} from "@/lib/auth/captcha";

/**
 * The captcha decision rules, pinned in isolation: the widget only exists when
 * an operator published a site key; once it exists, a submit without a token
 * (or from a widget that failed) stops at the form — deliberately strict,
 * because GoTrue would reject the request anyway. Disabled never blocks.
 * These helpers are DOM-free on purpose so the node vitest env can exercise
 * every branch; component behaviour itself is out of unit-test scope.
 */

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isCaptchaConfigured", () => {
  it("is true when a site key is set", () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "0x4AAAAAAA_site_key");
    expect(isCaptchaConfigured()).toBe(true);
  });

  it("is false when the key is unset or empty", () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
    expect(isCaptchaConfigured()).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", undefined as unknown as string);
    expect(isCaptchaConfigured()).toBe(false);
  });
});

describe("shouldBlockSubmit", () => {
  const enabled = { enabled: true, token: null, failed: false };

  it("passes when enabled with a solved token", () => {
    expect(shouldBlockSubmit({ ...enabled, token: "cf-token" })).toEqual({
      block: false,
      reason: null,
    });
  });

  it("blocks with missing_token when enabled and no token yet", () => {
    expect(shouldBlockSubmit(enabled)).toEqual({ block: true, reason: "missing_token" });
  });

  it("treats an empty-string token as missing", () => {
    expect(shouldBlockSubmit({ ...enabled, token: "" })).toEqual({
      block: true,
      reason: "missing_token",
    });
  });

  it("blocks as unavailable when the widget failed — even with a stale token", () => {
    expect(shouldBlockSubmit({ ...enabled, token: "stale" , failed: true })).toEqual({
      block: true,
      reason: "unavailable",
    });
    expect(shouldBlockSubmit({ ...enabled, failed: true })).toEqual({
      block: true,
      reason: "unavailable",
    });
  });

  it("never blocks when disabled, whatever else is wrong", () => {
    expect(
      shouldBlockSubmit({ enabled: false, token: null, failed: true }),
    ).toEqual({ block: false, reason: null });
    expect(
      shouldBlockSubmit({ enabled: false, token: "cf-token", failed: false }),
    ).toEqual({ block: false, reason: null });
  });
});

describe("buildAuthCaptchaOptions", () => {
  it("wraps a token as captchaToken", () => {
    expect(buildAuthCaptchaOptions("cf-token")).toEqual({ captchaToken: "cf-token" });
  });

  it("returns {} for absent / null / empty tokens so spreading adds no key", () => {
    expect(buildAuthCaptchaOptions()).toEqual({});
    expect(buildAuthCaptchaOptions(null)).toEqual({});
    expect(buildAuthCaptchaOptions("")).toEqual({});
    // The exact contract callers rely on: no captchaToken key at all.
    expect(Object.keys(buildAuthCaptchaOptions(null))).toHaveLength(0);
  });
});

describe("TURNSTILE_SCRIPT_SRC", () => {
  it("pins the explicit-render api.js endpoint", () => {
    // render=explicit is required — we call turnstile.render ourselves so the
    // callbacks land on our state, not Cloudflare's implicit auto-scan.
    expect(TURNSTILE_SCRIPT_SRC).toBe(
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
    );
  });
});
