import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const BACKEND_DOWN = {
  success: false,
  retryAfter: 60,
  reason: "backend_unavailable" as const,
};
const LOCAL_ONLY = {
  success: true,
  retryAfter: 0,
  reason: "backend_unavailable" as const,
};

const limitTutor = vi.fn(async () => LOCAL_ONLY);
const limitCoach = vi.fn(async () => LOCAL_ONLY);
const limitVision = vi.fn(async () => BACKEND_DOWN);
const limitUserDaily = vi.fn(async (_surface: string, _userId: string, _limit: number) => ({ success: true, retryAfter: 0 }));
const refundUserDaily = vi.fn(async (_surface: string, _userId: string) => {});
const resolveEntitlement = vi.fn(async (_surface: string) => ({
  userId: "paid-user",
  tier: "premium_plus" as const,
  allowance: 35,
}));
const recordAiUsage = vi.fn(async (_args: unknown) => {});

const streamTutorReply = vi.fn(async (args: { forceLocal?: boolean }) => ({
  stream: new ReadableStream<Uint8Array>({ start(controller) { controller.close(); } }),
  model: args.forceLocal ? "local" : "unexpected-provider",
  provider: args.forceLocal ? "local" : "openai",
}));
const completeCoachText = vi.fn(async (_args: unknown) => ({ text: "provider", model: "provider" }));
const completeVisionText = vi.fn(async (_args: unknown) => null);

vi.mock("@/lib/ai/rate-limit", () => ({
  clientIp: () => "203.0.113.8",
  limitTutor: () => limitTutor(),
  limitCoach: () => limitCoach(),
  limitVision: () => limitVision(),
  limitUserDaily: (surface: string, userId: string, limit: number) =>
    limitUserDaily(surface, userId, limit),
  refundUserDaily: (surface: string, userId: string) => refundUserDaily(surface, userId),
}));

vi.mock("@/lib/billing/entitlements.server", () => ({
  resolveEntitlement: (surface: string) => resolveEntitlement(surface),
  isWithinFreeTrial: vi.fn(async () => true),
  spendTutorCredit: vi.fn(async () => false),
}));

vi.mock("@/lib/billing/usage.server", () => ({
  recordAiUsage: (args: unknown) => recordAiUsage(args),
}));

vi.mock("@/lib/ai/provider", () => ({
  chooseProvider: () => "anthropic",
  streamTutorReply: (args: { forceLocal?: boolean }) => streamTutorReply(args),
  completeCoachText: (args: unknown) => completeCoachText(args),
  completeVisionText: (args: unknown) => completeVisionText(args),
}));

let tutorPost: (req: Request) => Promise<Response>;
let coachPost: (req: Request) => Promise<Response>;
let visionPost: (req: Request) => Promise<Response>;

beforeAll(async () => {
  [{ POST: tutorPost }, { POST: coachPost }, { POST: visionPost }] = await Promise.all([
    import("@/app/api/tutor/route"),
    import("@/app/api/coach/route"),
    import("@/app/api/vision/route"),
  ]);
}, 60_000);

beforeEach(() => vi.clearAllMocks());

describe("AI routes during a shared-limiter outage", () => {
  it("answers tutor messages locally without consuming provider allowance", async () => {
    const res = await tutorPost(
      new Request("https://k53.test/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "What does a stop sign mean?" }] }),
      }),
    );

    expect(res.status).toBe(200);
    expect(streamTutorReply).toHaveBeenCalledWith(expect.objectContaining({ forceLocal: true }));
    // A paying learner is told why the answer is simpler, not left guessing.
    expect(res.headers.get("x-tutor-mode")).toBe("basic");
    expect(limitUserDaily).not.toHaveBeenCalled();
    expect(recordAiUsage).not.toHaveBeenCalled();
  });

  it("returns local coach copy without calling a model", async () => {
    const res = await coachPost(
      new Request("https://k53.test/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "session_recap",
          data: { mode: "questions", correct: 8, total: 10, seconds: 300 },
        }),
      }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ model: "local" });
    expect(completeCoachText).not.toHaveBeenCalled();
    expect(limitUserDaily).not.toHaveBeenCalled();
    expect(recordAiUsage).not.toHaveBeenCalled();
  });

  it("refuses vision work clearly before auth, parsing or provider spend", async () => {
    const res = await visionPost(
      new Request("https://k53.test/api/vision", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: { data: "x".repeat(120), mediaType: "image/jpeg" } }),
      }),
    );

    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ unavailable: true, error: "limiter_unavailable" });
    expect(resolveEntitlement).not.toHaveBeenCalled();
    expect(completeVisionText).not.toHaveBeenCalled();
  });

  it("reports a configured vision-provider failure as unavailable and refunds the scan", async () => {
    limitVision.mockResolvedValueOnce(LOCAL_ONLY);

    const res = await visionPost(
      new Request("https://k53.test/api/vision", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: { data: "x".repeat(120), mediaType: "image/jpeg" } }),
      }),
    );

    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({
      unavailable: true,
      error: "provider_unavailable",
    });
    expect(completeVisionText).toHaveBeenCalledTimes(1);
    expect(refundUserDaily).toHaveBeenCalledWith("vision", "paid-user");
  });
});
