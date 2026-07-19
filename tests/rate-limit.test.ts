import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Rate-limit hardening tests:
 *  - clientIp must never key off client-forgeable header values.
 *  - A Redis outage degrades to the in-memory limiter (still bounded) for
 *    tutor/user-daily, and fails CLOSED for vision (priciest surface).
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

  it("limitTutor degrades to the in-memory burst cap instead of failing open", async () => {
    const { limitTutor } = await import("@/lib/ai/rate-limit");
    let refused = false;
    for (let i = 0; i < 50; i++) {
      const r = await limitTutor("1.2.3.4");
      if (!r.success) {
        refused = true;
        break;
      }
    }
    expect(refused).toBe(true); // caps stay bounded during the outage
  });

  it("limitVision fails CLOSED on limiter errors", async () => {
    const { limitVision } = await import("@/lib/ai/rate-limit");
    const r = await limitVision("1.2.3.4");
    expect(r.success).toBe(false);
    expect(r.retryAfter).toBeGreaterThan(0);
  });
});
