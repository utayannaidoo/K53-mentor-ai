import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Which engine writes a free account's coach copy.
 *
 * Free accounts are ad-supported and always get the local template — otherwise
 * every free signup could cost up to 12 provider calls a day forever. The
 * AI-written copy is part of what a subscription buys, whatever the account's
 * age.
 */

const DAY_MS = 86_400_000;

let subscriptionRow: { tier: string; status: string } | null = null;
let profileRow: { onboarded_at: string | null; created_at: string | null } | null = null;
let adminAvailable = true;

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
                maybeSingle: async () => ({ data: profileRow }),
              }),
            }),
          }),
        }
      : null,
}));

vi.mock("@/lib/ai/rate-limit", () => ({
  clientIp: () => "203.0.113.7",
  limitCoach: async () => ({ success: true, retryAfter: 0 }),
  limitUserDaily: async () => ({ success: true, retryAfter: 0 }),
}));

vi.mock("@/lib/billing/usage.server", () => ({
  recordAiUsage: async () => {},
}));

const completeCoachText = vi.fn(
  async (_args: { system: string; user: string; maxTokens: number }) => null,
);

vi.mock("@/lib/ai/provider", () => ({
  completeCoachText: (args: { system: string; user: string; maxTokens: number }) =>
    completeCoachText(args),
}));

async function askRecap(): Promise<Response> {
  return POST(
    new Request("https://k53.test/api/coach", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind: "session_recap",
        data: { mode: "questions", correct: 8, total: 10, seconds: 300 },
      }),
    }),
  );
}

let POST: (req: Request) => Promise<Response>;

beforeAll(async () => {
  ({ POST } = await import("@/app/api/coach/route"));
}, 60_000);

beforeEach(() => {
  vi.clearAllMocks();
  subscriptionRow = null;
  profileRow = { onboarded_at: null, created_at: new Date().toISOString() };
  adminAvailable = true;
});

describe("coach spend follows the plan", () => {
  it("never calls the provider for a free account, new or old", async () => {
    for (const age of [0, 3, 30]) {
      profileRow = { onboarded_at: null, created_at: new Date(Date.now() - age * DAY_MS).toISOString() };
      const res = await askRecap();
      expect(res.status).toBe(200);
      // The learner still gets copy — from the local template, model "local".
      expect(((await res.json()) as { model?: string }).model).toBe("local");
    }
    expect(completeCoachText).not.toHaveBeenCalled();
  });

  it("paid tiers keep the provider whatever their age", async () => {
    subscriptionRow = { tier: "premium", status: "active" };
    profileRow = { onboarded_at: null, created_at: new Date(Date.now() - 400 * DAY_MS).toISOString() };
    await askRecap();
    expect(completeCoachText).toHaveBeenCalledTimes(1);
  });
});
