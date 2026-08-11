import { describe, expect, it } from "vitest";
import { buildSubscriptionEndingEmail, buildPaymentReceiptEmail } from "@/lib/notify/templates";
import { MONEY_BACK_DAYS } from "@/lib/billing/plans";
import { refundEligible } from "@/lib/billing/subscription-cancel";

/**
 * Cancelling used to revoke access on the spot. Outside the money-back window
 * that took back a month somebody had already paid for — honestly signposted
 * ("you'll drop to Free immediately") and still wrong.
 *
 * The rule now: a refund ends access, because the payment is being reversed.
 * No refund means the paid period is still owed.
 */

describe("which cancellation applies", () => {
  const base = {
    tier: "premium",
    lastChargeReference: "ref_1",
    moneyBackUsed: false,
  };
  const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

  it("refunds inside the money-back window", () => {
    expect(refundEligible({ ...base, paidAt: daysAgo(1) })).toBe(true);
    expect(refundEligible({ ...base, paidAt: daysAgo(MONEY_BACK_DAYS - 0.5) })).toBe(true);
  });

  it("does not refund outside it — so the paid period must be honoured", () => {
    expect(refundEligible({ ...base, paidAt: daysAgo(MONEY_BACK_DAYS + 1) })).toBe(false);
    expect(refundEligible({ ...base, paidAt: daysAgo(20) })).toBe(false);
  });

  it("does not refund twice", () => {
    expect(refundEligible({ ...base, paidAt: daysAgo(1), moneyBackUsed: true })).toBe(false);
  });

  it("does not refund a charge it cannot identify", () => {
    // Without a reference there is nothing to reverse; treating it as eligible
    // would end access AND leave the learner out of pocket.
    expect(refundEligible({ ...base, paidAt: daysAgo(1), lastChargeReference: null })).toBe(false);
  });

  it("MONEY_BACK_DAYS is quotable by client code", () => {
    // The pricing copy and cancel dialog promise this number to the buyer, and
    // the server enforces it. One constant, or one of them is a lie — which is
    // why it lives in plans.ts and not in the server-only module.
    expect(MONEY_BACK_DAYS).toBe(7);
  });
});

describe("buildSubscriptionEndingEmail", () => {
  const endsOn = "2026-09-03T10:00:00.000Z";

  it("names the date access actually stops", () => {
    const mail = buildSubscriptionEndingEmail({
      firstName: "Sam",
      planName: "Premium",
      endsOn,
      daysLeft: 3,
    });
    expect(mail.text).toContain("3 September 2026");
    expect(mail.html).toContain("3 September 2026");
  });

  it("is honest that there is no usable free plan to land on", () => {
    // The free tier IS a 7-day trial anchored to signup, so a lapsing
    // subscriber lands on nothing. "You'll move to our Free plan" would imply
    // a soft landing that does not exist.
    const mail = buildSubscriptionEndingEmail({
      firstName: "Sam",
      planName: "Premium",
      endsOn,
      daysLeft: 3,
    });
    expect(mail.text).toMatch(/free week was used at signup/i);
    expect(mail.text).toMatch(/stop/i);
  });

  it("reassures that progress survives, so cancelling isn't punished", () => {
    const mail = buildSubscriptionEndingEmail({
      firstName: "Sam",
      planName: "Premium",
      endsOn,
      daysLeft: 3,
    });
    expect(mail.text).toMatch(/progress, streak and readiness/i);
  });

  it("says 'tomorrow' rather than 'in 1 days'", () => {
    const mail = buildSubscriptionEndingEmail({
      firstName: "Sam",
      planName: "Premium",
      endsOn,
      daysLeft: 1,
    });
    expect(mail.subject).toContain("tomorrow");
    expect(mail.subject).not.toMatch(/in 1 days/);
  });

  it("copes with no name", () => {
    const mail = buildSubscriptionEndingEmail({
      firstName: "",
      planName: "Premium",
      endsOn,
      daysLeft: 2,
    });
    expect(mail.text).toContain("Hi there");
  });
});

describe("the receipt discloses the renewal", () => {
  // A subscription that renews without ever having said so is the classic
  // complaint. The receipt is the message everyone opens.
  it("names the next charge date and amount when Paystack gave us one", () => {
    const mail = buildPaymentReceiptEmail({
      firstName: "Sam",
      planName: "Premium",
      amountZar: 60,
      renewsOn: "2026-09-03T10:00:00.000Z",
    });
    expect(mail.text).toMatch(/renews automatically on 3 September 2026/i);
    expect(mail.text).toContain("R 60");
  });

  it("still says it recurs when no date is available, without inventing one", () => {
    const mail = buildPaymentReceiptEmail({
      firstName: "Sam",
      planName: "Premium",
      amountZar: 60,
      renewsOn: null,
    });
    expect(mail.text).toMatch(/renews automatically until you cancel/i);
    expect(mail.text).not.toMatch(/Invalid Date|NaN|undefined/);
  });

  it("promises access to the end of the paid period", () => {
    const mail = buildPaymentReceiptEmail({ firstName: "Sam", planName: "Premium", amountZar: 60 });
    expect(mail.text).toMatch(/keep access to the end of the period/i);
  });
});
