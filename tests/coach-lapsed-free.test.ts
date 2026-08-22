import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Which engine writes a free account's coach copy.
 *
 * Mirrors tutor-trial-routing: the free week gets the real model (coach copy is
 * part of what's being evaluated); a LAPSED free account gets the local
 * template — otherwise every stale signup cost up to 12 provider calls a day
 * forever. Paid tiers never go local, whatever their account age.
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

describe("coach spend follows the trial", () => {
  it("calls the provider inside the free week", async () => {
    const res = await askRecap();
    expect(res.status).toBe(200);
    expect(completeCoachText).toHaveBeenCalledTimes(1);
  });

  it("never calls it for an account past the free week", async () => {
    profileRow = { onboarded_at: null, created_at: new Date(Date.now() - 30 * DAY_MS).toISOString() };
    await askRecap();
    expect(completeCoachText).not.toHaveBeenCalled();
    // The learner still gets copy — from the local template, model "local".
    const body = (await (await askRecap()).json()) as { model?: string };
    expect(body.model).toBe("local");
  });

  it("paid tiers keep the provider whatever their age", async () => {
    subscriptionRow = { tier: "premium", status: "active" };
    profileRow = { onboarded_at: null, created_at: new Date(Date.now() - 400 * DAY_MS).toISOString() };
    await askRecap();
    expect(completeCoachText).toHaveBeenCalledTimes(1);
  });
});
