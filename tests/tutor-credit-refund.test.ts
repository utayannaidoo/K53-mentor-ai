import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * What gets refunded when a promised AI answer falls through to the study
 * notes.
 *
 * #97 gave the message back by refunding the *daily* allowance, which is right
 * for almost everyone. It is wrong for the one case that actually cost money:
 * a Premium Plus learner past their daily cap spends a purchased top-up credit
 * to send one more message. Their daily allowance is already exhausted — that
 * is why a credit was spent — so refunding a daily unit hands back something
 * they cannot use, and the credit they paid for is simply gone.
 */

const limitUserDaily = vi.fn();
const refundUserDaily = vi.fn(async (..._a: unknown[]) => {});

vi.mock("@/lib/ai/rate-limit", () => ({
  clientIp: () => "203.0.113.7",
  limitTutor: async () => ({ success: true, retryAfter: 0 }),
  limitUserDaily: (...a: unknown[]) => limitUserDaily(...a),
  refundUserDaily: (...a: unknown[]) => refundUserDaily(...a),
}));

const spendTutorCredit = vi.fn();
const refundTutorCredit = vi.fn(async (..._a: unknown[]) => {});

vi.mock("@/lib/billing/entitlements.server", () => ({
  resolveEntitlement: async () => ({ userId: "u1", tier: "premium_plus", allowance: 100 }),
  isWithinFreeTrial: async () => true,
  spendTutorCredit: (...a: unknown[]) => spendTutorCredit(...a),
  refundTutorCredit: (...a: unknown[]) => refundTutorCredit(...a),
}));

vi.mock("@/lib/billing/usage.server", () => ({ recordAiUsage: async () => {} }));

// Always answers "local", which is what a provider outage or an empty balance
// looks like from inside the route.
vi.mock("@/lib/ai/provider", () => ({
  chooseProvider: () => "anthropic",
  streamTutorReply: async () => ({
    stream: new ReadableStream<Uint8Array>({
      start(c) {
        c.close();
      },
    }),
    model: "stub",
    provider: "local" as const,
  }),
}));

const { POST } = await import("@/app/api/tutor/route");

function ask() {
  return POST(
    new Request("https://k53.test/api/tutor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "What is the pass mark?" }] }),
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  limitUserDaily.mockResolvedValue({ success: true, retryAfter: 0 });
  spendTutorCredit.mockResolvedValue(true);
});

describe("a fallback after a top-up credit was spent", () => {
  beforeEach(() => {
    // Past the daily cap, so the route reaches for a credit.
    limitUserDaily.mockResolvedValue({ success: false, retryAfter: 3600 });
  });

  it("puts the credit back, not a daily unit that was already used up", async () => {
    const res = await ask();
    expect(res.headers.get("x-tutor-mode")).toBe("basic");
    expect(spendTutorCredit).toHaveBeenCalledWith("u1");
    expect(refundTutorCredit).toHaveBeenCalledWith("u1");
    expect(refundUserDaily).not.toHaveBeenCalled();
  });

  it("refunds exactly one credit per fallen-through message", async () => {
    await ask();
    await ask();
    expect(refundTutorCredit).toHaveBeenCalledTimes(2);
  });

  it("refuses the message when there is no credit to spend, and refunds nothing", async () => {
    spendTutorCredit.mockResolvedValue(false);
    const res = await ask();
    expect(res.status).toBe(429);
    expect(refundTutorCredit).not.toHaveBeenCalled();
    expect(refundUserDaily).not.toHaveBeenCalled();
  });
});

describe("a fallback inside the daily allowance", () => {
  it("still refunds the daily unit, which is what was actually spent", async () => {
    const res = await ask();
    expect(res.headers.get("x-tutor-mode")).toBe("basic");
    expect(refundUserDaily).toHaveBeenCalledWith("tutor", "u1");
    // No credit was spent, so there is nothing to give back.
    expect(spendTutorCredit).not.toHaveBeenCalled();
    expect(refundTutorCredit).not.toHaveBeenCalled();
  });
});
