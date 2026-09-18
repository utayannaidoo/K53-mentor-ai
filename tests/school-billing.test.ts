import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChargeSuccessData } from "@/lib/paystack/apply";

/**
 * K53 Mentor for Schools shares the learner app's Paystack account, webhook and
 * ledger. These tests pin the promises that make that safe:
 *
 *   - with no school plan codes configured, nothing ever reads a school table
 *     (so the webhook cannot break before migration 0035 is applied);
 *   - a school charge writes school_subscriptions and NEVER subscriptions;
 *   - neither product's superseded-plan cleanup can disable the other's
 *     subscription for an owner who is one Paystack customer with both;
 *   - a school renewal never re-points the learner money-back anchor.
 */

vi.mock("@/lib/paystack/client", () => ({
  fetchCustomer: vi.fn(),
  disableSubscription: vi.fn(),
}));
vi.mock("@/lib/notify/email", () => ({ isEmailConfigured: false, sendEmail: vi.fn() }));
vi.mock("@/lib/partners/commission", () => ({
  earnSchoolCommission: vi.fn(),
  voidSchoolCommission: vi.fn(),
}));

import { applyChargeSuccess } from "@/lib/paystack/apply";
import {
  applySchoolLifecycle,
  eventPlanCode,
  findSchoolEventTarget,
  isSchoolPlanCode,
  routeSchoolEvent,
  SchoolBillingError,
} from "@/lib/billing/school-billing";
import { fetchCustomer, disableSubscription } from "@/lib/paystack/client";
import { hasPartnerDb, schoolDb } from "./school-db";

const SCHOOL_ENV = {
  PAYSTACK_PLAN_SCHOOL_SOLO_MONTHLY: "PLN_school_solo_m",
  PAYSTACK_PLAN_SCHOOL_TEAM_MONTHLY: "PLN_school_team_m",
  PAYSTACK_PLAN_SCHOOL_TEAM_ANNUAL: "PLN_school_team_a",
};

type Call = { table: string; op: string; values?: unknown; filters: [string, unknown][] };

/** A Supabase stand-in that records every call and returns canned rows. */
function recordingAdmin(opts: { rows?: Record<string, unknown[]>; failTables?: string[] } = {}) {
  const calls: Call[] = [];
  const admin = {
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    from(table: string) {
      const call: Call = { table, op: "select", filters: [] };
      calls.push(call);
      const result = () =>
        opts.failTables?.includes(table)
          ? { data: null, error: { message: "relation does not exist" } }
          : { data: call.op === "update" ? [{ id: "row" }] : (opts.rows?.[table] ?? []), error: null };
      const builder: Record<string, unknown> = {};
      Object.assign(builder, {
        select: () => builder,
        update: (values: unknown) => ((call.op = "update"), (call.values = values), builder),
        upsert: (values: unknown) => ((call.op = "upsert"), (call.values = values), builder),
        eq: (col: string, val: unknown) => (call.filters.push([col, val]), builder),
        neq: (col: string, val: unknown) => (call.filters.push([`!${col}`, val]), builder),
        limit: () => builder,
        maybeSingle: async () => ({ data: (opts.rows?.[table] ?? [])[0] ?? null, error: null }),
        then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
          Promise.resolve(result()).then(resolve, reject),
      });
      return builder;
    },
  };
  return { admin: admin as unknown as SupabaseClient, calls };
}

const sub = (code: string, plan: string | object | undefined, status = "active", next = "2026-10-18T00:00:00Z") =>
  ({ subscription_code: code, email_token: `tok_${code}`, status, plan, next_payment_date: next }) as never;

function schoolCharge(over: Partial<ChargeSuccessData> = {}): ChargeSuccessData {
  return {
    id: 901,
    reference: "ref_school",
    amount: 49900,
    customer: { customer_code: "CUS_owner", email: "owner@example.com", first_name: "" },
    metadata: { kind: "school_subscription", school_id: "school-1", plan: "team", cycle: "monthly", user_id: "owner-1" },
    plan: { plan_code: "PLN_school_team_m" },
    ...over,
  };
}

