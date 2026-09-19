import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Referral commission taken as credit (0042), on the TypeScript side.
 *
 * The SQL rules (settle once, spend once, never past the balance, the ledger
 * adds up) are proven against real Postgres by supabase/tests/
 * school_commission_credit.sql. What this file pins is the choreography
 * around Paystack: debit before refund, credit back when the refund fails,
 * and a credit-paid refund that the webhook must not read as a cancellation.
 */

vi.mock("@/lib/paystack/client", () => ({
  refundTransaction: vi.fn(),
  fetchCustomer: vi.fn(),
  disableSubscription: vi.fn(),
}));

import { refundTransaction } from "@/lib/paystack/client";
import {
  accrueSchoolCredit,
  creditModePartners,
  linkedWorkspaces,
  periodCostCents,
  redeemSchoolCredit,
} from "@/lib/billing/school-credit";
import { isCreditRedemption, routeSchoolEvent, SchoolBillingError } from "@/lib/billing/school-billing";

const SCHOOL_ENV = {
  PAYSTACK_PLAN_SCHOOL_SOLO_MONTHLY: "PLN_school_solo_m",
  PAYSTACK_PLAN_SCHOOL_TEAM_MONTHLY: "PLN_school_team_m",
  PAYSTACK_PLAN_SCHOOL_TEAM_ANNUAL: "PLN_school_team_a",
};
const ORIGINAL_ENV = { ...process.env };

type Result = { data: unknown; error: { code?: string; message: string } | null };

/**
 * A stand-in admin client: every table answers with a canned result, every
 * RPC with a canned result, and every call is recorded in order.
 */
function fakeAdmin(opts: { tables?: Record<string, Result>; rpc?: Record<string, Result> } = {}) {
  const log: string[] = [];
  const updates: { table: string; values: unknown }[] = [];
  const admin = {
    rpc: vi.fn(async (name: string, args: unknown) => {
      log.push(`rpc ${name} ${JSON.stringify(args)}`);
      return opts.rpc?.[name] ?? { data: null, error: null };
    }),
    from(table: string) {
      log.push(`from ${table}`);
      const result = () => opts.tables?.[table] ?? { data: [], error: null };
      const builder: Record<string, unknown> = {};
      for (const method of ["select", "eq", "in", "not", "limit", "order"]) builder[method] = () => builder;
      builder.update = (values: unknown) => {
        updates.push({ table, values });
        return builder;
      };
      builder.maybeSingle = async () => {
        const r = result();
        return { data: Array.isArray(r.data) ? (r.data[0] ?? null) : r.data, error: r.error };
      };
      builder.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
        Promise.resolve(result()).then(resolve, reject);
      return builder;
    },
  };
  return { admin: admin as unknown as SupabaseClient, log, updates, rpc: admin.rpc };
}

const running = (over: Record<string, unknown> = {}) => ({
  data: [
    {
      status: "active",
      plan_code: "PLN_school_solo_m",
      last_charge_reference: "ch_latest",
      credit_cents: 25000,
      ...over,
    },
  ],
  error: null,
});

