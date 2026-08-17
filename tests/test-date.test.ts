import { describe, expect, it } from "vitest";
import { clampDate, daysUntil, isPastDate, localIsoDate } from "@/lib/utils";
import { isCramWindow } from "@/lib/learning/cram";
import { defaultUserState } from "@/lib/store/local-store";
import type { UserState } from "@/types";

/**
 * A test date is a calendar day, not an instant.
 *
 * The countdown used to be `Date.parse(iso) - Date.now()`, which measures from
 * UTC midnight to the local clock. In SAST that is two hours out, so a test sat
 * yesterday still read as "today" until 02:00 — and the dashboard's `<= 0`
 * branch showed "Test day · Today" for a date months gone.
 */

function withTest(testDate: string | null): UserState {
  const s = defaultUserState();
  s.onboarding = {
    goal: "learners",
    vehicleCode: "8",
    testDate,
    driversTestDate: null,
    confidence: 3,
    worryCategories: [],
    knowledgeLevel: "some",
    studyFrequency: "steady",
    priorAttempts: 0,
    completedAt: "2026-07-01T09:00:00.000Z",
  };
  return s;
}

/** Local midnight-plus-`hours` on the given calendar day. */
const at = (iso: string, hours: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, hours);
};

describe("daysUntil", () => {
  it("counts calendar days, not elapsed hours", () => {
    expect(daysUntil("2026-08-20", at("2026-08-17", 12))).toBe(3);
    expect(daysUntil("2026-08-17", at("2026-08-17", 12))).toBe(0);
    expect(daysUntil("2026-08-16", at("2026-08-17", 12))).toBe(-1);
  });

  it("gives the same answer at every hour of the day", () => {
    for (const hour of [0, 1, 6, 12, 18, 23]) {
      const now = at("2026-08-17", hour);
      expect(daysUntil("2026-08-17", now)).toBe(0); // test day, all day
      expect(daysUntil("2026-08-18", now)).toBe(1);
      expect(daysUntil("2026-08-16", now)).toBe(-1); // sat yesterday, never "today"
    }
  });

  it("has no date to count when none is set", () => {
    expect(daysUntil(null)).toBeNull();
    expect(daysUntil("")).toBeNull();
    expect(daysUntil("not-a-date")).toBeNull();
  });
});

describe("isPastDate", () => {
  it("is true only for days already gone", () => {
    const now = at("2026-08-17", 1); // the hour the old UTC maths got wrong
    expect(isPastDate("2026-08-16", now)).toBe(true);
    expect(isPastDate("2026-08-17", now)).toBe(false);
    expect(isPastDate("2026-08-18", now)).toBe(false);
    expect(isPastDate(null, now)).toBe(false);
  });
});

describe("localIsoDate", () => {
  it("names the local day, not the UTC one", () => {
    // 01:00 SAST is still the previous day in UTC; the picker's floor must be
    // the day the learner is actually living in.
    expect(localIsoDate(at("2026-08-17", 1))).toBe("2026-08-17");
    expect(localIsoDate(at("2026-08-17", 23))).toBe("2026-08-17");
  });
});

describe("clampDate", () => {
  it("holds a date at the floor instead of letting it fall behind", () => {
    expect(clampDate("2026-08-01", "2026-08-17")).toBe("2026-08-17");
    expect(clampDate("2026-08-17", "2026-08-17")).toBe("2026-08-17");
    expect(clampDate("2026-09-02", "2026-08-17")).toBe("2026-09-02");
  });
});

describe("a test date that has passed", () => {
  it("never reopens the cram window, whatever the hour", () => {
    for (const hour of [0, 1, 12, 23]) {
      expect(isCramWindow(withTest("2026-08-16"), at("2026-08-17", hour))).toBe(false);
    }
  });

  it("still counts as today on the day itself", () => {
    expect(isCramWindow(withTest("2026-08-17"), at("2026-08-17", 1))).toBe(true);
  });
});
