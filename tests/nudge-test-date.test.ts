import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/lib/constants";
import { buildEmail, type NotificationType } from "@/lib/notify/templates";

const TYPES: NotificationType[] = ["streak_risk", "due_review", "dormant_3d", "dormant_7d"];
const base = { firstName: "Thando", streak: 4, longest: 6, dueCards: 8 };

/**
 * The learner's own test date is the honest urgency in a study nudge. It rides
 * along on every nudge type when the test is close enough to act on, and
 * never when there's no date, the date has passed, or it's months away.
 */
describe("study nudges carry the test-date countdown", () => {
  it.each(TYPES)("%s names the days left in both html and text", (type) => {
    const mail = buildEmail(type, { ...base, daysToTest: 12 });
    expect(mail.html).toContain("12 days to your test.");
    expect(mail.text).toContain("12 days to your test.");
    // Still inside the body, ahead of the call to action.
    expect(mail.html.indexOf("12 days to your test.")).toBeLessThan(mail.html.indexOf('<a href="'));
    // Before the link line (SITE_URL is http://localhost… under test).
    expect(mail.text.indexOf("12 days to your test.")).toBeLessThan(mail.text.indexOf(SITE_URL));
  });

  it("keeps its place when the opt-out link is there too", () => {
    // Production always sends both, and they were only ever tested apart. The
    // countdown anchors on the last line of the text part holding a URL, so
    // appending the opt-out link first moved that anchor and glued the
    // countdown onto the end of the call to action.
    const link = "https://k53.test/api/unsubscribe/reminders?u=u1&t=abc";
    const mail = buildEmail("streak_risk", { ...base, daysToTest: 12, unsubscribeUrl: link });
    const countdown = mail.text.indexOf("12 days to your test.");
    expect(countdown).toBeGreaterThan(-1);
    expect(countdown).toBeLessThan(mail.text.indexOf(SITE_URL));
    // …and the CTA line still ends where it should, not mid-sentence.
    expect(mail.text).not.toMatch(new RegExp(`${SITE_URL}\\S* 12 days`));
    expect(mail.text.trimEnd().endsWith(`Stop these reminders: ${link}`)).toBe(true);
  });

  it("uses the singular and a test-day line", () => {
    expect(buildEmail("due_review", { ...base, daysToTest: 1 }).text).toContain("1 day to your test.");
    expect(buildEmail("due_review", { ...base, daysToTest: 0 }).text).toContain("Your test is today");
  });

  it.each([null, undefined, -1, 61, Number.NaN])("says nothing for daysToTest = %s", (days) => {
    const withDate = buildEmail("streak_risk", { ...base, daysToTest: days });
    const without = buildEmail("streak_risk", base);
    expect(withDate).toEqual(without);
    expect(withDate.text).not.toContain("to your test");
  });
});
