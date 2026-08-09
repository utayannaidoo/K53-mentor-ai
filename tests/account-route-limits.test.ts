import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The account-management routes used to share exactly one bucket — the per-IP
 * `limitCheckout`. That is the wrong axis: cancelling, deleting and claiming a
 * referral are per-account actions, and South African mobile traffic is heavily
 * CGNAT'd, so one caller could exhaust the IP budget and stop a stranger behind
 * the same NAT from cancelling their own subscription or deleting their own
 * account.
 *
 * Each route now applies a per-user cap underneath the per-IP one. These tests
 * pin three things: the per-user limiter is consulted, it is keyed on the
 * caller's own id, and exceeding it returns 429 with a Retry-After rather than
 * completing a destructive action.
 */

const limitCheckout = vi.fn();
const limitUserDaily = vi.fn();

vi.mock("@/lib/ai/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ai/rate-limit")>();
  return {
    ...actual,
    clientIp: () => "203.0.113.7",
    limitCheckout: (...a: unknown[]) => limitCheckout(...a),
    limitUserDaily: (...a: unknown[]) => limitUserDaily(...a),
  };
});

vi.mock("@/lib/env", () => ({
  isSupabaseConfigured: true,
  isPaystackConfigured: true,
  supabaseConfig: { url: "https://stub.supabase.co", anonKey: "anon" },
}));

const USER = { id: "user-1", email: "learner@example.com" };

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: USER } }) },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }),
    }),
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }),
    }),
    rpc: async () => ({ data: true, error: null }),
  }),
}));

// Never reached in these cases — the limiter short-circuits first — but the
// modules must still resolve.
vi.mock("@/lib/paystack/client", () => ({
  refundTransaction: vi.fn(),
  fetchCustomer: vi.fn(),
  disableSubscription: vi.fn(),
}));
vi.mock("@/lib/billing/subscription-cancel", () => ({
  disableActiveSubscriptions: vi.fn(),
  refundEligible: () => false,
}));
vi.mock("@/lib/notify/email", () => ({ isEmailConfigured: false, sendEmail: vi.fn() }));
vi.mock("@/lib/account/deletion-code", () => ({
  generateDeletionCode: () => "123456",
  storeDeletionCode: vi.fn(),
  verifyDeletionCode: vi.fn(),
}));

const OK = { success: true, retryAfter: 0 };
const CAPPED = { success: false, retryAfter: 3600 };

type Handler = (req: Request) => Promise<Response>;

const routes: { name: string; surface: string; body: unknown; load: () => Promise<Handler> }[] = [
  {
    name: "billing/cancel",
    surface: "cancel",
    body: {},
    load: async () => (await import("@/app/api/billing/cancel/route")).POST,
  },
  {
    name: "account/delete",
    surface: "delete",
    body: { password: "x" },
    load: async () => (await import("@/app/api/account/delete/route")).POST,
  },
  {
    name: "account/delete/send-code",
    surface: "deletion_code",
    body: {},
    load: async () => (await import("@/app/api/account/delete/send-code/route")).POST,
  },
  {
    name: "referral",
    surface: "referral_claim",
    body: { code: "abcd1234" },
    load: async () => (await import("@/app/api/referral/route")).POST,
  },
];

const handlers = new Map<string, Handler>();

beforeAll(async () => {
  // Loaded once — these routes pull in Supabase and the billing stack, and a
  // cold import inside a test can outrun the per-test timeout under load.
  for (const r of routes) handlers.set(r.name, await r.load());
}, 60_000);

beforeEach(() => {
  vi.clearAllMocks();
  limitCheckout.mockResolvedValue(OK);
  limitUserDaily.mockResolvedValue(OK);
});

function post(name: string, body: unknown) {
  return handlers.get(name)!(
    new Request(`https://k53mentorai.co.za/api/${name}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe.each(routes)("POST /api/$name", ({ name, surface, body }) => {
  it("applies a per-account cap keyed on the caller's own id", async () => {
    await post(name, body);
    expect(limitUserDaily).toHaveBeenCalledWith(surface, USER.id, expect.any(Number));
  });

  it("returns 429 with Retry-After once the per-account cap is spent", async () => {
    limitUserDaily.mockResolvedValue(CAPPED);
    const res = await post(name, body);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("3600");
    expect(await res.json()).toMatchObject({ error: "rate_limited" });
  });

  it("still honours the per-IP limit ahead of it", async () => {
    // The IP bucket is the outer abuse guard; it must decline before we do any
    // per-account work.
    limitCheckout.mockResolvedValue({ success: false, retryAfter: 60 });
    const res = await post(name, body);

    expect(res.status).toBe(429);
    expect(limitUserDaily).not.toHaveBeenCalled();
  });
});

describe("per-account caps", () => {
  it("are generous enough never to be why someone can't stop being billed", async () => {
    const { ACCOUNT_DAILY_LIMIT } = await import("@/lib/ai/rate-limit");
    // One cancel is all anyone needs; the cap exists for abuse, not friction.
    expect(ACCOUNT_DAILY_LIMIT.cancel).toBeGreaterThanOrEqual(3);
    expect(ACCOUNT_DAILY_LIMIT.delete).toBeGreaterThanOrEqual(3);
    expect(ACCOUNT_DAILY_LIMIT.deletion_code).toBeGreaterThanOrEqual(3);
    expect(ACCOUNT_DAILY_LIMIT.referral_claim).toBeGreaterThanOrEqual(3);
  });
});
