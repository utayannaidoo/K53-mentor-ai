import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildEmail, type NotificationType } from "@/lib/notify/templates";

const TYPES: NotificationType[] = ["streak_risk", "due_review", "dormant_3d", "dormant_7d"];
const base = { firstName: "Thandi", streak: 4, longest: 6, dueCards: 8 };
const LINK = "https://k53.test/api/unsubscribe/reminders?u=u1&t=abc";

/**
 * Study reminders are bulk mail, so they need a working opt-out in both
 * alternatives and in the headers — the same gap that shipped on the plan
 * email. The difference here is what the link does: it stops the reminders,
 * not every email the account gets.
 */
describe("reminder emails carry an opt-out", () => {
  it.each(TYPES)("%s puts the link in the text part and the headers", (type) => {
    const mail = buildEmail(type, { ...base, unsubscribeUrl: LINK });
    expect(mail.text).toContain(`Stop these reminders: ${LINK}`);
    expect(mail.html).toContain(LINK);
    expect(mail.headers?.["List-Unsubscribe"]).toBe(`<${LINK}>`);
    expect(mail.headers?.["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  });

  it("keeps the opt-out when a test-date countdown is also present", () => {
    // The countdown rewrites the body; it must not drop the headers with it.
    const mail = buildEmail("streak_risk", { ...base, unsubscribeUrl: LINK, daysToTest: 9 });
    expect(mail.text).toContain("9 days to your test.");
    expect(mail.text).toContain("Stop these reminders:");
    expect(mail.headers?.["List-Unsubscribe"]).toBe(`<${LINK}>`);
  });

  it("says receipts keep working, because the link does not suppress the address", () => {
    const mail = buildEmail("due_review", { ...base, unsubscribeUrl: LINK });
    expect(mail.html).toMatch(/receipts and account email keep working/i);
  });

  it("advertises nothing it cannot honour when no secret is configured", () => {
    const mail = buildEmail("dormant_3d", base);
    expect(mail.headers).toBeUndefined();
    expect(mail.text).not.toContain("Stop these reminders");
    // Still tells the reader where the switch lives.
    expect(mail.html).toMatch(/account preferences/i);
  });
});

describe("reminder opt-out tokens", () => {
  const OLD = process.env.UNSUBSCRIBE_SECRET;
  beforeAll(() => {
    process.env.UNSUBSCRIBE_SECRET = "test-unsubscribe-secret";
  });
  afterAll(() => {
    if (OLD === undefined) delete process.env.UNSUBSCRIBE_SECRET;
    else process.env.UNSUBSCRIBE_SECRET = OLD;
  });

  it("round-trips the user it was minted for", async () => {
    const m = await import("@/lib/notify/reminder-optout");
    const token = m.reminderOptOutToken("user-1")!;
    expect(m.verifyReminderOptOut("user-1", token)).toBe(true);
    expect(m.verifyReminderOptOut("user-2", token)).toBe(false);
    expect(m.verifyReminderOptOut("user-1", "wrong")).toBe(false);
  });

  it("is not interchangeable with the plan-email unsubscribe token", async () => {
    // Domain separation: same secret, different action, so a link that stops
    // reminders must not replay against the address-suppression endpoint.
    const reminders = await import("@/lib/notify/reminder-optout");
    const leads = await import("@/lib/leads/unsubscribe-token");
    const id = "someone@example.com";
    expect(reminders.reminderOptOutToken(id)).not.toBe(leads.unsubscribeToken(id));
  });

  it("puts the user id, not the address, in the link", async () => {
    const m = await import("@/lib/notify/reminder-optout");
    expect(m.reminderOptOutUrl("user-1")).toContain("/api/unsubscribe/reminders?u=user-1&t=");
  });
});
