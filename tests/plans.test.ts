import { describe, expect, it } from "vitest";
import {
  PLANS,
  PLAN_MAP,
  SELECTABLE_CODES,
  annualMonthlyPrice,
  annualPrice,
  dailyCap,
  hasFeature,
  isFreePlan,
  monthlyPrice,
} from "@/lib/billing/plans";

describe("plan pricing", () => {
  it("annual billing takes R20/mo off every paid plan, free stays free", () => {
    for (const plan of PLANS) {
      const m = monthlyPrice(plan);
      expect(annualMonthlyPrice(plan)).toBe(m === 0 ? 0 : m - 20);
      expect(annualPrice(plan)).toBe(annualMonthlyPrice(plan) * 12);
    }
  });

  it("the paywall's \"from\" price is a real number", () => {
    // Regression: monthly was once a per-track record, and the paywall derived
    // its headline with Math.min(...Object.values(...)). Once monthly became a
    // plain number that silently evaluated to Infinity, so every upgrade screen
    // in the app read "From RInfinity/month".
    const fromPrice = monthlyPrice(PLAN_MAP.premium);
    expect(Number.isFinite(fromPrice)).toBe(true);
    expect(fromPrice).toBe(60);
    expect(`From R${fromPrice}/month`).toMatch(/^From R\d+\/month$/);
  });

  it("one price per tier — nothing depends on which vehicle is studied", () => {
    expect(monthlyPrice(PLAN_MAP.free)).toBe(0);
    expect(isFreePlan(PLAN_MAP.free)).toBe(true);
    expect(monthlyPrice(PLAN_MAP.premium)).toBe(60);
    expect(monthlyPrice(PLAN_MAP.premium_plus)).toBe(70);
    expect(isFreePlan(PLAN_MAP.premium)).toBe(false);
  });
});

describe("feature gates", () => {
  it("free tier excludes the money features", () => {
    expect(hasFeature("free", "scenarios")).toBe(false);
    expect(hasFeature("free", "scanner")).toBe(false);
    expect(hasFeature("free", "licencePrep")).toBe(false);
  });

  it("scanner unlocks at premium; licence prep at premium plus", () => {
    expect(hasFeature("premium", "scanner")).toBe(true);
    expect(hasFeature("premium", "licencePrep")).toBe(false);
    expect(hasFeature("premium_plus", "licencePrep")).toBe(true);
  });

  it("tutor caps mirror the server allowances (2/15/40)", () => {
    // These must equal DAILY_ALLOWANCE.tutor in entitlements.server.ts. The two
    // once disagreed on *shape* — the client metered free lifetime, the server
    // per-day — so a free user was permanently walled by a limit the server
    // would still have served.
    expect(dailyCap("free", "tutorPerDay")).toBe(2);
    expect(dailyCap("premium", "tutorPerDay")).toBe(15);
    expect(dailyCap("premium_plus", "tutorPerDay")).toBe(40);
  });

  it("every tier meters per day; only free stops refilling", () => {
    expect(PLAN_MAP.free.limits.reset).toBe("daily");
    expect(PLAN_MAP.free.limits.trialDays).toBe(7);
    expect(PLAN_MAP.premium.limits.trialDays).toBeUndefined();
    expect(PLAN_MAP.premium_plus.limits.trialDays).toBeUndefined();
  });
});

describe("licence codes", () => {
  it("every code is selectable on every plan — the code is never sold", () => {
    expect(SELECTABLE_CODES).toEqual(["8", "A", "14"]);
  });
});
