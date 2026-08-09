import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * /api/content/pack is the paywall. Before it, every content gate was
 * `hasFeature(state.tier, …)` read from localStorage, so the entire product was
 * one devtools window away. These assertions are the thing standing in its
 * place, and none of them is runtime-verifiable on a machine with no .env —
 * so they have to be unit tests.
 */

const limitContent = vi.fn();
const limitUserDaily = vi.fn();
const resolveTier = vi.fn();

vi.mock("@/lib/ai/rate-limit", () => ({
  clientIp: () => "203.0.113.7",
  limitContent: (...a: unknown[]) => limitContent(...a),
  limitUserDaily: (...a: unknown[]) => limitUserDaily(...a),
}));

vi.mock("@/lib/billing/entitlements.server", () => ({
  resolveTier: (...a: unknown[]) => resolveTier(...a),
}));

const OK = { success: true, retryAfter: 0 };

beforeEach(() => {
  vi.clearAllMocks();
  limitContent.mockResolvedValue(OK);
  limitUserDaily.mockResolvedValue(OK);
});

/**
 * Loaded once, in beforeAll, rather than inside each test.
 *
 * This route imports the whole question bank — a thousand-odd questions plus
 * flashcards and scenarios — and that first cold import can take longer than
 * vitest's 5s per-test timeout when the full suite is competing for CPU. Paying
 * it inside a test made the first case in this file fail intermittently on a
 * timing artefact rather than on anything it asserts. beforeAll carries its own
 * timeout, so the cost lands somewhere it belongs.
 */
let route: typeof import("@/app/api/content/pack/route");

beforeAll(async () => {
  route = await import("@/app/api/content/pack/route");
}, 60_000);

const get = async () => route.GET(new Request("https://k53.test/api/content/pack"));

describe("/api/content/pack", () => {
  it("rate-limits before resolving the tier", async () => {
    limitContent.mockResolvedValue({ success: false, retryAfter: 900 });
    const res = await get();

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("900");
    expect(resolveTier).not.toHaveBeenCalled();
  });

  it("refuses a signed-out caller", async () => {
    resolveTier.mockResolvedValue(Response.json({ error: "Unauthorized" }, { status: 401 }));
    expect((await get()).status).toBe(401);
  });

  it("refuses the free tier — this is the paywall", async () => {
    resolveTier.mockResolvedValue({ userId: "u1", tier: "free" });
    const res = await get();

    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ error: "upgrade_required", tier: "free" });
  });

  it("serves the full bank to Premium, not just Premium Plus", async () => {
    // Regression guard: gating on a FeatureKey like `licencePrep` would pass
    // Premium Plus and silently deny every Premium subscriber, because those
    // flags separate the two paid plans rather than free from paid.
    resolveTier.mockResolvedValue({ userId: "u1", tier: "premium" });
    const res = await get();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.questions.length).toBeGreaterThan(1000);
    expect(body.flashcards.length).toBeGreaterThan(700);
    expect(body.scenarios.length).toBeGreaterThan(50);
    expect(body.modules.length).toBeGreaterThan(0);
    expect(body.version).toMatch(/^[0-9a-f]{12}$/);
  });

  it("serves Premium Plus too", async () => {
    resolveTier.mockResolvedValue({ userId: "u1", tier: "premium_plus" });
    expect((await get()).status).toBe(200);
  });

  it("never lets a shared cache store the response", async () => {
    resolveTier.mockResolvedValue({ userId: "u1", tier: "premium" });
    // The body depends on who asked; a public CDN copy would serve the bank to
    // anyone who followed.
    expect((await get()).headers.get("cache-control")).toContain("private");
  });

  it("applies a per-account sync ceiling on top of the per-IP one", async () => {
    resolveTier.mockResolvedValue({ userId: "u1", tier: "premium" });
    limitUserDaily.mockResolvedValue({ success: false, retryAfter: 3600 });
    const res = await get();

    expect(res.status).toBe(429);
    expect(await res.json()).toMatchObject({ error: "sync_cap" });
    expect(limitUserDaily).toHaveBeenCalledWith("content", "u1", expect.any(Number));
  });

  it("serves demo mode, where there are no accounts to protect", async () => {
    // resolveTier returns premium_plus with a null user when Supabase is
    // unconfigured, so zero-config demo mode keeps working (CLAUDE.md rule 1).
    resolveTier.mockResolvedValue({ userId: null, tier: "premium_plus" });
    const res = await get();

    expect(res.status).toBe(200);
    expect(limitUserDaily).not.toHaveBeenCalled();
  });
});
