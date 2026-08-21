import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChargeSuccessData } from "@/lib/paystack/apply";

/**
 * Regression tests for the worst bug this billing system has had: the
 * superseded-plan cleanup disabled the subscription the customer had JUST paid
 * for. Paystack endpoints have been observed returning `plan` as an empty
 * object `{}`; under `s.plan.plan_code !== paidPlanCode`, an unidentifiable
 * plan compared as "different" and every fresh subscription was flipped to
 * non-renewing ~1.5s after checkout (four-for-four in the production event
 * ledger). The rule now: unknown plans are untouchable.
 */

vi.mock("@/lib/paystack/client", () => ({
  fetchCustomer: vi.fn(),
  disableSubscription: vi.fn(),
}));
vi.mock("@/lib/notify/email", () => ({
  isEmailConfigured: false,
  sendEmail: vi.fn(),
}));

import { applyChargeSuccess } from "@/lib/paystack/apply";
import { fetchCustomer, disableSubscription } from "@/lib/paystack/client";

function fakeAdmin() {
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const eq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn((_values: Record<string, unknown>) => ({ eq }));
  const admin = { from: vi.fn(() => ({ upsert, update })) } as unknown as SupabaseClient;
  return { admin, upsert, update };
}

const charge: ChargeSuccessData = {
  id: 222,
  reference: "ref_paid",
  amount: 6000,
  customer: { customer_code: "CUS_x", email: "learner@example.com", first_name: "" },
  metadata: { kind: "subscription", plan: "premium", user_id: "user-1" },
  plan: { plan_code: "PLN_premium_monthly" },
};

const sub = (code: string, status: string, plan: unknown) =>
  ({ subscription_code: code, email_token: `tok_${code}`, status, plan }) as never;

beforeEach(() => {
  vi.mocked(fetchCustomer).mockReset();
  vi.mocked(disableSubscription).mockReset().mockResolvedValue(undefined as never);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("superseded-plan cleanup never touches what it cannot identify", () => {
  it("does NOT disable the fresh subscription when its plan comes back as {}", async () => {
    // The production killer: Paystack's customer embed returns the just-created
    // sub with plan {} — previously read as "different plan" → disabled.
    vi.mocked(fetchCustomer).mockResolvedValue({
      customer_code: "CUS_x",
      email: "learner@example.com",
      subscriptions: [sub("SUB_new", "active", {})],
    } as never);

    await applyChargeSuccess(fakeAdmin().admin, charge);

    expect(disableSubscription).not.toHaveBeenCalled();
  });

  it("does NOT disable anything when the embed omits plan entirely", async () => {
    vi.mocked(fetchCustomer).mockResolvedValue({
      customer_code: "CUS_x",
      email: "learner@example.com",
      subscriptions: [
        sub("SUB_mystery", "active", undefined),
        sub("SUB_also", "active", { plan_code: null }),
      ],
    } as never);

    await applyChargeSuccess(fakeAdmin().admin, charge);

    expect(disableSubscription).not.toHaveBeenCalled();
  });

  it("still disables a genuinely superseded KNOWN-plan subscription", async () => {
    // Plan switches must keep working: old Plus stays active beside new
    // Premium until this cleanup disables exactly the old one.
    vi.mocked(fetchCustomer).mockResolvedValue({
      customer_code: "CUS_x",
      email: "learner@example.com",
      subscriptions: [
        sub("SUB_old_plus", "active", { plan_code: "PLN_plus_monthly" }),
        sub("SUB_new_premium", "active", { plan_code: "PLN_premium_monthly" }),
      ],
    } as never);

    const { admin, update } = fakeAdmin();
    await applyChargeSuccess(admin, charge);

    expect(disableSubscription).toHaveBeenCalledTimes(1);
    expect(disableSubscription).toHaveBeenCalledWith("SUB_old_plus", "tok_SUB_old_plus");
    // Identity recorded for the matching current sub.
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ provider_subscription_id: "SUB_new_premium" }),
    );
  });

  it("handles a bare-string plan code (verify-endpoint shape)", async () => {
    vi.mocked(fetchCustomer).mockResolvedValue({
      customer_code: "CUS_x",
      email: "learner@example.com",
      subscriptions: [
        sub("SUB_string_plan", "active", "PLN_plus_annual"),
      ],
    } as never);

    await applyChargeSuccess(fakeAdmin().admin, charge);

    expect(disableSubscription).toHaveBeenCalledTimes(1);
    expect(disableSubscription).toHaveBeenCalledWith("SUB_string_plan", "tok_SUB_string_plan");
  });

  it("logs loudly when a grant lands without an identifiable current subscription", async () => {
    // provider_subscription_id staying null must never be silent again.
    const err = vi.spyOn(console, "error");
    vi.mocked(fetchCustomer).mockResolvedValue({
      customer_code: "CUS_x",
      email: "learner@example.com",
      subscriptions: [],
    } as never);

    await applyChargeSuccess(fakeAdmin().admin, charge);

    expect(err).toHaveBeenCalledWith(expect.stringMatching(/no active subscription matching plan/i));
  });
});
