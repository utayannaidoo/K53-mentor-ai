import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The three events that used to fall through the webhook's default branch and
 * be acknowledged with no trace. Each has a rule that is easy to "fix" wrongly
 * later, so the rule is pinned here rather than only in a comment:
 *
 *   subscription.not_renew  must NOT revoke access — it is paid through the
 *                           period, and any status outside active/trialing/
 *                           past_due makes entitlements fail closed.
 *   charge.dispute.create   must NOT downgrade — a dispute is a claim, not an
 *                           outcome.
 *   refund.processed        MUST downgrade, matched on the refunded charge's
 *                           reference so refunding a tutor top-up cannot strip
 *                           somebody's subscription.
 */

vi.mock("@/lib/paystack/client", () => ({
  verifyPaystackSignature: vi.fn(() => true),
  fetchCustomer: vi.fn(),
  disableSubscription: vi.fn(),
  verifyTransaction: vi.fn(),
}));
vi.mock("@/lib/notify/email", () => ({
  isEmailConfigured: false,
  sendEmail: vi.fn(),
}));

interface UpdateCall {
  table: string;
  values: Record<string, unknown>;
  eqColumn?: string;
  eqValue?: unknown;
}

const updates: UpdateCall[] = [];

/** Captured console.error spy — the identity guards log loudly on mismatch. */
let errLog: ReturnType<typeof vi.spyOn>;

/**
 * Row the `subscriptions` SELECT returns. `subscription.disable` reads
 * `current_period_end` before deciding whether to downgrade, so tests set this
 * to place the subscription inside or outside its paid period.
 */
let subscriptionRow: Record<string, unknown> | null = null;

/**
 * Supabase-style chain double: `.update(v).eq(c, v)`, and the read chain
 * `.select(cols).eq(c, v).maybeSingle()`.
 */
function makeAdmin() {
  return {
    from(table: string) {
      if (table === "payment_events") {
        return {
          insert: () => Promise.resolve({ error: null }),
          delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
        };
      }
      return {
        select() {
          return {
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: subscriptionRow, error: null }),
            }),
          };
        },
        update(values: Record<string, unknown>) {
          const call: UpdateCall = { table, values };
          type Filter = (col: string, val: unknown) => typeof chain;
          const chain: {
            eq: Filter;
            neq: Filter;
            select: () => { maybeSingle: () => Promise<{ data: unknown; error: null }> };
            then: Promise<{ error: null; data: null }>["then"];
          } = {
            eq(eqColumn: string, eqValue: unknown) {
              call.eqColumn = eqColumn;
              call.eqValue = eqValue;
              updates.push(call);
              return chain;
            },
            // Real queries chain further filters (e.g. .neq("tier","free"));
            // they only narrow the WHERE clause, so recording once at the
            // first filter is enough for the assertions below.
            neq() {
              return chain;
            },
            select: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }),
            then(res, rej) {
              return Promise.resolve({ error: null, data: null }).then(res, rej);
            },
          };
          return chain;
        },
      };
    },
  };
}

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => makeAdmin() }));

import { POST } from "@/app/api/paystack/webhook/route";
import { verifyTransaction } from "@/lib/paystack/client";

function send(event: string, data: unknown) {
  return POST(
    new Request("https://k53mentorai.co.za/api/paystack/webhook", {
      method: "POST",
      headers: { "x-paystack-signature": "stub", "content-type": "application/json" },
      body: JSON.stringify({ event, data }),
    }),
  );
}

