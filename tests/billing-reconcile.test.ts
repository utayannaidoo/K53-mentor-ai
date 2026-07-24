import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChargeSuccessData } from "@/lib/paystack/apply";

// The reconcile step calls Paystack; the receipt step calls email. Mock both so
// we can assert ordering (receipt must never send when reconcile fails) and that
// a failed disable propagates instead of being swallowed into a double-charge.
vi.mock("@/lib/paystack/client", () => ({
  fetchCustomer: vi.fn(),
  disableSubscription: vi.fn(),
}));
vi.mock("@/lib/notify/email", () => ({
  isEmailConfigured: true,
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

import { applyChargeSuccess } from "@/lib/paystack/apply";
import { fetchCustomer, disableSubscription } from "@/lib/paystack/client";
import { sendEmail } from "@/lib/notify/email";

/** Minimal admin double — the grant upsert is all applyChargeSuccess touches here. */
function fakeAdmin() {
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const admin = { from: vi.fn(() => ({ upsert })) } as unknown as SupabaseClient;
  return { admin, upsert };
}

/** A plan-change first charge: carries our metadata and the NEW plan's code. */
const charge: ChargeSuccessData = {
  id: 111,
  reference: "ref_new",
  amount: 6000,
  customer: { customer_code: "CUS_x", email: "learner@example.com", first_name: "Sam" },
  metadata: { kind: "subscription", plan: "premium", user_id: "user-1" },
  plan: { plan_code: "PLN_new" },
};

/** Customer with the just-created sub PLUS a stale one from the prior plan. */
const customerWithStale = {
  customer_code: "CUS_x",
  email: "learner@example.com",
  subscriptions: [
    { subscription_code: "SUB_old", email_token: "tok_old", status: "active", plan: { plan_code: "PLN_old" } },
    { subscription_code: "SUB_new", email_token: "tok_new", status: "active", plan: { plan_code: "PLN_new" } },
  ],
};

beforeEach(() => {
  vi.mocked(fetchCustomer).mockReset();
  vi.mocked(disableSubscription).mockReset();
  vi.mocked(sendEmail).mockReset().mockResolvedValue(undefined as never);
});

describe("applyChargeSuccess — plan-change reconciliation (no double charge)", () => {
  it("cancels the OLD subscription and keeps the new one", async () => {
    const { admin } = fakeAdmin();
    vi.mocked(fetchCustomer).mockResolvedValue(customerWithStale as never);
    vi.mocked(disableSubscription).mockResolvedValue(undefined as never);

    await applyChargeSuccess(admin, charge);

    // Exactly the stale sub is disabled — never the one just paid for.
    expect(disableSubscription).toHaveBeenCalledTimes(1);
    expect(disableSubscription).toHaveBeenCalledWith("SUB_old", "tok_old");
    // Receipt sends once reconciliation succeeded.
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("THROWS if the old subscription can't be disabled — so the charge is retried", async () => {
    const { admin } = fakeAdmin();
    vi.mocked(fetchCustomer).mockResolvedValue(customerWithStale as never);
    vi.mocked(disableSubscription).mockRejectedValue(new Error("paystack 502"));

    await expect(applyChargeSuccess(admin, charge)).rejects.toThrow();
    // A swallowed failure would be a permanent double-charge; the receipt must
    // NOT go out on a run that left the old subscription still billing.
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("is a no-op on a first purchase (only the new subscription exists)", async () => {
    const { admin } = fakeAdmin();
    vi.mocked(fetchCustomer).mockResolvedValue({
      ...customerWithStale,
      subscriptions: [customerWithStale.subscriptions[1]], // only PLN_new
    } as never);

    await applyChargeSuccess(admin, charge);

    expect(disableSubscription).not.toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});