beforeEach(() => {
  Object.assign(process.env, SCHOOL_ENV);
  vi.mocked(refundTransaction).mockReset().mockResolvedValue({} as never);
  // Re-spying returns the same spy, so clear what earlier tests logged.
  vi.spyOn(console, "error").mockImplementation(() => {}).mockClear();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("redeemSchoolCredit", () => {
  it("debits the credit first, then refunds exactly the plan's price of the latest charge", async () => {
    const { admin, log } = fakeAdmin({
      tables: { school_subscriptions: running() },
      rpc: { redeem_school_credit: { data: "ledger-1", error: null } },
    });
    vi.mocked(refundTransaction).mockImplementation(async () => {
      log.push("refund");
      return {} as never;
    });

    const outcome = await redeemSchoolCredit(admin, "school-1");

    expect(outcome).toEqual({ ok: true, amountCents: 19900, reference: "ch_latest" });
    const debit = log.findIndex((l) => l.startsWith("rpc redeem_school_credit"));
    expect(debit).toBeGreaterThan(-1);
    expect(log.indexOf("refund")).toBeGreaterThan(debit);
    expect(log[debit]).toContain('"p_charge_reference":"ch_latest"');
    expect(log[debit]).toContain('"p_amount_cents":19900');
    expect(refundTransaction).toHaveBeenCalledWith("ch_latest", expect.objectContaining({ amountCents: 19900 }));
  });

  it("puts the credit back when Paystack refuses the refund", async () => {
    const { admin, rpc } = fakeAdmin({
      tables: { school_subscriptions: running() },
      rpc: { redeem_school_credit: { data: "ledger-1", error: null } },
    });
    vi.mocked(refundTransaction).mockRejectedValue(new Error("Insufficient balance"));

    const outcome = await redeemSchoolCredit(admin, "school-1");

    expect(outcome.ok).toBe(false);
    expect(rpc).toHaveBeenCalledWith(
      "reverse_school_credit_redemption",
      expect.objectContaining({ p_entry: "ledger-1" }),
    );
  });

  it("refunds nothing when the database refuses the debit", async () => {
    const { admin } = fakeAdmin({
      tables: { school_subscriptions: running() },
      rpc: { redeem_school_credit: { data: null, error: { message: "That charge has already been paid for with credit" } } },
    });
    const outcome = await redeemSchoolCredit(admin, "school-1");
    expect(outcome).toEqual({ ok: false, message: "That payment has already been covered by credit." });
    expect(refundTransaction).not.toHaveBeenCalled();
  });

  it("does nothing at all without enough credit for a whole payment, or without a running plan", async () => {
    for (const over of [{ credit_cents: 19899 }, { status: "canceled" }, { last_charge_reference: null }]) {
      const { admin, rpc } = fakeAdmin({ tables: { school_subscriptions: running(over) } });
      expect((await redeemSchoolCredit(admin, "school-1")).ok).toBe(false);
      expect(rpc).not.toHaveBeenCalled();
    }
    expect(refundTransaction).not.toHaveBeenCalled();
  });

  it("charges a yearly plan's credit a year's price", async () => {
    const { admin } = fakeAdmin({
      tables: { school_subscriptions: running({ plan_code: "PLN_school_team_a", credit_cents: 500000 }) },
      rpc: { redeem_school_credit: { data: "ledger-2", error: null } },
    });
    expect(await redeemSchoolCredit(admin, "school-1")).toMatchObject({ ok: true, amountCents: 499000 });
  });
});

describe("accrueSchoolCredit", () => {
  it("is silent and does nothing on a database without the school tables", async () => {
    const { admin, rpc } = fakeAdmin({
      tables: { schools: { data: null, error: { code: "PGRST205", message: "Could not find the table" } } },
    });
    expect(await accrueSchoolCredit(admin)).toBe(0);
    expect(rpc).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("credits every credit-mode school and carries on past one that fails", async () => {
    const { admin, rpc } = fakeAdmin({
      tables: { schools: { data: [{ id: "a" }, { id: "b" }], error: null } },
    });
    rpc
      .mockResolvedValueOnce({ data: null, error: { message: "boom" } })
      .mockResolvedValueOnce({ data: 4000, error: null });
    expect(await accrueSchoolCredit(admin)).toBe(4000);
    expect(rpc).toHaveBeenCalledTimes(2);
  });
});

describe("a refunded school charge", () => {
  const row = { id: "sub-1", school_id: "school-1", provider_subscription_id: "SUB_x", current_period_end: null };

  it("that credit paid for leaves the plan running", async () => {
    const { admin, updates } = fakeAdmin({
      tables: {
        school_subscriptions: { data: [row], error: null },
        school_credit_ledger: { data: [{ id: "l1", kind: "redeemed", reverses: null }], error: null },
      },
    });
    const answer = await routeSchoolEvent(admin, "refund.processed", { reference: "ch_latest" });
    expect(answer).toBe("school");
    expect(updates).toHaveLength(0);
  });

  it("any other refund ends the plan, including one whose credit redemption was reversed", async () => {
    const { admin, updates } = fakeAdmin({
      tables: {
        school_subscriptions: { data: [row], error: null },
        school_credit_ledger: {
          data: [
            { id: "l1", kind: "redeemed", reverses: null },
            { id: "l2", kind: "reversed", reverses: "l1" },
          ],
          error: null,
        },
      },
    });
    await routeSchoolEvent(admin, "refund.processed", { reference: "ch_latest" });
    expect(updates[0]?.values).toMatchObject({ status: "canceled" });
  });

  it("is retried rather than guessed at when the ledger cannot be read", async () => {
    const { admin } = fakeAdmin({
      tables: { school_credit_ledger: { data: null, error: { code: "57014", message: "statement timeout" } } },
    });
    await expect(isCreditRedemption(admin, "ch_latest")).rejects.toBeInstanceOf(SchoolBillingError);

    const missing = fakeAdmin({
      tables: { school_credit_ledger: { data: null, error: { code: "42P01", message: "relation does not exist" } } },
    });
    expect(await isCreditRedemption(missing.admin, "ch_latest")).toBe(false);
  });
});

describe("the admin view of linked workspaces", () => {
  it("knows which partners take credit, and what one payment costs them", async () => {
    const { admin } = fakeAdmin({
      tables: {
        schools: {
          data: [
            { id: "w1", name: "Credit School", partner_school_id: "p1", commission_mode: "credit" },
            { id: "w2", name: "EFT School", partner_school_id: "p2", commission_mode: "eft" },
          ],
          error: null,
        },
        school_subscriptions: {
          data: [{ school_id: "w1", plan: "solo", status: "active", plan_code: "PLN_school_solo_m", last_charge_reference: "ch", credit_cents: 500 }],
          error: null,
        },
      },
    });
    const linked = await linkedWorkspaces(admin);
    expect([...creditModePartners(linked)]).toEqual(["p1"]);
    expect(periodCostCents(linked.get("p1")!)).toBe(19900);
    // No subscription row reads as nothing to pay for, never as a price.
    expect(periodCostCents(linked.get("p2")!)).toBeNull();
  });

  it("is empty, not an error, before the school tables exist", async () => {
    const { admin } = fakeAdmin({
      tables: { schools: { data: null, error: { code: "PGRST205", message: "Could not find the table" } } },
    });
    expect((await linkedWorkspaces(admin)).size).toBe(0);
  });
});
