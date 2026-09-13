import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * What happens when checkout cannot start.
 *
 * Written from a real afternoon. A learner arrived from Google, finished a
 * mini mock, hit the paywall and pressed the buy button **eight times over
 * three hours** — six of them in 29 seconds — before giving up and going back
 * to the free drill. The route was returning 5xx the whole time. Two things
 * were wrong and neither was the root cause:
 *
 *  - nothing told the operator, so it stayed broken all afternoon;
 *  - the page said "please try again in a moment", which for a missing Plan
 *    code or a rejected transaction is advice that can never come true.
 *
 * These pin both, because the next outage will have a different root cause and
 * the same two failures would otherwise repeat.
 */

const reportCheckoutFailure = vi.fn();
vi.mock("@/lib/ops/checkout-alert", () => ({
  reportCheckoutFailure: (...a: unknown[]) => reportCheckoutFailure(...a),
}));

vi.mock("@/lib/env", () => ({
  isPaystackConfigured: true,
  isSupabaseConfigured: true,
  assertSupabaseConfiguredInProduction: () => {},
  assertLivePaystackKeyInProduction: () => {},
  supabaseConfig: { url: "https://stub.supabase.co", anonKey: "anon" },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "u1", email: "a@b.com" } } }) },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }),
    }),
  }),
}));

vi.mock("@/lib/ai/rate-limit", () => ({
  clientIp: () => "203.0.113.7",
  limitCheckout: async () => ({ success: true, retryAfter: 0 }),
}));

const initializeTransaction = vi.fn();
vi.mock("@/lib/paystack/client", () => ({
  initializeTransaction: (...a: unknown[]) => initializeTransaction(...a),
}));

const { POST } = await import("@/app/api/checkout/route");

function buy(plan = "premium", cycle = "monthly") {
  return POST(
    new Request("https://k53mentorai.co.za/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan, cycle }),
    }),
  );
}

const PLAN_ENV = {
  PAYSTACK_PLAN_PREMIUM_MONTHLY: "PLN_live_premium_monthly",
  PAYSTACK_PLAN_PREMIUM_ANNUAL: "PLN_live_premium_annual",
  PAYSTACK_PLAN_PREMIUM_PLUS_MONTHLY: "PLN_live_plus_monthly",
  PAYSTACK_PLAN_PREMIUM_PLUS_ANNUAL: "PLN_live_plus_annual",
};

let consoleRestore: () => void;
beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(process.env, PLAN_ENV);
  initializeTransaction.mockResolvedValue({ authorization_url: "https://checkout.paystack.com/x" });
  const original = console.error;
  console.error = () => {};
  consoleRestore = () => {
    console.error = original;
  };
});

describe("checkout succeeds", () => {
  it("hands back the Paystack URL and alerts nobody", async () => {
    const res = await buy();
    consoleRestore();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: "https://checkout.paystack.com/x" });
    expect(reportCheckoutFailure).not.toHaveBeenCalled();
  });
});

describe("a missing Plan code", () => {
  beforeEach(() => {
    delete process.env.PAYSTACK_PLAN_PREMIUM_MONTHLY;
  });

  it("alerts the operator instead of failing silently", async () => {
    const res = await buy();
    consoleRestore();
    expect(res.status).toBe(500);
    expect(reportCheckoutFailure).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "plan_code_missing", plan: "premium", userId: "u1" }),
    );
  });

  it("tells the page this is not worth retrying", async () => {
    const res = await buy();
    consoleRestore();
    // `fault: "ours"` is what stops the screen saying "try again in a moment"
    // and what disables the button.
    expect((await res.json()).fault).toBe("ours");
    // Paystack is never called, so nobody is charged.
    expect(initializeTransaction).not.toHaveBeenCalled();
  });
});

describe("Paystack refusing the transaction", () => {
  beforeEach(() => {
    // The shape of the real thing: test-mode Plan codes against a live key.
    initializeTransaction.mockRejectedValue(
      new Error("Paystack /transaction/initialize: No plan with code PLN_live_premium_monthly"),
    );
  });

  it("alerts with Paystack's own message, which names the cause", async () => {
    const res = await buy();
    consoleRestore();
    expect(res.status).toBe(502);
    const call = reportCheckoutFailure.mock.calls[0][0];
    expect(call.reason).toBe("paystack_error");
    expect(String((call.err as Error).message)).toContain("No plan with code");
  });

  it("is also flagged as ours, because a retry cannot fix it either", async () => {
    const res = await buy();
    consoleRestore();
    expect((await res.json()).fault).toBe("ours");
  });
});

describe("what the buyer is not told", () => {
  it("never leaks Paystack's internals to the browser", async () => {
    initializeTransaction.mockRejectedValue(new Error("Paystack: secret key sk_live_abc invalid"));
    const res = await buy();
    consoleRestore();
    const body = JSON.stringify(await res.json());
    expect(body).not.toContain("sk_live");
    expect(body).not.toContain("Paystack");
  });
});
