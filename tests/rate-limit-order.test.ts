import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The per-IP limiter must be the FIRST thing an AI route does.
 *
 * These three routes used to resolve entitlement (an auth round-trip plus a
 * subscriptions lookup) and parse a body the schema allows to reach ~5.6MB,
 * and only then ask the limiter. That ordering means a rate-limited flood
 * still costs the full price of every request it makes — the limiter declines
 * work that has already been done. This locks the order in: on a 429, neither
 * the entitlement lookup nor the body parse may run.
 */

const limitTutor = vi.fn();
const limitCoach = vi.fn();
const limitVision = vi.fn();
const resolveEntitlement = vi.fn();

vi.mock("@/lib/ai/rate-limit", () => ({
  clientIp: () => "203.0.113.7",
  limitTutor: (...a: unknown[]) => limitTutor(...a),
  limitCoach: (...a: unknown[]) => limitCoach(...a),
  limitVision: (...a: unknown[]) => limitVision(...a),
  limitUserDaily: vi.fn(async () => ({ success: true, retryAfter: 0 })),
}));

vi.mock("@/lib/billing/entitlements.server", () => ({
  resolveEntitlement: (...a: unknown[]) => resolveEntitlement(...a),
  spendTutorCredit: vi.fn(async () => false),
  // Unreached at premium_plus (the tutor route short-circuits on tier), but the
  // mock has to export it or the route's import resolves to undefined.
  isWithinFreeTrial: vi.fn(async () => true),
}));

const RATE_LIMITED = { success: false, retryAfter: 42 };

/** A request whose body must never be read when the limiter says no. */
function fakeRequest() {
  const json = vi.fn(async () => ({}));
  return { req: { headers: new Headers(), json } as unknown as Request, json };
}

beforeEach(() => {
  vi.clearAllMocks();
  resolveEntitlement.mockResolvedValue({ userId: "u1", tier: "premium_plus", allowance: 10 });
});

const routes = [
  { name: "tutor", load: () => import("@/app/api/tutor/route"), limiter: limitTutor },
  { name: "coach", load: () => import("@/app/api/coach/route"), limiter: limitCoach },
  { name: "vision", load: () => import("@/app/api/vision/route"), limiter: limitVision },
] as const;

describe.each(routes)("/api/$name rate-limit ordering", ({ load, limiter }) => {
  /**
   * Loaded once rather than per test. These routes pull in the question bank,
   * Supabase and the AI provider cascade, and the first cold import can exceed
   * vitest's 5s per-test timeout when the whole suite is competing for CPU —
   * which made the first case here fail intermittently on module-load speed
   * rather than on the ordering it actually asserts. The mocks above are
   * module-level `vi.fn()`s reached through closures, so a single import still
   * sees whatever `beforeEach` sets up.
   */
  let POST: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await load());
  }, 60_000);

  it("returns 429 without resolving entitlement or reading the body", async () => {
    limiter.mockResolvedValue(RATE_LIMITED);
    const { req, json } = fakeRequest();

    const res = await POST(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("42");
    expect(limiter).toHaveBeenCalledTimes(1);
    // The whole point: neither of these may have run.
    expect(resolveEntitlement).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
  });

  it("consults the limiter before the entitlement lookup on the happy path", async () => {
    const order: string[] = [];
    limiter.mockImplementation(async () => {
      order.push("limiter");
      return { success: true, retryAfter: 0 };
    });
    resolveEntitlement.mockImplementation(async () => {
      order.push("entitlement");
      return { userId: "u1", tier: "premium_plus", allowance: 10 };
    });

    const { req } = fakeRequest();
    await POST(req).catch(() => {
      /* a malformed body 400s or the provider is absent — ordering is the assertion */
    });

    expect(order[0]).toBe("limiter");
  });
});
