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

/**
 * Minimal admin double: the grant upsert, plus the follow-up update that
 * records which Paystack subscription this row is (`provider_subscription_id`).
 */
function fakeAdmin() {
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const eq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn(() => ({ eq }));
  const admin = { from: vi.fn(() => ({ upsert, update })) } as unknown as SupabaseClient;
  return { admin, upsert, update, eq };
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

describe("applyChargeSuccess — recording the subscription code", () => {
  /**
   * `provider_subscription_id` has existed since 0001 and was never written, so
   * cancellation depended entirely on `provider_customer_id` plus a live
   * Paystack customer fetch. We already know the answer at this point — the
   * reconciliation loop above just identified which subscription matches the
   * plan that was paid for.
   */
  it("records the subscription matching the plan just paid for", async () => {
    const { admin, update, eq } = fakeAdmin();
    vi.mocked(fetchCustomer).mockResolvedValue(customerWithStale as never);
    vi.mocked(disableSubscription).mockResolvedValue(undefined as never);

    await applyChargeSuccess(admin, charge);

    // SUB_new, never SUB_old — the stale one was just cancelled.
    expect(update).toHaveBeenCalledWith({ provider_subscription_id: "SUB_new" });
    expect(eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("does not throw when recording it fails", async () => {
    // Best-effort by design: throwing here releases the ledger row and replays
    // a charge that has already been granted, to save a nice-to-have column.
    const { admin, eq } = fakeAdmin();
    eq.mockResolvedValue({ error: { message: "column is missing" } });
    vi.mocked(fetchCustomer).mockResolvedValue(customerWithStale as never);
    vi.mocked(disableSubscription).mockResolvedValue(undefined as never);

    await expect(applyChargeSuccess(admin, charge)).resolves.toBeUndefined();
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("skips silently when the customer has no matching active subscription", async () => {
    const { admin, update } = fakeAdmin();
    vi.mocked(fetchCustomer).mockResolvedValue({
      ...customerWithStale,
      subscriptions: [
        { ...customerWithStale.subscriptions[1], status: "cancelled" },
      ],
    } as never);

    await applyChargeSuccess(admin, charge);
    expect(update).not.toHaveBeenCalled();
  });
});

describe("applyChargeSuccess — price mismatch", () => {
  /**
   * Paystack bills the Plan's dashboard amount, not the amount checkout sends.
   * A mismatch means the site advertised one price and the card was charged
   * another. The tier is still granted — the buyer paid in good faith and the
   * fault is a number in a dashboard — but it must be shouted about.
   */
  const overcharged: ChargeSuccessData = { ...charge, amount: 9000 };

  it("still grants the tier", async () => {
    const { admin, upsert } = fakeAdmin();
    vi.mocked(fetchCustomer).mockResolvedValue(customerWithStale as never);
    vi.mocked(disableSubscription).mockResolvedValue(undefined as never);

    await applyChargeSuccess(admin, overcharged);

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ tier: "premium", status: "active" }),
      expect.anything(),
    );
  });

  it("emails an operator alert as well as the buyer's receipt", async () => {
    const { admin } = fakeAdmin();
    vi.mocked(fetchCustomer).mockResolvedValue(customerWithStale as never);
    vi.mocked(disableSubscription).mockResolvedValue(undefined as never);

    await applyChargeSuccess(admin, overcharged);

    const subjects = vi.mocked(sendEmail).mock.calls.map((c) => c[0].subject);
    expect(subjects.some((s) => /price mismatch/i.test(s))).toBe(true);
    expect(subjects.some((s) => /payment received/i.test(s))).toBe(true);
  });

  it("sends no alert when the amount is exactly what the site advertises", async () => {
    const { admin } = fakeAdmin();
    vi.mocked(fetchCustomer).mockResolvedValue(customerWithStale as never);
    vi.mocked(disableSubscription).mockResolvedValue(undefined as never);

    await applyChargeSuccess(admin, charge); // amount 6000 = R60 = premium monthly

    const subjects = vi.mocked(sendEmail).mock.calls.map((c) => c[0].subject);
    expect(subjects.some((s) => /price mismatch/i.test(s))).toBe(false);
  });
});
