import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Closing a school (0044), on the TypeScript side: the order of operations.
 * The database proves who may close and what is left afterwards
 * (supabase/tests/school_close.sql). This file pins the one rule the database
 * can only back up, not enforce: billing is stopped at Paystack BEFORE
 * anything is deleted, and a refusal from Paystack deletes nothing.
 */

vi.mock("@/lib/env", () => ({ isSupabaseConfigured: true, isPaystackConfigured: true }));
vi.mock("@/lib/paystack/client", () => ({
  fetchCustomer: vi.fn(),
  disableSubscription: vi.fn(),
  manageSubscriptionLink: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: "owner-1" } } }) } }),
}));

const requireSchool = vi.fn();
vi.mock("@/lib/schools/auth", () => ({
  requireSchool: (...a: unknown[]) => requireSchool(...a),
  currentSchool: vi.fn(),
}));

let adminImpl: ReturnType<typeof fakeAdmin>;
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => adminImpl.admin }));

import { fetchCustomer, disableSubscription } from "@/lib/paystack/client";
import { stopSchoolRenewal } from "@/lib/billing/school-billing";
import { closeSchool } from "@/app/schools/actions";

function fakeAdmin(row: Record<string, unknown> | null, rpcResult: { data: unknown; error: { message: string; code?: string } | null } = { data: true, error: null }) {
  const log: string[] = [];
  const admin = {
    rpc: vi.fn(async (name: string) => {
      log.push(`rpc ${name}`);
      return rpcResult;
    }),
    from(table: string) {
      const builder: Record<string, unknown> = {};
      builder.select = () => builder;
      builder.eq = () => builder;
      builder.update = (values: Record<string, unknown>) => {
        log.push(`update ${table} ${JSON.stringify(values)}`);
        return builder;
      };
      builder.maybeSingle = async () => ({ data: row, error: null });
      builder.then = (resolve: (v: unknown) => unknown) => Promise.resolve({ data: null, error: null }).then(resolve);
      return builder;
    },
  };
  return { admin: admin as unknown as SupabaseClient, log, rpc: admin.rpc };
}

const paid = {
  status: "active",
  plan_code: "PLN_school_team_m",
  provider_customer_id: "CUS_owner",
  provider_subscription_id: "SUB_team",
  current_period_end: "2026-10-18T00:00:00Z",
  cancel_at_period_end: false,
};

const form = (confirm: string) => {
  const data = new FormData();
  data.set("confirm", confirm);
  return data;
};

beforeEach(() => {
  vi.mocked(fetchCustomer).mockReset();
  vi.mocked(disableSubscription).mockReset().mockResolvedValue(undefined as never);
  requireSchool.mockReset().mockResolvedValue({
    ok: true,
    school: { schoolId: "school-1", name: "Sipho's Driving School" },
  });
  vi.spyOn(console, "error").mockImplementation(() => {}).mockClear();
});

describe("stopSchoolRenewal", () => {
  it("records the end date and the flag first, then asks Paystack to stop", async () => {
    adminImpl = fakeAdmin(paid);
    vi.mocked(fetchCustomer).mockResolvedValue({
      subscriptions: [{ subscription_code: "SUB_team", email_token: "tok", status: "active", plan: { plan_code: "PLN_school_team_m" }, next_payment_date: "2026-10-18T00:00:00Z" }],
    } as never);
    vi.mocked(disableSubscription).mockImplementation(async () => {
      adminImpl.log.push("disable");
      return undefined as never;
    });

    expect(await stopSchoolRenewal(adminImpl.admin, "school-1")).toEqual({ ok: true, periodEnd: "2026-10-18T00:00:00.000Z" });
    expect(adminImpl.log).toEqual([
      'update school_subscriptions {"cancel_at_period_end":true,"current_period_end":"2026-10-18T00:00:00.000Z"}',
      "disable",
    ]);
  });

  it("takes the flag back off when Paystack refuses, because billing is still running", async () => {
    adminImpl = fakeAdmin(paid);
    vi.mocked(fetchCustomer).mockResolvedValue({
      subscriptions: [{ subscription_code: "SUB_team", email_token: "tok", status: "active", plan: { plan_code: "PLN_school_team_m" } }],
    } as never);
    vi.mocked(disableSubscription).mockRejectedValue(new Error("paystack 502"));

    const result = await stopSchoolRenewal(adminImpl.admin, "school-1");
    expect(result.ok).toBe(false);
    expect(adminImpl.log.at(-1)).toBe('update school_subscriptions {"cancel_at_period_end":false}');
  });

  it("asks Paystack nothing for a school that isn't billing", async () => {
    for (const row of [null, { ...paid, status: "trialing" }, { ...paid, cancel_at_period_end: true }, { ...paid, provider_customer_id: null }]) {
      adminImpl = fakeAdmin(row);
      expect((await stopSchoolRenewal(adminImpl.admin, "school-1")).ok).toBe(true);
    }
    expect(fetchCustomer).not.toHaveBeenCalled();
    expect(disableSubscription).not.toHaveBeenCalled();
  });
});

describe("closeSchool", () => {
  it("deletes nothing when the name is not typed exactly", async () => {
    adminImpl = fakeAdmin(paid);
    const result = await closeSchool(null, form("Siphos Driving School"));
    expect(result.ok).toBe(false);
    expect(adminImpl.rpc).not.toHaveBeenCalled();
    expect(fetchCustomer).not.toHaveBeenCalled();
  });

  it("stops the plan at Paystack before it deletes anything", async () => {
    adminImpl = fakeAdmin(paid);
    vi.mocked(fetchCustomer).mockResolvedValue({
      subscriptions: [{ subscription_code: "SUB_team", email_token: "tok", status: "active", plan: { plan_code: "PLN_school_team_m" } }],
    } as never);
    vi.mocked(disableSubscription).mockImplementation(async () => {
      adminImpl.log.push("disable");
      return undefined as never;
    });

    const result = await closeSchool(null, form("  sipho's driving school "));

    expect(result.ok).toBe(true);
    expect(adminImpl.log.indexOf("disable")).toBeGreaterThan(-1);
    expect(adminImpl.log.indexOf("rpc close_school")).toBeGreaterThan(adminImpl.log.indexOf("disable"));
    expect(adminImpl.rpc).toHaveBeenCalledWith("close_school", {
      p_user: "owner-1",
      p_school: "school-1",
      p_confirm_name: "  sipho's driving school ",
    });
  });

  it("deletes nothing when Paystack won't stop the plan", async () => {
    adminImpl = fakeAdmin(paid);
    vi.mocked(fetchCustomer).mockRejectedValue(new Error("paystack down"));
    const result = await closeSchool(null, form("Sipho's Driving School"));
    expect(result).toMatchObject({ ok: false });
    expect(result.message).toMatch(/nothing was closed/);
    expect(adminImpl.rpc).not.toHaveBeenCalled();
  });

  it("is the owner's alone", async () => {
    adminImpl = fakeAdmin(null);
    requireSchool.mockResolvedValue({ ok: false, message: "Only the school owner can do that." });
    expect(await closeSchool(null, form("Sipho's Driving School"))).toEqual({
      ok: false,
      message: "Only the school owner can do that.",
    });
    expect(requireSchool).toHaveBeenCalledWith({ roles: ["owner"] });
    expect(adminImpl.rpc).not.toHaveBeenCalled();
  });
});
