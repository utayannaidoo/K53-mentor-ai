import { describe, expect, it } from "vitest";
import { checkChargeAmount, expectedChargeCents } from "@/lib/billing/charge-amount";
import { PLAN_MAP, annualPrice, monthlyPrice } from "@/lib/billing/plans";

/**
 * Paystack bills the Plan's *dashboard* amount, not the amount checkout sends.
 * Those two numbers live in different systems and nothing else compares them,
 * so a drift means the site advertises one price and the card is charged
 * another. These pin the detector.
 *
 * Note what is deliberately absent: a test that a mismatched charge is refused.
 * It isn't, and that is the design — see charge-amount.ts. The buyer has
 * already paid; the bug is ours.
 */

describe("expectedChargeCents", () => {
  it("derives from plans.ts rather than restating the numbers", () => {
    // Written this way on purpose: hardcoding 6000 here would mean a price
    // change made the test fail in a way that reads like a regression, and the
    // fix would be to edit the test until it passed again.
    expect(expectedChargeCents("premium", "monthly")).toBe(monthlyPrice(PLAN_MAP.premium) * 100);
    expect(expectedChargeCents("premium", "annual")).toBe(annualPrice(PLAN_MAP.premium) * 100);
    expect(expectedChargeCents("premium_plus", "monthly")).toBe(
      monthlyPrice(PLAN_MAP.premium_plus) * 100,
    );
    expect(expectedChargeCents("premium_plus", "annual")).toBe(
      annualPrice(PLAN_MAP.premium_plus) * 100,
    );
  });

  it("charges annual as twelve discounted months, not twelve full ones", () => {
    // The annual price is (monthly − R20) × 12. Getting this wrong overcharges
    // by R240 a year, which is more than a third of the subscription.
    const plus = PLAN_MAP.premium_plus;
    expect(expectedChargeCents("premium_plus", "annual")).toBe((plus.monthly - 20) * 12 * 100);
    expect(expectedChargeCents("premium_plus", "annual")).toBeLessThan(
      expectedChargeCents("premium_plus", "monthly") * 12,
    );
  });
});

describe("checkChargeAmount", () => {
  const ok = (over: Partial<Parameters<typeof checkChargeAmount>[0]> = {}) =>
    checkChargeAmount({
      plan: "premium",
      cycle: "monthly",
      actualCents: expectedChargeCents("premium", "monthly"),
      currency: "ZAR",
      ...over,
    });

  it("passes the charge our own checkout would produce", () => {
    const res = ok();
    expect(res.ok).toBe(true);
    expect(res.problem).toBeNull();
  });

  it("catches an overcharge and says which way it went", () => {
    const res = ok({ actualCents: expectedChargeCents("premium", "monthly") + 3000 });
    expect(res.ok).toBe(false);
    expect(res.problem).toMatch(/MORE than/);
    expect(res.problem).toMatch(/Paystack dashboard/);
  });

  it("catches an undercharge", () => {
    const res = ok({ actualCents: 100 });
    expect(res.ok).toBe(false);
    expect(res.problem).toMatch(/LESS than/);
  });

  it("catches the annual price being billed on a monthly cycle", () => {
    // The realistic dashboard slip: right plan, right code, wrong interval's
    // amount. Twelve times the intended debit.
    const res = ok({ actualCents: expectedChargeCents("premium", "annual") });
    expect(res.ok).toBe(false);
  });

  it("catches a non-ZAR settlement before comparing numbers", () => {
    // Comparing 6000 USD-cents to 6000 ZAR-cents would silently pass.
    const res = ok({ currency: "USD" });
    expect(res.ok).toBe(false);
    expect(res.problem).toMatch(/not ZAR/);
  });

  it("stays quiet when the amount is absent — that is unknown, not wrong", () => {
    // An alert nobody can act on trains people to ignore alerts.
    const res = ok({ actualCents: undefined });
    expect(res.ok).toBe(true);
    expect(res.problem).toBeNull();
  });

  describe("when no cycle was recorded", () => {
    // Older in-flight checkouts predate metadata.cycle. Guessing a cycle would
    // manufacture a false alarm on every one of them.
    it("accepts either published price", () => {
      expect(ok({ cycle: null, actualCents: expectedChargeCents("premium", "monthly") }).ok).toBe(
        true,
      );
      expect(ok({ cycle: null, actualCents: expectedChargeCents("premium", "annual") }).ok).toBe(
        true,
      );
    });

    it("still catches an amount that is neither", () => {
      const res = ok({ cycle: null, actualCents: 12345 });
      expect(res.ok).toBe(false);
      expect(res.problem).toMatch(/matches neither/);
    });
  });

  it("reports every price in Rand, not cents", () => {
    // This text goes to a human in an alert email at 2am. Cents would be read
    // as Rand and the wrong Plan would get 'fixed'.
    const res = ok({ actualCents: 999_00 });
    expect(res.problem).toMatch(/R999\.00/);
    expect(res.problem).not.toMatch(/99900/);
  });
});
