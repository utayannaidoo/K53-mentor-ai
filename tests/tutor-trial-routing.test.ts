import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Who the tutor route answers, and with which engine.
 *
 * The AI tutor is a paid feature. A free account is refused before anything is
 * metered or sent to a provider; a paid account always reaches the cascade.
 *
 * Only the Supabase reads are stubbed here — `resolveEntitlement` runs for
 * real, because the wiring between it and the route is the thing that breaks.
 */

const DAY_MS = 86_400_000;

let subscriptionRow: { tier: string; status: string } | null = null;
let profileRow: { onboarded_at: string | null; created_at: string | null } | null = null;
let adminAvailable = true;
/** Fails the profile read, standing in for a Supabase outage. */
let profileReadThrows = false;

const singleRow = <T>(row: T) => ({
  select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: row }) }) }),
});

vi.mock("@/lib/env", () => ({
  isSupabaseConfigured: true,
  assertSupabaseConfiguredInProduction: () => {},
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "u1" } } }) },
    from: () => singleRow(subscriptionRow),
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () =>
    adminAvailable
      ? {
          from: () => ({
            select: () => ({
              eq: () => ({
                maybeSingle: async () => {
                  if (profileReadThrows) throw new Error("supabase unreachable");
                  return { data: profileRow };
                },
              }),
            }),
          }),
        }
      : null,
}));

const refundUserDaily = vi.fn(async (_surface: string, _userId: string) => {});

vi.mock("@/lib/ai/rate-limit", () => ({
  clientIp: () => "203.0.113.7",
  limitTutor: async () => ({ success: true, retryAfter: 0 }),
  limitUserDaily: async () => ({ success: true, retryAfter: 0 }),
  refundUserDaily: (surface: string, userId: string) => refundUserDaily(surface, userId),
}));

const streamTutorReply = vi.fn(async (_args: { forceLocal?: boolean }) => ({
  stream: new ReadableStream<Uint8Array>({
    start(c) {
      c.close();
    },
  }),
  model: "stub",
  provider: "local" as const,
}));

vi.mock("@/lib/ai/provider", () => ({
  chooseProvider: () => "anthropic",
  streamTutorReply: (args: { forceLocal?: boolean }) => streamTutorReply(args),
}));

function post(): Promise<Response> {
  return POST(
    new Request("https://k53.test/api/tutor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "What is the pass mark?" }] }),
    }),
  );
}

/** Whether the route decided this caller gets the local explainer. */
async function askTutor(): Promise<boolean> {
  const res = await post();
  expect(res.status).toBe(200);
  expect(streamTutorReply).toHaveBeenCalledTimes(1);
  return streamTutorReply.mock.calls[0][0].forceLocal === true;
}

const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS).toISOString();

/**
 * Loaded once — the route pulls in the whole question bank for retrieval, and
 * that cold import can outrun vitest's 5s per-test timeout under load. The
 * mocks above are closures over module-level state, so a single import still
 * sees whatever each test sets.
 */
let POST: (req: Request) => Promise<Response>;

beforeAll(async () => {
  ({ POST } = await import("@/app/api/tutor/route"));
}, 60_000);

beforeEach(() => {
  vi.clearAllMocks();
  subscriptionRow = null; // no row = free tier
  profileRow = { onboarded_at: null, created_at: daysAgo(1) };
  adminAvailable = true;
  profileReadThrows = false;
});

describe("free tier", () => {
  it("is refused with upgrade_required, before any provider is reached", async () => {
    const res = await post();
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ error: "upgrade_required", tier: "free" });
    expect(streamTutorReply).not.toHaveBeenCalled();
  });

  it("is refused whatever the account's age — there is no free week", async () => {
    for (const age of [0, 3, 400]) {
      profileRow = { onboarded_at: null, created_at: daysAgo(age) };
      expect((await post()).status).toBe(403);
    }
    expect(streamTutorReply).not.toHaveBeenCalled();
  });

  it("a lapsed or cancelled subscription is free again", async () => {
    subscriptionRow = { tier: "premium", status: "cancelled" };
    expect((await post()).status).toBe(403);
  });
});

describe("paid tiers", () => {
  it("never force local", async () => {
    subscriptionRow = { tier: "premium", status: "active" };
    profileRow = { onboarded_at: null, created_at: daysAgo(400) };
    expect(await askTutor()).toBe(false);
  });

  it("keeps serving a past_due subscriber during Paystack's retry window", async () => {
    subscriptionRow = { tier: "premium_plus", status: "past_due" };
    profileRow = { onboarded_at: null, created_at: daysAgo(400) };
    expect(await askTutor()).toBe(false);
  });
});

describe("when the cascade falls through to the study notes", () => {
  // The stubbed provider always answers "local", which is exactly what an
  // outage or an empty DeepSeek balance looks like from the route.
  it("flags a paid learner's answer as basic and gives the message back", async () => {
    subscriptionRow = { tier: "premium", status: "active" };
    const res = await post();
    expect(res.headers.get("x-tutor-mode")).toBe("basic");
    expect(refundUserDaily).toHaveBeenCalledWith("tutor", "u1");
  });
});
