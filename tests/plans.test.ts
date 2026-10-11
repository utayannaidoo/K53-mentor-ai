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
  showsAds,
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
    // Regression: `monthly` used to be a per-track record, and the paywall
    // derived its headline with Math.min(...Object.values(...)). Once it became
    // a plain number that silently evaluated to Infinity, so every upgrade
    // screen in the app read "From RInfinity/month".
    const fromPrice = monthlyPrice(PLAN_MAP.premium);
    expect(Number.isFinite(fromPrice)).toBe(true);
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
  it("everything that is not AI is on for every plan, free included", () => {
    for (const plan of PLANS) {
      expect(hasFeature(plan.id, "scenarios")).toBe(true);
      expect(hasFeature(plan.id, "licencePrep")).toBe(true);
      expect(hasFeature(plan.id, "advancedAnalytics")).toBe(true);
      expect(plan.limits.questions).toBe("unlimited");
      expect(plan.limits.flashcards).toBe("unlimited");
      expect(plan.limits.mockExams).toBe("unlimited");
      expect(plan.limits.studyPlan).toBe(true);
      expect(plan.limits.progressHistory).toBe("full");
    }
  });

  it("the AI features are what a plan buys", () => {
    expect(hasFeature("free", "tutor")).toBe(false);
    expect(hasFeature("free", "scanner")).toBe(false);
    for (const tier of ["premium", "premium_plus"] as const) {
      expect(hasFeature(tier, "tutor")).toBe(true);
      expect(hasFeature(tier, "scanner")).toBe(true);
    }
  });

  // The client cap and the server allowance in entitlements.server.ts are the
  // same number written twice, and only the server one is enforced. If they
  // drift, the UI promises an allowance the API refuses — so this pins both.
  it("tutor caps mirror the server allowances (0/15/35)", () => {
    expect(dailyCap("free", "tutorPerDay")).toBe(0);
    expect(dailyCap("premium", "tutorPerDay")).toBe(15);
    expect(dailyCap("premium_plus", "tutorPerDay")).toBe(35);
  });

  it("only Premium Plus can top up", () => {
    expect(PLAN_MAP.free.limits.tutorTopUp).toBe(false);
    expect(PLAN_MAP.premium.limits.tutorTopUp).toBe(false);
    expect(PLAN_MAP.premium_plus.limits.tutorTopUp).toBe(true);
  });
});

describe("ads", () => {
  it("the free plan is ad-supported; paying for any plan removes ads", () => {
    expect(showsAds("free")).toBe(true);
    expect(showsAds("premium")).toBe(false);
    expect(showsAds("premium_plus")).toBe(false);
  });

  it("the free plan says so on the pricing card", () => {
    // Ads are the price of Free. Leaving them off the perk list would be the
    // plan page hiding the one cost the plan has.
    expect(PLAN_MAP.free.perks.some((p) => /ads/i.test(p))).toBe(true);
    for (const tier of ["premium", "premium_plus"] as const) {
      const chain = [...PLAN_MAP[tier].perks, ...PLAN_MAP.premium.perks].join(" ");
      expect(chain).toMatch(/no ads/i);
    }
  });
});

describe("plan limits", () => {
  it("the legacy caps view agrees with the limits it mirrors", () => {
    // Two representations of the same allowance; the study surfaces read the
    // first and the paywall copy the second, so a drift between them shows a
    // learner one number and enforces another.
    for (const plan of PLANS) {
      expect(plan.limits.reset).toBe("daily");
      expect(plan.caps.questionsPerDay).toBe(
        plan.limits.questions === "unlimited" ? Infinity : plan.limits.questions,
      );
      expect(plan.caps.flashcardsPerDay).toBe(
        plan.limits.flashcards === "unlimited" ? Infinity : plan.limits.flashcards,
      );
      if (typeof plan.limits.tutorMessages === "number") {
        expect(plan.caps.tutorPerDay).toBe(plan.limits.tutorMessages);
      }
    }
  });
});

describe("licence codes", () => {
  it("every code is selectable on every plan — the code is never sold", () => {
    expect(SELECTABLE_CODES).toEqual(["8", "A", "14"]);
  });
});
