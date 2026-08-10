import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Which engine answers a free account's tutor message.
 *
 * The free tier is also the seven-day trial, so `tier === "free"` covers two
 * people with opposite economics: someone three days into deciding whether to
 * pay, and an account that lapsed months ago. Serving both the rule-based
 * explainer is cheap but hides the product from the only audience the free week
 * exists to convince; serving both a real model pays for stale signups forever.
 *
 * Only the Supabase reads are stubbed here — `resolveEntitlement` and
 * `isWithinFreeTrial` both run for real, because the wiring between them is the
 * thing that breaks.
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

vi.mock("@/lib/ai/rate-limit", () => ({
  clientIp: () => "203.0.113.7",
  limitTutor: async () => ({ success: true, retryAfter: 0 }),
  limitUserDaily: async () => ({ success: true, retryAfter: 0 }),
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

/** Whether the route decided this caller gets the local explainer. */
async function askTutor(): Promise<boolean> {
  const res = await POST(
    new Request("https://k53.test/api/tutor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "What is the pass mark?" }] }),
    }),
  );
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

describe("free tier, inside the free week", () => {
  it("reaches a real provider", async () => {
    expect(await askTutor()).toBe(false);
  });

  it("still reaches one on the last day of the week", async () => {
    // 6 days elapsed = day seven. The client's trialDaysRemaining() still shows
    // a day left here, and the two must not disagree about the same week.
    profileRow = { onboarded_at: null, created_at: daysAgo(6) };
    expect(await askTutor()).toBe(false);
  });

  it("treats an account with no anchoring timestamps as untouched", async () => {
    // Matches trialStartedAt()'s forgiving branch: never wall a brand-new
    // signup whose profile row hasn't been written yet.
    profileRow = { onboarded_at: null, created_at: null };
    expect(await askTutor()).toBe(false);
  });

  it("anchors on the earliest timestamp, not the latest", async () => {
    // A profile recreated last week must not hand out a second free week when
    // onboarding proves the learner started a month ago.
    profileRow = { onboarded_at: daysAgo(30), created_at: daysAgo(2) };
    expect(await askTutor()).toBe(true);
  });
});

describe("free tier, week expired", () => {
  it("falls back to the local explainer", async () => {
    profileRow = { onboarded_at: null, created_at: daysAgo(8) };
    expect(await askTutor()).toBe(true);
  });

  it("stays local for a long-lapsed account", async () => {
    profileRow = { onboarded_at: daysAgo(400), created_at: daysAgo(400) };
    expect(await askTutor()).toBe(true);
  });
});

describe("paid tiers", () => {
  it("never force local", async () => {
    subscriptionRow = { tier: "premium", status: "active" };
    // Deliberately expired, to prove tier short-circuits before the trial read.
    profileRow = { onboarded_at: null, created_at: daysAgo(400) };
    expect(await askTutor()).toBe(false);
  });

  it("keeps serving a past_due subscriber during Paystack's retry window", async () => {
    subscriptionRow = { tier: "premium_plus", status: "past_due" };
    profileRow = { onboarded_at: null, created_at: daysAgo(400) };
    expect(await askTutor()).toBe(false);
  });
});

describe("when the trial lookup fails", () => {
  /**
   * Forgiving, unlike the tier lookup, which fails closed. This decides which
   * engine answers a message already capped at 2/day, not what someone paid
   * for — so an outage must not quietly serve the worse tutor to new signups.
   */
  it("keeps a free account on the provider when the profile read throws", async () => {
    profileReadThrows = true;
    expect(await askTutor()).toBe(false);
  });

  it("keeps a free account on the provider when the profile is missing", async () => {
    profileRow = null;
    expect(await askTutor()).toBe(false);
  });

  it("keeps a free account on the provider with no admin client", async () => {
    adminAvailable = false;
    expect(await askTutor()).toBe(false);
  });
});
