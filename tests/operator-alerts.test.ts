import { describe, expect, it } from "vitest";
import { buildCancellationAlertEmail, buildDisputeAlertEmail } from "@/lib/notify/templates";

/**
 * Operator alerts are the owner's only automatic signal that a learner left or
 * a chargeback clock started ticking. They go to SUPPORT_EMAIL only, so the
 * tests pin the fields a human needs to act: who, what plan, what happened.
 */
describe("buildCancellationAlertEmail", () => {
  const base = {
    userEmail: "learner@example.com",
    userId: "u-123",
    plan: "Premium",
    outcome: "money-back refund issued — access ended immediately",
    daysActive: 3,
  };

  it("names the learner and plan in the subject", () => {
    const mail = buildCancellationAlertEmail(base);
    expect(mail.subject).toContain("[K53 billing]");
    expect(mail.subject).toContain("Premium");
    expect(mail.subject).toContain("learner@example.com");
  });

  it("carries the outcome, reference and days active", () => {
    const mail = buildCancellationAlertEmail({ ...base, reference: "ps_ref_1" });
    expect(mail.text).toContain("learner@example.com");
    expect(mail.text).toContain("money-back refund issued");
    expect(mail.text).toContain("ps_ref_1");
    expect(mail.text).toContain("3");
  });

  it("is explicit that no action is needed unless a give-up alert follows", () => {
    const mail = buildCancellationAlertEmail(base);
    expect(mail.text).toMatch(/No action needed/i);
  });
});

describe("buildDisputeAlertEmail", () => {
  it("names the reference, customer and amount", () => {
    const mail = buildDisputeAlertEmail({
      reference: "ps_ref_9",
      customerCode: "CUS_abc",
      customerEmail: "buyer@example.com",
      amountCents: 6000,
      status: "awaiting-merchant-feedback",
    });
    expect(mail.subject).toContain("[K53 billing] Chargeback opened: ps_ref_9");
    expect(mail.text).toContain("buyer@example.com");
    expect(mail.text).toContain("R 60.00");
    expect(mail.text).toContain("awaiting-merchant-feedback");
  });

  it("survives a payload with missing fields", () => {
    const mail = buildDisputeAlertEmail({
      reference: null,
      customerCode: null,
      customerEmail: null,
      amountCents: null,
      status: null,
    });
    expect(mail.subject).toBe("[K53 billing] Chargeback opened");
    expect(mail.text).toContain("unknown");
  });

  it("says access is not revoked while the dispute is open", () => {
    const mail = buildDisputeAlertEmail({
      reference: "ps_ref_9",
      customerCode: "CUS_abc",
      customerEmail: "buyer@example.com",
      amountCents: 6000,
      status: null,
    });
    expect(mail.text).toMatch(/NOT revoked/i);
  });
});