function learnerCharge(): ChargeSuccessData {
  return {
    id: 902,
    reference: "ref_learner",
    amount: 6000,
    customer: { customer_code: "CUS_owner", email: "owner@example.com", first_name: "" },
    metadata: { kind: "subscription", plan: "premium", cycle: "monthly", user_id: "owner-1" },
    plan: { plan_code: "PLN_premium_monthly" },
  };
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.mocked(fetchCustomer).mockReset();
  vi.mocked(disableSubscription).mockReset().mockResolvedValue(undefined as never);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("before any school plan exists", () => {
  it("never reads a school table, so the webhook cannot break before 0035 is applied", async () => {
    const { admin, calls } = recordingAdmin({ failTables: ["school_subscriptions"] });
    const target = await findSchoolEventTarget(admin, {
      subscriptionCode: "SUB_x",
      planCode: "PLN_whatever",
      customerCode: "CUS_owner",
      reference: "ref",
    });
    expect(target).toBeNull();
    expect(calls).toHaveLength(0);
    expect(isSchoolPlanCode("PLN_school_team_m")).toBe(false);
  });

  it("treats a learner renewal exactly as before", async () => {
    vi.mocked(fetchCustomer).mockResolvedValue({ customer_code: "CUS_owner", subscriptions: [] } as never);
    const { admin, calls } = recordingAdmin();
    await applyChargeSuccess(admin, { ...learnerCharge(), metadata: null });
    expect(calls.map((c) => c.table)).toEqual(["subscriptions"]);
  });
});

describe("with school plans configured", () => {
  beforeEach(() => Object.assign(process.env, SCHOOL_ENV));

  it("grants a school charge to school_subscriptions and never touches subscriptions", async () => {
    vi.mocked(fetchCustomer).mockResolvedValue({
      customer_code: "CUS_owner",
      subscriptions: [sub("SUB_team", "PLN_school_team_m")],
    } as never);
    const { admin, calls } = recordingAdmin();

    await applyChargeSuccess(admin, schoolCharge());

    expect(calls.some((c) => c.table === "subscriptions")).toBe(false);
    const grant = calls.find((c) => c.table === "school_subscriptions" && c.op === "update");
    expect(grant?.values).toMatchObject({ plan: "team", status: "active", seats: 5, plan_code: "PLN_school_team_m" });
    expect(grant?.filters).toContainEqual(["school_id", "school-1"]);
    const recorded = calls.filter((c) => c.table === "school_subscriptions" && c.op === "update")[1];
    expect(recorded?.values).toMatchObject({ provider_subscription_id: "SUB_team" });
  });

  it("grants what Paystack billed when it disagrees with the metadata", async () => {
    vi.mocked(fetchCustomer).mockResolvedValue({ customer_code: "CUS_owner", subscriptions: [] } as never);
    const { admin, calls } = recordingAdmin();
    await applyChargeSuccess(admin, schoolCharge({ plan: { plan_code: "PLN_school_solo_m" } }));
    const grant = calls.find((c) => c.table === "school_subscriptions" && c.op === "update");
    expect(grant?.values).toMatchObject({ plan: "solo", seats: 1 });
  });

  it("grants nothing for a school-marked charge on an unknown plan code", async () => {
    const { admin, calls } = recordingAdmin();
    await applyChargeSuccess(admin, schoolCharge({ plan: { plan_code: "PLN_mystery" } }));
    expect(calls.filter((c) => c.op === "update" || c.op === "upsert")).toHaveLength(0);
  });

  it("a school plan change disables the old SCHOOL plan and never the owner's learner plan", async () => {
    vi.mocked(fetchCustomer).mockResolvedValue({
      customer_code: "CUS_owner",
      subscriptions: [
        sub("SUB_learner_premium", "PLN_premium_monthly"),
        sub("SUB_old_solo", "PLN_school_solo_m"),
        sub("SUB_new_team", "PLN_school_team_m"),
        sub("SUB_mystery", {}),
      ],
    } as never);
    await applyChargeSuccess(recordingAdmin().admin, schoolCharge());
    expect(disableSubscription).toHaveBeenCalledTimes(1);
    expect(disableSubscription).toHaveBeenCalledWith("SUB_old_solo", "tok_SUB_old_solo");
  });

  it("a learner plan change never disables the owner's school plan", async () => {
    vi.mocked(fetchCustomer).mockResolvedValue({
      customer_code: "CUS_owner",
      subscriptions: [
        sub("SUB_school_team", "PLN_school_team_m"),
        sub("SUB_old_plus", "PLN_plus_monthly"),
        sub("SUB_new_premium", "PLN_premium_monthly"),
      ],
    } as never);
    await applyChargeSuccess(recordingAdmin().admin, learnerCharge());
    expect(disableSubscription).toHaveBeenCalledTimes(1);
    expect(disableSubscription).toHaveBeenCalledWith("SUB_old_plus", "tok_SUB_old_plus");
  });

  it("a school renewal updates the school row and never the learner money-back anchor", async () => {
    vi.mocked(fetchCustomer).mockResolvedValue({
      customer_code: "CUS_owner",
      subscriptions: [sub("SUB_team", "PLN_school_team_m", "active", "2026-11-18T00:00:00Z")],
    } as never);
    const { admin, calls } = recordingAdmin();

    await applyChargeSuccess(admin, { ...schoolCharge(), metadata: null, reference: "ref_renewal" });

    expect(calls.some((c) => c.table === "subscriptions")).toBe(false);
    const renewal = calls.find((c) => c.table === "school_subscriptions" && c.op === "update");
    expect(renewal?.values).toMatchObject({ status: "active", last_charge_reference: "ref_renewal" });
    expect(renewal?.filters).toEqual([
      ["provider_customer_id", "CUS_owner"],
      ["plan_code", "PLN_school_team_m"],
    ]);
  });

  it("a learner renewal still goes to the learner row", async () => {
    vi.mocked(fetchCustomer).mockResolvedValue({ customer_code: "CUS_owner", subscriptions: [] } as never);
    const { admin, calls } = recordingAdmin();
    await applyChargeSuccess(admin, { ...learnerCharge(), metadata: null });
    expect(calls.map((c) => c.table)).toEqual(["subscriptions"]);
  });
});

describe("routing lifecycle events", () => {
  beforeEach(() => Object.assign(process.env, SCHOOL_ENV));

  it("finds a school row by its subscription code", async () => {
    const row = { id: "s1", school_id: "school-1", provider_subscription_id: "SUB_team", current_period_end: null };
    const { admin } = recordingAdmin({ rows: { school_subscriptions: [row] } });
    expect(await findSchoolEventTarget(admin, { subscriptionCode: "SUB_team" })).toEqual(row);
  });

  it("fails the event when a definitely-school lookup errors, so it is retried not mis-routed", async () => {
    const { admin } = recordingAdmin({ failTables: ["school_subscriptions"] });
    await expect(
      findSchoolEventTarget(admin, { subscriptionCode: "SUB_team", planCode: "PLN_school_team_m", customerCode: "CUS" }),
    ).rejects.toBeInstanceOf(SchoolBillingError);
  });

  it("falls back to the learner handling when only weak evidence errors", async () => {
    const { admin } = recordingAdmin({ failTables: ["school_subscriptions"] });
    expect(await findSchoolEventTarget(admin, { subscriptionCode: "SUB_learner" })).toBeNull();
  });

  it("reads the plan code from either payload shape", () => {
    expect(eventPlanCode({ plan: { plan_code: "PLN_a" } })).toBe("PLN_a");
    expect(eventPlanCode({ plan: "PLN_b" })).toBe("PLN_b");
    expect(eventPlanCode({ subscription: { plan: { plan_code: "PLN_c" } } })).toBe("PLN_c");
    expect(eventPlanCode({ plan: {} })).toBeUndefined();
    expect(eventPlanCode(null)).toBeUndefined();
  });
});

describe("applySchoolLifecycle", () => {
  const future = new Date(Date.now() + 10 * 86_400_000).toISOString();
  const past = new Date(Date.now() - 86_400_000).toISOString();
  const target = (end: string | null) => ({ id: "s1", school_id: "school-1", provider_subscription_id: "SUB_team", current_period_end: end });

  it("a cancellation keeps the paid-for period, then ends", async () => {
    const running = recordingAdmin();
    await applySchoolLifecycle(running.admin, "subscription.disable", target(future), "SUB_team");
    expect(running.calls[0].values).toEqual({ cancel_at_period_end: true });

    const over = recordingAdmin();
    await applySchoolLifecycle(over.admin, "subscription.disable", target(past), "SUB_team");
    expect(over.calls[0].values).toEqual({ status: "canceled", cancel_at_period_end: false });
  });

  it("ignores an event for a superseded subscription", async () => {
    const { admin, calls } = recordingAdmin();
    await applySchoolLifecycle(admin, "subscription.disable", target(past), "SUB_old_solo");
    expect(calls).toHaveLength(0);
  });

  it("a refund ends the plan now; a dispute only annotates", async () => {
    const refund = recordingAdmin();
    await applySchoolLifecycle(refund.admin, "refund.processed", target(future));
    expect(refund.calls[0].values).toMatchObject({ status: "canceled" });

    const dispute = recordingAdmin();
    await applySchoolLifecycle(dispute.admin, "charge.dispute.create", target(future));
    expect(Object.keys(dispute.calls[0].values as object)).toEqual(["disputed_at"]);
  });
});

describe("who pays for the school", () => {
  beforeEach(() => Object.assign(process.env, SCHOOL_ENV));

  /** fetchCustomer answering per customer code, like the real API. */
  function customers(byCode: Record<string, unknown[]>) {
    vi.mocked(fetchCustomer).mockImplementation(
      async (code: string) => ({ customer_code: code, subscriptions: byCode[code] ?? [] }) as never,
    );
  }

  it("stops the previous owner's subscription when the new owner pays, before granting", async () => {
    customers({
      CUS_old_owner: [sub("SUB_old_owner", "PLN_school_team_m")],
      CUS_owner: [sub("SUB_team", "PLN_school_team_m")],
    });
    const order: string[] = [];
    vi.mocked(disableSubscription).mockImplementation(async (code: string) => {
      order.push(`disable ${code}`);
      return undefined as never;
    });
    const { admin, calls } = recordingAdmin({
      rows: {
        school_subscriptions: [{ provider_customer_id: "CUS_old_owner", provider_subscription_id: "SUB_old_owner" }],
      },
    });
    const from = admin.from.bind(admin);
    (admin as unknown as { from: (t: string) => unknown }).from = (table: string) => {
      order.push(`from ${table}`);
      return from(table);
    };

    await applyChargeSuccess(admin, schoolCharge());

    expect(disableSubscription).toHaveBeenCalledWith("SUB_old_owner", "tok_SUB_old_owner");
    // Read, then stop the old payer, then grant — so a retry still knows who it was.
    expect(order.slice(0, 3)).toEqual([
      "from school_subscriptions",
      "disable SUB_old_owner",
      "from school_subscriptions",
    ]);
    expect(calls.find((c) => c.op === "update")?.values).toMatchObject({ provider_customer_id: "CUS_owner" });
  });

  it("grants nothing when the previous payer cannot be stopped, so the charge is retried", async () => {
    customers({ CUS_old_owner: [sub("SUB_old_owner", "PLN_school_team_m")] });
    vi.mocked(disableSubscription).mockRejectedValue(new Error("paystack 502"));
    const { admin, calls } = recordingAdmin({
      rows: {
        school_subscriptions: [{ provider_customer_id: "CUS_old_owner", provider_subscription_id: "SUB_old_owner" }],
      },
    });

    await expect(applyChargeSuccess(admin, schoolCharge())).rejects.toThrow("paystack 502");
    expect(calls.filter((c) => c.op === "update")).toHaveLength(0);
  });

  it("does not stop anything when the same owner pays again, or the old plan already ended", async () => {
    customers({
      CUS_old_owner: [sub("SUB_old_owner", "PLN_school_team_m", "non-renewing")],
      CUS_owner: [sub("SUB_team", "PLN_school_team_m")],
    });
    await applyChargeSuccess(
      recordingAdmin({
        rows: { school_subscriptions: [{ provider_customer_id: "CUS_owner", provider_subscription_id: "SUB_team" }] },
      }).admin,
      schoolCharge(),
    );
    await applyChargeSuccess(
      recordingAdmin({
        rows: {
          school_subscriptions: [{ provider_customer_id: "CUS_old_owner", provider_subscription_id: "SUB_old_owner" }],
        },
      }).admin,
      schoolCharge(),
    );
    expect(disableSubscription).not.toHaveBeenCalled();
  });

  it("clears the old subscription and period at the grant, so a lapsed school that pays is writable at once", async () => {
    customers({ CUS_owner: [] });
    const { admin, calls } = recordingAdmin();
    await applyChargeSuccess(admin, schoolCharge());
    expect(calls.find((c) => c.op === "update")?.values).toMatchObject({
      provider_subscription_id: null,
      current_period_end: null,
      status: "active",
    });
  });

  it("keeps one of two subscriptions on the same plan and stops the other", async () => {
    customers({
      CUS_owner: [
        sub("SUB_first", "PLN_school_team_m", "active", "2026-10-18T00:00:00Z"),
        sub("SUB_second", "PLN_school_team_m", "active", "2026-10-19T00:00:00Z"),
      ],
    });
    const { admin, calls } = recordingAdmin();
    await applyChargeSuccess(admin, schoolCharge());
    const recorded = calls.filter((c) => c.op === "update")[1];
    expect(recorded?.values).toMatchObject({ provider_subscription_id: "SUB_second" });
    expect(disableSubscription).toHaveBeenCalledTimes(1);
    expect(disableSubscription).toHaveBeenCalledWith("SUB_first", "tok_SUB_first");
  });

  it("never replays an applied charge because a duplicate would not stop", async () => {
    customers({
      CUS_owner: [
        sub("SUB_first", "PLN_school_team_m", "active", "2026-10-18T00:00:00Z"),
        sub("SUB_second", "PLN_school_team_m", "active", "2026-10-19T00:00:00Z"),
      ],
    });
    vi.mocked(disableSubscription).mockRejectedValue(new Error("paystack 502"));
    await expect(applyChargeSuccess(recordingAdmin().admin, schoolCharge())).resolves.toBeUndefined();
  });
});

describe("routeSchoolEvent", () => {
  beforeEach(() => Object.assign(process.env, SCHOOL_ENV));

  it("keeps an unmatched SCHOOL-plan event away from the learner handling", async () => {
    // The old plan being disabled after a plan change: no school row names it,
    // and the owner's learner row shares the customer code.
    const { admin, calls } = recordingAdmin();
    const answer = await routeSchoolEvent(admin, "subscription.disable", {
      subscriptionCode: "SUB_old_solo",
      planCode: "PLN_school_solo_m",
      customerCode: "CUS_owner",
    });
    expect(answer).toBe("school");
    expect(calls.some((c) => c.op === "update")).toBe(false);
  });

  it("answers learner for a learner plan, touching nothing", async () => {
    const { admin, calls } = recordingAdmin();
    const answer = await routeSchoolEvent(admin, "subscription.disable", {
      subscriptionCode: "SUB_learner",
      planCode: "PLN_premium_monthly",
      customerCode: "CUS_owner",
    });
    expect(answer).toBe("learner");
    expect(calls.some((c) => c.op === "update")).toBe(false);
  });

  it("applies a matched event to the school row", async () => {
    const row = { id: "s1", school_id: "school-1", provider_subscription_id: "SUB_team", current_period_end: null };
    const { admin, calls } = recordingAdmin({ rows: { school_subscriptions: [row] } });
    const answer = await routeSchoolEvent(admin, "invoice.payment_failed", {
      subscriptionCode: "SUB_team",
      planCode: "PLN_school_team_m",
      customerCode: "CUS_owner",
    });
    expect(answer).toBe("school");
    expect(calls.find((c) => c.op === "update")?.values).toEqual({ status: "past_due" });
  });
});

/**
 * The recording admin above proves which calls are made, not that Postgres
 * would accept them — a misspelt column or a status outside the CHECK would
 * pass every test above and fail on the first real payment. So every write
 * the school billing code makes is replayed here against the real
 * school_subscriptions table from 0035, as plain UPDATEs.
 */
describe.skipIf(!hasPartnerDb)("against the real school_subscriptions table", () => {
  it("writes only columns and values the table accepts", async () => {
    Object.assign(process.env, SCHOOL_ENV);
    vi.mocked(fetchCustomer).mockResolvedValue({
      customer_code: "CUS_owner",
      subscriptions: [sub("SUB_team", "PLN_school_team_m"), sub("SUB_old_solo", "PLN_school_solo_m")],
    } as never);
    const { admin, calls } = recordingAdmin();
    const target = { id: "row", school_id: "school-1", provider_subscription_id: "SUB_team", current_period_end: null };

    await applyChargeSuccess(admin, schoolCharge());
    await applyChargeSuccess(admin, { ...schoolCharge(), metadata: null, reference: "ref_renewal" });
    for (const event of [
      "invoice.payment_failed",
      "subscription.not_renew",
      "subscription.disable",
      "refund.processed",
      "charge.dispute.create",
    ] as const) {
      await applySchoolLifecycle(admin, event, target, "SUB_team");
    }

    const writes = calls.filter((c) => c.table === "school_subscriptions" && c.op === "update");
    expect(writes.length).toBeGreaterThanOrEqual(8);

    const db = await schoolDb();
    try {
      const owner = "00000000-0000-4000-8000-000000000001";
      await db.query(
        "insert into auth.users (id, email, aud, role, raw_user_meta_data) values ($1, 'contract@example.invalid', 'authenticated', 'authenticated', '{}')",
        [owner],
      );
      const created = await db.query<{ id: string }>("select public.create_school_for_owner($1, 'Contract School') as id", [owner]);
      const schoolId = created.rows[0].id;
      const columns = new Set(
        (
          await db.query<{ column_name: string }>(
            "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'school_subscriptions'",
          )
        ).rows.map((r) => r.column_name),
      );

      for (const write of writes) {
        for (const [column] of write.filters) expect(columns).toContain(column.replace(/^!/, ""));
        const values = write.values as Record<string, unknown>;
        const keys = Object.keys(values);
        for (const key of keys) expect(key).toMatch(/^[a-z_]+$/);
        const sets = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
        await db.query(`update public.school_subscriptions set ${sets} where school_id = $${keys.length + 1}`, [
          ...keys.map((key) => values[key]),
          schoolId,
        ]);
      }
    } finally {
      await db.close();
    }
  }, 60_000);
});
