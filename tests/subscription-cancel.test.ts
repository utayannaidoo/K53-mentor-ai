import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/paystack/client", () => ({
  fetchCustomer: vi.fn(),
  disableSubscription: vi.fn(),
}));

import { disableActiveSubscriptions, refundEligible } from "@/lib/billing/subscription-cancel";
import { fetchCustomer, disableSubscription } from "@/lib/paystack/client";

const customer = (statuses: string[]) => ({
  customer_code: "CUS_x",
  email: "l@example.com",
  subscriptions: statuses.map((status, i) => ({
    subscription_code: `SUB_${i}`,
    email_token: `tok_${i}`,
    status,
    plan: { plan_code: `PLN_${i}` },
  })),
});

beforeEach(() => {
  vi.mocked(fetchCustomer).mockReset();
  vi.mocked(disableSubscription).mockReset().mockResolvedValue(undefined as never);
});

describe("disableActiveSubscriptions", () => {
  it("disables every active subscription and returns the count", async () => {
    vi.mocked(fetchCustomer).mockResolvedValue(customer(["active", "active", "cancelled"]) as never);

    const n = await disableActiveSubscriptions("CUS_x");

    expect(n).toBe(2);
    expect(disableSubscription).toHaveBeenCalledTimes(2);
    expect(disableSubscription).toHaveBeenCalledWith("SUB_0", "tok_0");
    expect(disableSubscription).toHaveBeenCalledWith("SUB_1", "tok_1");
  });

  it("returns 0 and disables nothing when none are active", async () => {
    vi.mocked(fetchCustomer).mockResolvedValue(customer(["cancelled"]) as never);
    expect(await disableActiveSubscriptions("CUS_x")).toBe(0);
    expect(disableSubscription).not.toHaveBeenCalled();
  });

  it("propagates a disable failure so the caller won't proceed as if billing stopped", async () => {
    vi.mocked(fetchCustomer).mockResolvedValue(customer(["active"]) as never);
    vi.mocked(disableSubscription).mockRejectedValue(new Error("paystack 502"));
    await expect(disableActiveSubscriptions("CUS_x")).rejects.toThrow();
  });
});

describe("refundEligible", () => {
  const now = Date.now();
  const base = {
    tier: "premium",
    lastChargeReference: "ref_1",
    paidAt: new Date(now - 2 * 86_400_000).toISOString(), // 2 days ago
    moneyBackUsed: false,
  };

  it("is true within the 7-day window on a paid, unrefunded charge", () => {
    expect(refundEligible(base)).toBe(true);
  });

  it("is false once the window has passed", () => {
    expect(refundEligible({ ...base, paidAt: new Date(now - 8 * 86_400_000).toISOString() })).toBe(false);
  });

  it("is false when the guarantee was already used", () => {
    expect(refundEligible({ ...base, moneyBackUsed: true })).toBe(false);
  });

  it("is false on the free tier or with no charge reference", () => {
    expect(refundEligible({ ...base, tier: "free" })).toBe(false);
    expect(refundEligible({ ...base, lastChargeReference: null })).toBe(false);
  });
});
