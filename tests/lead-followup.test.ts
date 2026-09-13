import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/lib/constants";
import { buildPlanFollowupEmail } from "@/lib/notify/templates";

/**
 * The single follow-up a captured lead gets.
 *
 * `plan_leads` captured addresses and then never used them — someone asked for
 * their plan, got it once, and heard nothing again. This is the other half,
 * and the constraint that matters is that it stays *one* email: we asked for
 * permission to send a plan, not to run a drip campaign.
 */
const LINK = "https://k53.test/api/unsubscribe?e=a%40b.com&t=abc";

describe("the lead follow-up email", () => {
  const mail = buildPlanFollowupEmail({
    weakCategories: ["rules", "signs"],
    daysSince: 3,
    unsubscribeUrl: LINK,
  });

  it("names the same weak section the plan email named", () => {
    expect(mail.subject).toMatch(/rules of the road/i);
    expect(mail.text).toMatch(/rules of the road/i);
    expect(mail.html).toMatch(/Rules of the road/i);
  });

  it("says it is the only follow-up, and means it", () => {
    // The promise in the copy is kept by `plan_leads.followup_sent_at`, but a
    // reader can only trust it if we actually say it.
    expect(mail.text).toContain("This is the only follow-up we will send.");
    expect(mail.html).toContain("This is the only follow-up we will send.");
  });

  it("points at signup, not at a plan they cannot reach", () => {
    // They have no account, so an /dashboard link would land on a login wall.
    expect(mail.text).toContain(`${SITE_URL}/signup`);
    expect(mail.html).toContain(`${SITE_URL}/signup`);
    expect(mail.html).not.toContain(`${SITE_URL}/dashboard`);
  });

  it("carries the opt-out in both alternatives and the headers", () => {
    expect(mail.text).toContain(`Unsubscribe: ${LINK}`);
    expect(mail.html).toContain(LINK);
    expect(mail.headers?.["List-Unsubscribe"]).toBe(`<${LINK}>`);
    expect(mail.headers?.["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  });

  it("advertises nothing it cannot honour when no secret is configured", () => {
    const noLink = buildPlanFollowupEmail({
      weakCategories: ["rules"],
      daysSince: 4,
      unsubscribeUrl: null,
    });
    expect(noLink.headers).toBeUndefined();
    expect(noLink.text).toMatch(/reply with "stop"/i);
    expect(noLink.html).not.toContain("/api/unsubscribe");
  });

  it("still reads sensibly for a lead with no weak section recorded", () => {
    const even = buildPlanFollowupEmail({
      weakCategories: [],
      daysSince: 5,
      unsubscribeUrl: null,
    });
    expect(even.subject).toBe("Your K53 plan is still here");
    expect(even.text).not.toContain("undefined");
    expect(even.html).not.toContain("undefined");
  });

  it("escapes nothing user-supplied into the markup, because nothing is", () => {
    // The only variable input is a CategoryId, which is a closed enum — worth
    // pinning so a future "name the lead" change doesn't skip the escaping.
    expect(mail.html).not.toMatch(/<script/i);
  });
});
