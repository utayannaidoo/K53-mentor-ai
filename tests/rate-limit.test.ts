import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Rate-limit hardening tests:
 *  - clientIp must never key off client-forgeable header values.
 *  - A Redis outage forbids provider-backed tutor/coach/vision spend, while
 *    the per-user helper remains bounded for non-provider callers.
 */

function req(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/test", { headers });
}

describe("clientIp", () => {
  beforeEach(() => vi.resetModules());

  it("prefers platform-set x-real-ip over x-forwarded-for", async () => {
    const { clientIp } = await import("@/lib/ai/rate-limit");
    expect(
      clientIp(req({ "x-real-ip": "41.0.0.9", "x-forwarded-for": "6.6.6.6, 41.0.0.9" })),
    ).toBe("41.0.0.9");
  });

  it("uses the RIGHTMOST x-forwarded-for entry (proxy-appended), not the spoofable leftmost", async () => {
    const { clientIp } = await import("@/lib/ai/rate-limit");
    expect(clientIp(req({ "x-forwarded-for": "6.6.6.6, 7.7.7.7, 41.0.0.9" }))).toBe("41.0.0.9");
  });

  it("falls back to 'anon' with no proxy headers", async () => {
    const { clientIp } = await import("@/lib/ai/rate-limit");
    expect(clientIp(req({}))).toBe("anon");
  });
});

describe("limiter degradation when Redis errors", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
    vi.spyOn(console, "error").mockImplementation(() => {});
    // Every Redis/Ratelimit call throws — simulates an Upstash outage.
    vi.doMock("@upstash/redis", () => ({
      Redis: { fromEnv: () => ({ incr: () => Promise.reject(new Error("redis down")) }) },
    }));
    vi.doMock("@upstash/ratelimit", () => {
      class Ratelimit {
        static slidingWindow() {
          return {};
        }
        static fixedWindow() {
          return {};
        }
        limit() {
          return Promise.reject(new Error("redis down"));
        }
      }
      return { Ratelimit };
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock("@upstash/redis");
    vi.doUnmock("@upstash/ratelimit");
    vi.restoreAllMocks();
  });

  it("limitUserDaily degrades to the in-memory cap instead of failing open", async () => {
    const { limitUserDaily } = await import("@/lib/ai/rate-limit");
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await limitUserDaily("tutor", "user-1", 3));
    expect(results.slice(0, 3).every((r) => r.success)).toBe(true);
    expect(results[3].success).toBe(false); // 4th call over the limit is refused
  });

  it("signals tutor routes to use the cost-free fallback", async () => {
    const { limitTutor } = await import("@/lib/ai/rate-limit");
    const r = await limitTutor("1.2.3.4");
    expect(r).toMatchObject({ success: true, reason: "backend_unavailable" });

    const flood = await Promise.all(
      Array.from({ length: 10 }, () => limitTutor("1.2.3.4")),
    );
    expect(flood.some((result) => !result.success && !result.reason)).toBe(true);
  });

  it("signals coach routes to use the cost-free fallback", async () => {
    const { limitCoach } = await import("@/lib/ai/rate-limit");
    const r = await limitCoach("1.2.3.4");
    expect(r).toMatchObject({ success: true, reason: "backend_unavailable" });
  });

  it("limitVision fails CLOSED on limiter errors", async () => {
    const { limitVision } = await import("@/lib/ai/rate-limit");
    const r = await limitVision("1.2.3.4");
    expect(r.success).toBe(false);
    expect(r.reason).toBe("backend_unavailable");
    expect(r.retryAfter).toBeGreaterThan(0);
  });
});

describe("shared-IP ceilings", () => {
  beforeEach(() => vi.resetModules());

  it("leave room for two Premium Plus users' daily allowances", async () => {
    const { AI_IP_DAILY_LIMITS, limitUserDaily } = await import("@/lib/ai/rate-limit");
    expect(AI_IP_DAILY_LIMITS.tutor).toBeGreaterThanOrEqual(35 * 2);
    expect(AI_IP_DAILY_LIMITS.coach).toBeGreaterThanOrEqual(100 * 2);
    expect(AI_IP_DAILY_LIMITS.vision).toBeGreaterThanOrEqual(25 * 2);

    for (const userId of ["paid-a", "paid-b"]) {
      const allowed = await Promise.all(
        Array.from({ length: 25 }, () => limitUserDaily("vision", userId, 25)),
      );
      expect(allowed.every((result) => result.success)).toBe(true);
      expect((await limitUserDaily("vision", userId, 25)).success).toBe(false);
    }
  });
});