beforeEach(() => {
  updates.length = 0;
  subscriptionRow = null;
  process.env.PAYSTACK_SECRET_KEY = "sk_test_stub";
  vi.mocked(verifyTransaction).mockReset();
  errLog = vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("subscription.disable", () => {
  /**
   * Paystack fires this the moment /subscription/disable is called — which is
   * during self-serve cancellation, NOT when the paid period runs out. A
   * blanket downgrade here silently undoes cancel-at-period-end: the learner
   * cancels, the webhook lands seconds later, and they lose the month they
   * already paid for anyway.
   */
  it("does NOT downgrade while the paid period is still running", async () => {
    subscriptionRow = {
      current_period_end: new Date(Date.now() + 12 * 86_400_000).toISOString(),
    };
    const res = await send("subscription.disable", {
      subscription_code: "SUB_1",
      customer: { customer_code: "CUS_1" },
    });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(1);
    expect(updates[0].values).toEqual({ cancel_at_period_end: true });
    expect(updates[0].values).not.toHaveProperty("tier");
  });

  it("downgrades once the paid period has passed", async () => {
    subscriptionRow = {
      current_period_end: new Date(Date.now() - 86_400_000).toISOString(),
    };
    await send("subscription.disable", {
      subscription_code: "SUB_1",
      customer: { customer_code: "CUS_1" },
    });
    expect(updates[0].values).toMatchObject({ tier: "free", status: "canceled" });
  });

  it("downgrades when no period end was ever recorded", async () => {
    // Subscriptions that predate current_period_end being written. Keeping
    // access on an unknown date would be indefinite free access.
    subscriptionRow = { current_period_end: null };
    await send("subscription.disable", {
      subscription_code: "SUB_1",
      customer: { customer_code: "CUS_1" },
    });
    expect(updates[0].values).toMatchObject({ tier: "free", status: "canceled" });
  });

  it("ignores a disable for a superseded plan (plan switch cleanup)", async () => {
    // applyChargeSuccess disables the OLD plan after granting the new one, and
    // Paystack fires this event for it. The row points at the NEW subscription;
    // downgrading here would strip a tier paid for seconds earlier — observed
    // in production on a Plus→Premium switch.
    subscriptionRow = {
      current_period_end: new Date(Date.now() - 86_400_000).toISOString(), // even a past period must not trigger
      provider_subscription_id: "SUB_NEW_PREMIUM",
    };
    await send("subscription.disable", {
      subscription_code: "SUB_OLD_PLUS",
      customer: { customer_code: "CUS_1" },
    });
    expect(updates).toHaveLength(0);
  });

  it("still handles the disable when the event matches the recorded subscription", async () => {
    // Self-serve cancel and Paystack-initiated disables concern the sub our
    // row represents — normal handling applies.
    subscriptionRow = {
      current_period_end: new Date(Date.now() - 86_400_000).toISOString(),
      provider_subscription_id: "SUB_CURRENT",
    };
    await send("subscription.disable", {
      subscription_code: "SUB_CURRENT",
      customer: { customer_code: "CUS_1" },
    });
    expect(updates[0].values).toMatchObject({ tier: "free", status: "canceled" });
  });
});

describe("subscription.not_renew", () => {
  it("flags the row without touching tier or status", async () => {
    const res = await send("subscription.not_renew", {
      subscription_code: "SUB_1",
      customer: { customer_code: "CUS_1" },
    });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(1);
    expect(updates[0].values).toEqual({ cancel_at_period_end: true });
    // The learner paid through the period — revoking now would be theft.
    expect(updates[0].values).not.toHaveProperty("tier");
    expect(updates[0].values).not.toHaveProperty("status");
    expect(updates[0].eqColumn).toBe("provider_customer_id");
  });

  it("flags the row when the event matches the recorded subscription", async () => {
    subscriptionRow = { provider_subscription_id: "SUB_1" };
    const res = await send("subscription.not_renew", {
      subscription_code: "SUB_1",
      customer: { customer_code: "CUS_1" },
    });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(1);
    expect(updates[0].values).toEqual({ cancel_at_period_end: true });
  });

  it("skips a not_renew naming a DIFFERENT subscription than the row records", async () => {
    // Identity guard, mirroring subscription.disable: one customer's
    // lifecycle event must never mutate another row on a colliding or
    // tampered customer mapping. Skipped loudly, still acknowledged so
    // Paystack stops redelivering an event that will never match.
    subscriptionRow = { provider_subscription_id: "SUB_MINE" };
    const res = await send("subscription.not_renew", {
      subscription_code: "SUB_THEIRS",
      customer: { customer_code: "CUS_1" },
    });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(0);
    expect(
      errLog.mock.calls.some(
        (c: unknown[]) => c.join(" ").includes("not_renew") && c.join(" ").includes("SUB_THEIRS"),
      ),
    ).toBe(true);
  });

  it("legacy rows without a recorded subscription id fall through to the customer rule", async () => {
    // Precedent pinned by subscription.disable: pre-0008 rows carry no
    // provider_subscription_id, so there is nothing to compare against and
    // handling is unchanged.
    subscriptionRow = { provider_subscription_id: null };
    const res = await send("subscription.not_renew", {
      subscription_code: "SUB_1",
      customer: { customer_code: "CUS_1" },
    });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(1);
    expect(updates[0].values).toEqual({ cancel_at_period_end: true });
  });
});

describe("invoice.payment_failed", () => {
  it("marks the row past_due when the failed subscription matches the record", async () => {
    subscriptionRow = { tier: "premium", provider_subscription_id: "SUB_7" };
    const res = await send("invoice.payment_failed", {
      customer: { customer_code: "CUS_1", email: "l@example.com" },
      subscription: { subscription_code: "SUB_7" },
    });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(1);
    expect(updates[0].values).toEqual({ status: "past_due" });
    expect(updates[0].eqColumn).toBe("provider_customer_id");
  });

  it("accepts the flat subscription_code delivery shape too", async () => {
    // webhookLedgerId keys this event on the flat field; deliveries have been
    // seen nested and flat, so the identity guard must read both.
    subscriptionRow = { tier: "premium", provider_subscription_id: "SUB_7" };
    const res = await send("invoice.payment_failed", {
      customer: { customer_code: "CUS_1" },
      subscription_code: "SUB_7",
    });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(1);
    expect(updates[0].values).toEqual({ status: "past_due" });
  });

  it("skips a failure naming a different subscription than the row records", async () => {
    // Same mismatched-code rule as subscription.disable: no past_due flag,
    // no dunning email, loud log, still acknowledged so Paystack stops.
    subscriptionRow = { tier: "premium_plus", provider_subscription_id: "SUB_MINE" };
    const res = await send("invoice.payment_failed", {
      customer: { customer_code: "CUS_1", email: "l@example.com" },
      subscription: { subscription_code: "SUB_THEIRS" },
    });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(0);
    expect(
      errLog.mock.calls.some(
        (c: unknown[]) =>
          c.join(" ").includes("payment_failed") && c.join(" ").includes("SUB_THEIRS"),
      ),
    ).toBe(true);
  });

  it("legacy rows without a recorded subscription id still get the grace state", async () => {
    subscriptionRow = { tier: "premium", provider_subscription_id: null };
    const res = await send("invoice.payment_failed", {
      customer: { customer_code: "CUS_1" },
      subscription: { subscription_code: "SUB_ANY" },
    });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(1);
    expect(updates[0].values).toEqual({ status: "past_due" });
  });

  it("is still acknowledged when the payload carries no customer", async () => {
    // Paystack must not be left retrying an event we can't attribute.
    const res = await send("invoice.payment_failed", {
      subscription: { subscription_code: "SUB_7" },
    });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(0);
  });
});

describe("charge.dispute.create", () => {
  it("records the dispute without downgrading", async () => {
    const res = await send("charge.dispute.create", {
      transaction: { reference: "ref_disputed" },
      customer: { customer_code: "CUS_1" },
      amount: 6000,
      status: "awaiting-merchant-feedback",
    });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(1);
    expect(Object.keys(updates[0].values)).toEqual(["disputed_at"]);
    expect(updates[0].values).not.toHaveProperty("tier");
  });

  it("is still acknowledged when the payload carries no customer", async () => {
    // Paystack must not be left retrying an event we can't attribute.
    const res = await send("charge.dispute.create", { transaction: { reference: "r" } });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(0);
  });
});

describe("refund.processed", () => {
  it("downgrades by customer when Paystack confirms a subscription charge", async () => {
    // Renewal charges never land in last_charge_reference, so the only way a
    // renewal refundee loses their tier is via this lookup path.
    vi.mocked(verifyTransaction).mockResolvedValue({
      id: 7,
      status: "success",
      reference: "ref_renewal",
      customer: { customer_code: "CUS_9", email: "a@b.c" },
      plan: { plan_code: "PLN_premium" },
    });
    const res = await send("refund.processed", {
      transaction: { reference: "ref_renewal" },
      status: "processed",
    });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(1);
    expect(updates[0].values).toMatchObject({ tier: "free", status: "canceled" });
    expect(updates[0].values).toHaveProperty("refunded_at");
    expect(updates[0].eqColumn).toBe("provider_customer_id");
    expect(updates[0].eqValue).toBe("CUS_9");
  });

  it("does NOT strip a subscription when the refunded charge was a tutor top-up", async () => {
    vi.mocked(verifyTransaction).mockResolvedValue({
      id: 8,
      status: "success",
      reference: "ref_topup",
      customer: { customer_code: "CUS_9", email: "a@b.c" },
      plan: null,
    });
    const res = await send("refund.processed", { transaction: { reference: "ref_topup" } });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(0);
  });

  it("falls back to the last_charge_reference match when the lookup fails", async () => {
    // Paystack outage must not turn a refund into a no-op for first charges,
    // which are exactly the ones recorded in last_charge_reference.
    vi.mocked(verifyTransaction).mockRejectedValue(new Error("paystack down"));
    const res = await send("refund.processed", {
      transaction: { reference: "ref_first_charge" },
      status: "processed",
    });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(1);
    expect(updates[0].values).toMatchObject({ tier: "free", status: "canceled" });
    expect(updates[0].eqColumn).toBe("last_charge_reference");
    expect(updates[0].eqValue).toBe("ref_first_charge");
  });

  it("accepts the flat transaction_reference shape too", async () => {
    vi.mocked(verifyTransaction).mockRejectedValue(new Error("paystack down"));
    await send("refund.processed", { transaction_reference: "ref_flat" });
    expect(updates[0].eqColumn).toBe("last_charge_reference");
    expect(updates[0].eqValue).toBe("ref_flat");
  });

  it("does nothing when no reference is present", async () => {
    // Without a reference an update would match every row and free the whole
    // customer base.
    const res = await send("refund.processed", { status: "processed" });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(0);
  });
});
