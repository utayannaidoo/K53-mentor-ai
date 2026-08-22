import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChargeSuccessData } from "@/lib/paystack/apply";

/**
 * Same-plan duplicate guard: cancel→re-subscribe edge cases can leave TWO
 * ACTIVE subscriptions on the SAME plan code. The superseded-plan guard only
 * covers CROSS-plan switches, so both duplicates sailed past it and Paystack
 * kept charging the learner for every copy. After a successful tier grant,
 * the newest duplicate must be kept and every older one disabled — best
 * effort, never throwing past the grant.
 *
 * Survivor rule pinned here: latest `next_payment_date` wins; when dates are
 * missing or equal, the subscription whose CODE sorts last wins, so repeated
 * webhooks converge instead of flapping.
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
  const rpc = vi.fn().mockResolvedValue({ error: null });
  // `rpc` sits at the client root (credit grants), `upsert`/`update` under from().
  const admin = { rpc, from: vi.fn(() => ({ upsert, update })) } as unknown as SupabaseClient;
  return { admin, upsert, update, rpc };
}

const charge: ChargeSuccessData = {
  id: 333,
  reference: "ref_dup",
  amount: 6000,
  customer: { customer_code: "CUS_dup", email: "learner@example.com", first_name: "" },
  metadata: { kind: "subscription", plan: "premium", user_id: "user-1" },
  plan: { plan_code: "PLN_premium_monthly" },
};

/** An ACTIVE subscription on the just-paid plan unless overridden. */
const sub = (code: string, overrides: Record<string, unknown> = {}) =>
  ({
    subscription_code: code,
    email_token: `tok_${code}`,
    status: "active",
    plan: { plan_code: "PLN_premium_monthly" },
    ...overrides,
  }) as never;

