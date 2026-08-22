import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * /api/paystack/verify binds a successful charge to the signed-in caller.
 *
 * Every checkout this app creates requires auth and stamps the buyer's id into
 * Paystack metadata, so the reference returned to that browser can only ever be
 * applied by them. These tests pin the two ways that invariant could erode:
 *
 *  1. presenting someone ELSE's reference (the classic check caught this), and
 *  2. presenting a reference whose metadata carries NO user_id at all — a
 *     legacy or foreign charge. The original guard treated absent as pass, so
 *     whoever polled such a reference first bound it to their own account.
 *     Absent must refuse like mismatched does.
 */

const limitCheckout = vi.fn();
const getUser = vi.fn();

vi.mock("@/lib/ai/rate-limit", () => ({
  clientIp: () => "203.0.113.7",
  limitCheckout: (...a: unknown[]) => limitCheckout(...a),
}));

vi.mock("@/lib/env", () => ({
  isPaystackConfigured: true,
  isSupabaseConfigured: true,
}));

const CALLER = "11111111-1111-4111-8111-111111111111";

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: () => getUser(),
    },
  }),
}));

const paymentEventsInsert = vi.fn();
const subscriptionSelect = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "payment_events") {
        return {
          insert: paymentEventsInsert,
          delete: () => ({ eq: async () => ({ error: null }) }),
        };
      }
      return {
        select: subscriptionSelect,
      };
    },
  }),
}));

const verifyTransaction = vi.fn();
const applyChargeSuccess = vi.fn();

vi.mock("@/lib/paystack/client", () => ({
  verifyTransaction: (...a: unknown[]) => verifyTransaction(...a),
}));

vi.mock("@/lib/paystack/apply", () => ({
  applyChargeSuccess: (...a: unknown[]) => applyChargeSuccess(...a),
}));

function txWith(metadata: Record<string, string> | null) {
  return {
    id: 42,
    status: "success",
    reference: "ref_abc123",
    amount: 6000,
    currency: "ZAR",
    customer: { customer_code: "CUST_1", email: "buyer@example.com" },
    metadata,
    plan: { plan_code: "PLN_premium_monthly" },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  limitCheckout.mockResolvedValue({ success: true, retryAfter: 0 });
  getUser.mockResolvedValue({ data: { user: { id: CALLER } } });
  paymentEventsInsert.mockResolvedValue({ error: null });
  subscriptionSelect.mockReturnValue({
    eq: () => ({
      maybeSingle: async () => ({
        data: { tier: "premium", status: "active" },
      }),
    }),
  });
});

let POST: typeof import("@/app/api/paystack/verify/route").POST;

async function loadRoute() {
  ({ POST } = await import("@/app/api/paystack/verify/route"));
}
await loadRoute();

function post(reference: unknown) {
  return POST(
    new Request("https://k53.test/api/paystack/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reference }),
    }),
  );
}

describe("/api/paystack/verify ownership", () => {
  it("applies a charge whose metadata names the caller", async () => {
    verifyTransaction.mockResolvedValue(txWith({ user_id: CALLER, kind: "subscription", plan: "premium" }));

    const res = await post("ref_abc123");
    expect(res.status).toBe(200);
    expect(applyChargeSuccess).toHaveBeenCalledTimes(1);
    const body = await res.json();
    expect(body).toMatchObject({ verified: true, tier: "premium" });
  });

  it("refuses a charge belonging to a different user", async () => {
    verifyTransaction.mockResolvedValue(txWith({ user_id: "22222222-2222-4222-8222-222222222222", kind: "subscription", plan: "premium" }));

    const res = await post("ref_someone_else");
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ error: "reference_mismatch" });
    // Nothing was claimed or granted: the ledger insert never ran.
    expect(paymentEventsInsert).not.toHaveBeenCalled();
    expect(applyChargeSuccess).not.toHaveBeenCalled();
  });

  it("refuses a successful charge whose metadata carries no user at all", async () => {
    // The regression this file exists for: absent used to mean "unclaimed, up
    // for grabs". It must read exactly like a foreign charge.
    verifyTransaction.mockResolvedValue(txWith(null));

    const res = await post("ref_ownerless");
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ error: "reference_mismatch" });
    expect(paymentEventsInsert).not.toHaveBeenCalled();
    expect(applyChargeSuccess).not.toHaveBeenCalled();
  });

  it("reports a failed transaction without granting anything", async () => {
    verifyTransaction.mockResolvedValue({ ...txWith({ user_id: CALLER }), status: "failed" });

    const res = await post("ref_failed");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ verified: false, status: "failed" });
    expect(applyChargeSuccess).not.toHaveBeenCalled();
  });
});
