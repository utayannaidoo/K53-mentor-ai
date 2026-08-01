import { describe, expect, it } from "vitest";
import {
  FREE_TRIAL_DAYS,
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
    expect(dailyCap("free", "tutorPerDay")).toBe(2);
    expect(dailyCap("premium", "tutorPerDay")).toBe(15);
    expect(dailyCap("premium_plus", "tutorPerDay")).toBe(40);
  });
});

describe("the free week", () => {
  it("every plan meters per day — nothing is a lifetime pool any more", () => {
    for (const plan of PLANS) expect(plan.limits.reset).toBe("daily");
  });

  it("only the free plan is on a clock, and it is seven days", () => {
    expect(PLAN_MAP.free.limits.trialDays).toBe(FREE_TRIAL_DAYS);
    expect(FREE_TRIAL_DAYS).toBe(7);
    expect(PLAN_MAP.premium.limits.trialDays).toBeUndefined();
    expect(PLAN_MAP.premium_plus.limits.trialDays).toBeUndefined();
  });

  it("the legacy caps view agrees with the limits it mirrors", () => {
    // Two representations of the same allowance; the study surfaces read the
    // first and the paywall copy the second, so a drift between them shows a
    // learner one number and enforces another.
    for (const plan of PLANS) {
      if (typeof plan.limits.questions === "number") {
        expect(plan.caps.questionsPerDay).toBe(plan.limits.questions);
      }
      if (typeof plan.limits.flashcards === "number") {
        expect(plan.caps.flashcardsPerDay).toBe(plan.limits.flashcards);
      }
      if (typeof plan.limits.tutorMessages === "number") {
        expect(plan.caps.tutorPerDay).toBe(plan.limits.tutorMessages);
      }
    }
  });

  it("a free week gives more total study than the old lifetime pool did", () => {
    // The whole point of the change: the old model could be exhausted in one
    // ten-minute sitting, before the learner ever experienced a second day.
    const OLD_LIFETIME = { questions: 15, flashcards: 12, tutor: 3 };
    expect(PLAN_MAP.free.caps.questionsPerDay * FREE_TRIAL_DAYS).toBeGreaterThan(
      OLD_LIFETIME.questions,
    );
    expect(PLAN_MAP.free.caps.flashcardsPerDay * FREE_TRIAL_DAYS).toBeGreaterThan(
      OLD_LIFETIME.flashcards,
    );
    expect(PLAN_MAP.free.caps.tutorPerDay * FREE_TRIAL_DAYS).toBeGreaterThan(OLD_LIFETIME.tutor);
  });
});

describe("licence codes", () => {
  it("every code is selectable on every plan — the code is never sold", () => {
    expect(SELECTABLE_CODES).toEqual(["8", "A", "14"]);
  });
});
