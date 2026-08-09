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

/** Supabase-style chain double: `.update(v).eq(c, v)`, optionally `.select().maybeSingle()`. */
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
        update(values: Record<string, unknown>) {
          const call: UpdateCall = { table, values };
          return {
            eq(eqColumn: string, eqValue: unknown) {
              call.eqColumn = eqColumn;
              call.eqValue = eqValue;
              updates.push(call);
              const done = Promise.resolve({ error: null, data: null });
              return Object.assign(done, {
                select: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }),
              });
            },
          };
        },
      };
    },
  };
}

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => makeAdmin() }));

import { POST } from "@/app/api/paystack/webhook/route";

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
  process.env.PAYSTACK_SECRET_KEY = "sk_test_stub";
  vi.spyOn(console, "error").mockImplementation(() => {});
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
  it("downgrades the subscription whose charge was refunded", async () => {
    const res = await send("refund.processed", {
      transaction: { reference: "ref_first_charge" },
      status: "processed",
    });
    expect(res.status).toBe(200);
    expect(updates).toHaveLength(1);
    expect(updates[0].values).toMatchObject({ tier: "free", status: "canceled" });
    expect(updates[0].values).toHaveProperty("refunded_at");
  });

  it("matches on the charge reference, not the customer", async () => {
    // Matching by customer would strip a subscription when a one-off tutor
    // top-up is refunded.
    await send("refund.processed", { transaction: { reference: "ref_first_charge" } });
    expect(updates[0].eqColumn).toBe("last_charge_reference");
    expect(updates[0].eqValue).toBe("ref_first_charge");
  });

  it("accepts the flat transaction_reference shape too", async () => {
    await send("refund.processed", { transaction_reference: "ref_flat" });
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
