import { describe, expect, it } from "vitest";
import {
  PLANS,
  PLAN_MAP,
  annualMonthlyPrice,
  annualPrice,
  classAllowsCode,
  codesForClass,
  dailyCap,
  hasFeature,
  monthlyPrice,
  vehicleClass,
} from "@/lib/billing/plans";

describe("plan pricing", () => {
  it("annual billing takes R20/mo off every paid plan, free stays free", () => {
    for (const plan of PLANS) {
      for (const vc of ["car", "bike_heavy"] as const) {
        const m = monthlyPrice(plan, vc);
        expect(annualMonthlyPrice(plan, vc)).toBe(m === 0 ? 0 : m - 20);
        expect(annualPrice(plan, vc)).toBe(annualMonthlyPrice(plan, vc) * 12);
      }
    }
  });

  it("bike+heavy is priced below car on paid plans", () => {
    expect(monthlyPrice(PLAN_MAP.premium, "bike_heavy")).toBeLessThan(
      monthlyPrice(PLAN_MAP.premium, "car"),
    );
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

  it("tutor caps mirror the server allowances (3/15/40)", () => {
    expect(dailyCap("free", "tutorPerDay")).toBe(3);
    expect(dailyCap("premium", "tutorPerDay")).toBe(15);
    expect(dailyCap("premium_plus", "tutorPerDay")).toBe(40);
  });
});

describe("vehicle tracks", () => {
  it("maps codes to their track", () => {
    expect(vehicleClass("8")).toBe("car");
    expect(vehicleClass("A")).toBe("bike_heavy");
    expect(vehicleClass("14")).toBe("bike_heavy");
  });

  it("a null track offers everything; a chosen track restricts", () => {
    expect(codesForClass(null)).toContain("8");
    expect(codesForClass(null)).toContain("A");
    expect(codesForClass("car")).toEqual(["8"]);
    expect(classAllowsCode("car", "A")).toBe(false);
    expect(classAllowsCode(null, "A")).toBe(true);
  });
});
