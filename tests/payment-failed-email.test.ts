import { describe, expect, it } from "vitest";
import { buildPaymentFailedEmail } from "@/lib/notify/templates";
import { SITE_URL } from "@/lib/constants";

/**
 * The dunning email is the single highest-value place for a card-update link:
 * it arrives *because* a card needs replacing. It used to tell the reader to
 * "cancel and resubscribe with the new card" — asking someone whose payment
 * just failed to give up their subscription first, which is how you churn a
 * customer who wanted to stay.
 */
describe("buildPaymentFailedEmail", () => {
  const base = { firstName: "Sam", planName: "Premium" };

  it("links straight to Paystack's hosted card page when we have one", () => {
    const url = "https://paystack.com/manage/subscriptions/abc123";
    const mail = buildPaymentFailedEmail({ ...base, manageUrl: url });

    // Absolute URLs must survive `wrap`, which prefixes SITE_URL to in-app
    // paths. Getting this wrong produces "https://k53mentorai.co.zahttps://…"
    // in the one email whose entire purpose is that link.
    expect(mail.html).toContain(`href="${url}"`);
    expect(mail.html).not.toContain(`${SITE_URL}https://`);
    expect(mail.text).toContain(url);
  });

  it("falls back to the billing page when Paystack wouldn't give us a link", () => {
    const mail = buildPaymentFailedEmail({ ...base, manageUrl: null });
    expect(mail.html).toContain(`href="${SITE_URL}/account/billing"`);
    expect(mail.text).toContain(`${SITE_URL}/account/billing`);
  });

  it("no longer tells people to cancel and resubscribe", () => {
    for (const mail of [
      buildPaymentFailedEmail({ ...base, manageUrl: null }),
      buildPaymentFailedEmail({ ...base, manageUrl: "https://paystack.com/x" }),
    ]) {
      expect(mail.text.toLowerCase()).not.toContain("cancel and resubscribe");
      expect(mail.html.toLowerCase()).not.toContain("cancel and resubscribe");
    }
  });

  it("says the plan is still active, so nobody panics into cancelling", () => {
    const mail = buildPaymentFailedEmail({ ...base, manageUrl: null });
    expect(mail.text).toMatch(/stays active/i);
  });

  it("is explicit that we never see the card", () => {
    const mail = buildPaymentFailedEmail({ ...base, manageUrl: null });
    expect(mail.text).toMatch(/never see your card/i);
  });
});
