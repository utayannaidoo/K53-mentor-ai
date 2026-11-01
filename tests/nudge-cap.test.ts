import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/notify/suppression", () => ({ isSuppressed: vi.fn(async () => false) }));

import { COOLDOWN_HOURS, DORMANT_STOP_DAYS, pickNudge } from "@/lib/notify/nudge";
import { isUndeliverableAddress, sendEmail } from "@/lib/notify/email";
import type { NotificationType } from "@/lib/notify/templates";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const away = { lastStudy: null, streak: 0, dueNow: false, today: "2026-10-31", yesterday: "2026-10-30" };

describe("pickNudge", () => {
  it.each([
    [3, "dormant_3d"],
    [6, "dormant_3d"],
    [7, "dormant_7d"],
    [DORMANT_STOP_DAYS - 1, "dormant_7d"],
    [DORMANT_STOP_DAYS, null],
    [120, null],
  ])("someone away %i days gets %s", (inactiveDays, expected) => {
    expect(pickNudge({ ...away, inactiveDays })).toBe(expected);
  });

  it("does not fall through to due_review once the weekly email has stopped", () => {
    // Every dormant account still has cards falling due; without this they
    // would trade a weekly email for one every other day.
    expect(pickNudge({ ...away, inactiveDays: 40, dueNow: true })).toBeNull();
  });

  it("leaves the nudges for active learners alone", () => {
    expect(pickNudge({ ...away, inactiveDays: 1, dueNow: true })).toBe("due_review");
    expect(
      pickNudge({ ...away, inactiveDays: 1, lastStudy: "2026-10-30", streak: 3, dueNow: true }),
    ).toBe("streak_risk");
  });
});

/**
 * Replays four months of the cron after somebody's last visit, the way
 * production runs it: daily at 16:00 UTC, fired anywhere in that hour, with
 * the ledger stamped just after each send and COOLDOWN_HOURS read back from it.
 */
function replay(lastSeenHourUtc: number, firedAtMinute: (day: number) => number) {
  const lastActive = Date.UTC(2026, 9, 1, lastSeenHourUtc, 17);
  const ledger = new Map<NotificationType, number>();
  const sent: Record<NotificationType, number> = {
    streak_risk: 0,
    due_review: 0,
    dormant_3d: 0,
    dormant_7d: 0,
  };
  for (let day = 1; day <= 120; day++) {
    const now = Date.UTC(2026, 9, 1 + day, 16, firedAtMinute(day));
    const type = pickNudge({ ...away, inactiveDays: Math.floor((now - lastActive) / DAY) });
    if (!type) continue;
    const at = ledger.get(type);
    if (at != null && now - at < COOLDOWN_HOURS[type] * HOUR) continue;
    ledger.set(type, now + 30_000);
    sent[type] += 1;
  }
  return sent;
}

describe("a learner who stops coming back", () => {
  const cronTimings: Record<string, (day: number) => number> = {
    "on the hour": () => 0,
    "late in the hour": () => 59,
    // Alternating both ways round: an early run followed by a late one is
    // what makes `inactiveDays` skip a value, which moves every weekly send.
    "alternating, odd days late": (day) => (day % 2 ? 59 : 0),
    "alternating, even days late": (day) => (day % 2 ? 0 : 59),
    scattered: (day) => (day * 37) % 60,
  };

  it("gets one 3-day check-in and exactly three weekly emails, then nothing", () => {
    for (let hour = 0; hour < 24; hour++) {
      for (const [timing, firedAt] of Object.entries(cronTimings)) {
        expect(replay(hour, firedAt), `last seen ${hour}:17 UTC, cron ${timing}`).toEqual({
          streak_risk: 0,
          due_review: 0,
          dormant_3d: 1,
          dormant_7d: 3,
        });
      }
    }
  });
});

describe("addresses that can never be delivered", () => {
  it.each([
    ["qa-signup-1788511409812-21638f3c@k53mentor.test", true],
    [" Someone@Example.TEST ", true],
    ["a@b.example", true],
    ["a@b.invalid", true],
    ["dev@localhost", true],
    ["learner@gmail.com", false],
    ["support@k53mentorai.co.za", false],
    ["someone@test.co.za", false],
    ["someone@contest", false],
  ])("%s → %s", (email, expected) => {
    expect(isUndeliverableAddress(email)).toBe(expected);
  });

  describe("sendEmail", () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    const message = { subject: "s", html: "<p>h</p>", text: "t" };

    beforeEach(() => {
      process.env.RESEND_API_KEY = "re_test_key";
      vi.stubGlobal("fetch", fetchMock);
      fetchMock.mockClear();
    });
    afterEach(() => {
      delete process.env.RESEND_API_KEY;
      vi.unstubAllGlobals();
    });

    it("never calls the provider for a reserved test domain", async () => {
      expect(await sendEmail({ to: "qa-signup-1@k53mentor.test", ...message })).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("still sends to a real address", async () => {
      expect(await sendEmail({ to: "learner@gmail.com", ...message })).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