let errLog: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.mocked(fetchCustomer).mockReset();
  vi.mocked(disableSubscription).mockReset().mockResolvedValue(undefined as never);
  errLog = vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("same-plan duplicate collapse", () => {
  it("disables the OLDER duplicate and keeps + records the newest", async () => {
    vi.mocked(fetchCustomer).mockResolvedValue({
      customer_code: "CUS_dup",
      email: "learner@example.com",
      subscriptions: [
        sub("SUB_old_dup", { next_payment_date: "2026-09-01T00:00:00.000Z" }),
        sub("SUB_new_keep", { next_payment_date: "2026-09-20T00:00:00.000Z" }),
      ],
    } as never);

    const { admin, upsert, update } = fakeAdmin();
    await applyChargeSuccess(admin, charge);

    // The tier grant ran exactly once…
    expect(upsert).toHaveBeenCalledTimes(1);
    // …exactly the older duplicate was disabled…
    expect(disableSubscription).toHaveBeenCalledTimes(1);
    expect(disableSubscription).toHaveBeenCalledWith("SUB_old_dup", "tok_SUB_old_dup");
    expect(disableSubscription).not.toHaveBeenCalledWith("SUB_new_keep", "tok_SUB_new_keep");
    // …and the row points at the SURVIVOR, so the subscription.disable event
    // Paystack fires hits the webhook's mismatched-code guard, not our tier.
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ provider_subscription_id: "SUB_new_keep" }),
    );
  });

  it("keeps a single active subscription and disables nothing", async () => {
    vi.mocked(fetchCustomer).mockResolvedValue({
      customer_code: "CUS_dup",
      email: "learner@example.com",
      subscriptions: [sub("SUB_only")],
    } as never);

    const { admin } = fakeAdmin();
    await applyChargeSuccess(admin, charge);

    expect(disableSubscription).not.toHaveBeenCalled();
  });

  it("leaves DIFFERENT-plan actives alone (superseded guard owns those)", async () => {
    // Old Plus beside new Premium: exactly one disable, and it is the old
    // plan's — the duplicate guard must not add a second call.
    vi.mocked(fetchCustomer).mockResolvedValue({
      customer_code: "CUS_dup",
      email: "learner@example.com",
      subscriptions: [
        sub("SUB_old_plus", { plan: { plan_code: "PLN_plus_monthly" } }),
        sub("SUB_new_premium"),
      ],
    } as never);

    const { admin } = fakeAdmin();
    await applyChargeSuccess(admin, charge);

    expect(disableSubscription).toHaveBeenCalledTimes(1);
    expect(disableSubscription).toHaveBeenCalledWith("SUB_old_plus", "tok_SUB_old_plus");
  });

  it("picks the code-sorting-last sub when period dates are missing/equal", async () => {
    // Deterministic convergence: no dates anywhere, so the lexicographic
    // tie-break decides — and would decide the SAME way on every redelivery.
    vi.mocked(fetchCustomer).mockResolvedValue({
      customer_code: "CUS_dup",
      email: "learner@example.com",
      subscriptions: [sub("SUB_a_dup"), sub("SUB_b_dup", { next_payment_date: null })],
    } as never);

    const { admin } = fakeAdmin();
    await applyChargeSuccess(admin, charge);

    expect(disableSubscription).toHaveBeenCalledTimes(1);
    expect(disableSubscription).toHaveBeenCalledWith("SUB_a_dup", "tok_SUB_a_dup");
    expect(disableSubscription).not.toHaveBeenCalledWith("SUB_b_dup", "tok_SUB_b_dup");
  });

  it("repeated applications converge on the same survivor", async () => {
    vi.mocked(fetchCustomer).mockResolvedValue({
      customer_code: "CUS_dup",
      email: "learner@example.com",
      subscriptions: [
        sub("SUB_older", { next_payment_date: "2026-09-01T00:00:00.000Z" }),
        sub("SUB_later", { next_payment_date: "2026-09-20T00:00:00.000Z" }),
      ],
    } as never);

    const { admin } = fakeAdmin();
    await applyChargeSuccess(admin, charge);
    await applyChargeSuccess(admin, charge);

    expect(disableSubscription).toHaveBeenNthCalledWith(1, "SUB_older", "tok_SUB_older");
    expect(disableSubscription).toHaveBeenNthCalledWith(2, "SUB_older", "tok_SUB_older");
    expect(disableSubscription).not.toHaveBeenCalledWith("SUB_later", "tok_SUB_later");
  });

  it("swallows a failed disable: no throw, grant stands, ops are told", async () => {
    // The ledger row is already committed, so throwing would replay an
    // applied charge AND still leave the duplicate billing. Log loudly instead.
    vi.mocked(fetchCustomer).mockResolvedValue({
      customer_code: "CUS_dup",
      email: "learner@example.com",
      subscriptions: [sub("SUB_old_dup"), sub("SUB_keep_me")],
    } as never);
    vi.mocked(disableSubscription).mockRejectedValue(new Error("paystack 502"));

    const { admin, upsert } = fakeAdmin();
    await expect(applyChargeSuccess(admin, charge)).resolves.toBeUndefined();

    expect(upsert).toHaveBeenCalledTimes(1);
    expect(errLog.mock.calls.some((c: unknown[]) => String(c[0]).includes("FAILED to disable duplicate"))).toBe(
      true,
    );
  });

  it("swallows a fetchCustomer rejection after the grant", async () => {
    vi.mocked(fetchCustomer).mockRejectedValue(new Error("paystack down"));

    const { admin, upsert } = fakeAdmin();
    await expect(applyChargeSuccess(admin, charge)).resolves.toBeUndefined();

    expect(upsert).toHaveBeenCalledTimes(1);
    expect(disableSubscription).not.toHaveBeenCalled();
  });

  it("never fetches the customer for a tutor top-up or plan-less charge", async () => {
    const topup: ChargeSuccessData = {
      ...charge,
      reference: "ref_topup",
      plan: null,
      metadata: { kind: "tutor_topup", user_id: "user-1", credits: "100" },
    };
    const { admin, rpc } = fakeAdmin();
    await applyChargeSuccess(admin, topup);

    // Top-ups bank credits and stop — no Paystack customer round-trip at all.
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(fetchCustomer).not.toHaveBeenCalled();
    expect(disableSubscription).not.toHaveBeenCalled();

    // A plan-less charge with checkout metadata isn't ours either way.
    vi.mocked(fetchCustomer).mockClear();
    await applyChargeSuccess(admin, {
      ...charge,
      reference: "ref_planless",
      plan: null,
      metadata: { kind: "subscription", plan: "premium", user_id: "user-1" },
    });
    expect(fetchCustomer).not.toHaveBeenCalled();
  });
});
