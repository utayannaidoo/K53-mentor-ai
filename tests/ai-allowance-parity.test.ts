import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { PLAN_MAP } from "@/lib/billing/plans";
import type { SubscriptionTier } from "@/types";

/**
 * The server's per-user AI allowance and the plan table the client renders
 * from are two separate constants that must never drift: the UI would promise
 * a different daily message count than the routes enforce. Nothing else keeps
 * them in step — entitlements.server is server-only and plans.ts is client
 * code — so this file IS the parity check.
 *
 * Read through resolveEntitlement rather than by importing internals, so the
 * exact lookup the routes use is what's being pinned.
 */

let row: { tier: string; status: string } | null = null;

vi.mock("@/lib/env", () => ({
  isSupabaseConfigured: true,
  isProductionRuntime: () => false,
  assertSupabaseConfiguredInProduction: () => {},
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "u1" } } }) },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: row }) }) }),
    }),
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => null }));

let resolveEntitlement: typeof import("@/lib/billing/entitlements.server").resolveEntitlement;

beforeAll(async () => {
  ({ resolveEntitlement } = await import("@/lib/billing/entitlements.server"));
});

beforeEach(() => {
  row = null;
});

describe("server tutor allowance === the advertised tutor cap, per tier", () => {
  for (const tier of ["free", "premium", "premium_plus"] as const) {
    it(`${tier}: DAILY_ALLOWANCE.tutor matches PlanLimits.tutorMessages`, async () => {
      // A missing subscriptions row resolves free; paid tiers need a live row.
      row = tier === "free" ? null : { tier, status: "active" };
      const ent = await resolveEntitlement("tutor");
      expect(ent).not.toBeInstanceOf(Response);
      if (ent instanceof Response) return;
      expect(ent.tier).toBe(tier);
      expect(ent.allowance).toBe(PLAN_MAP[tier].limits.tutorMessages);
    });
  }
});

describe("vision stays paid-only on both sides of the wire", () => {
  it.each([["free"], ["premium"], ["premium_plus"]] as const)("%s resolves an entitlement", async (tier) => {
    row = tier === "free" ? null : { tier, status: "active" };
    const ent = await resolveEntitlement("vision");
    expect(ent).not.toBeInstanceOf(Response);
    if (ent instanceof Response) return;
    if (tier === "free") expect(ent.allowance).toBe(0);
    else expect(ent.allowance).toBeGreaterThan(0);
  });
});

describe("the tiers the server can grant are exactly the tiers the plans define", () => {
  it("every resolved tier exists in PLAN_MAP", async () => {
    for (const tier of ["free", "premium", "premium_plus"] as SubscriptionTier[]) {
      row = tier === "free" ? null : { tier, status: "active" };
      const ent = await resolveEntitlement("tutor");
      if (!(ent instanceof Response)) {
        expect(PLAN_MAP[ent.tier]).toBeDefined();
      }
    }
  });
});
