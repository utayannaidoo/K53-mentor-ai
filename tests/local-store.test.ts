import { describe, expect, it } from "vitest";
import {
  canRegain,
  daysBetween,
  defaultUserState,
  isoWeekKey,
  resolveStreak,
  todayKey,
  totalUsage,
  touchStreak,
} from "@/lib/store/local-store";
import type { Streak } from "@/types";

const base: Streak = {
  current: 3,
  longest: 5,
  lastStudyDate: "2026-07-05",
  freezesRemaining: 1,
  freezeRefreshedWeek: isoWeekKey(new Date("2026-07-06T12:00:00Z")),
  regainsUsed: 0,
};
const MON = new Date("2026-07-06T12:00:00Z");
// Wednesday of the SAME week as MON — the allowance has not refreshed again.
const WED = new Date("2026-07-08T12:00:00Z");

describe("touchStreak", () => {
  it("continues the streak on a consecutive day", () => {
    const s = touchStreak(base, MON);
    expect(s.current).toBe(4);
    expect(s.lastStudyDate).toBe(todayKey(MON));
  });

  it("is idempotent within the same day", () => {
    const once = touchStreak(base, MON);
    const twice = touchStreak(once, MON);
    expect(twice.current).toBe(once.current);
  });

  it("bridges a single missed day with a freeze, spending the run's regain", () => {
    const s = touchStreak({ ...base, lastStudyDate: "2026-07-04" }, MON);
    expect(s.current).toBe(4);
    expect(s.freezesRemaining).toBe(0);
    expect(s.regainsUsed).toBe(1);
  });

  it("allows only ONE regain per streak run — even with allowance left", () => {
    // Bridge on Monday…
    const bridged = touchStreak({ ...base, lastStudyDate: "2026-07-04" }, MON);
    // …then miss two more days. Handing the allowance back must not buy a
    // second bridge: this run has already used its one regain.
    const s = touchStreak(
      { ...bridged, lastStudyDate: "2026-07-06", freezesRemaining: 1 },
      WED,
    );
    expect(s.current).toBe(1);
    expect(s.regainsUsed).toBe(0);
  });

  it("resets after a 2-day gap with no freeze left", () => {
    const s = touchStreak({ ...base, lastStudyDate: "2026-07-04", freezesRemaining: 0 }, MON);
    expect(s.current).toBe(1);
  });

  it("tracks the longest streak", () => {
    const s = touchStreak({ ...base, current: 5 }, MON);
    expect(s.longest).toBe(6);
  });
});

describe("resolveStreak", () => {
  it("leaves an alive streak untouched (studied today or yesterday)", () => {
    for (const last of ["2026-07-06", "2026-07-05"]) {
      expect(resolveStreak({ ...base, lastStudyDate: last }, MON)).toMatchObject({
        current: base.current,
        regainsUsed: base.regainsUsed,
      });
    }
  });

  it("leaves a frozen-but-savable streak untouched until they actually study", () => {
    const s = resolveStreak({ ...base, lastStudyDate: "2026-07-04" }, MON);
    expect(s.current).toBe(base.current);
    expect(canRegain(s)).toBe(true);
  });

  it("ends an unsavable run at login — shown restarted before any attempt", () => {
    const s = resolveStreak({ ...base, lastStudyDate: "2026-07-03" }, MON);
    expect(s.current).toBe(1);
    expect(s.regainsUsed).toBe(0);
    expect(s.longest).toBe(base.longest);
    // History is kept: the next touchStreak needs the real gap.
    expect(s.lastStudyDate).toBe("2026-07-03");
  });

  it("ends the run when the regain was already spent, even with allowance left", () => {
    const s = resolveStreak(
      { ...base, lastStudyDate: "2026-07-04", freezesRemaining: 1, regainsUsed: 1 },
      MON,
    );
    expect(s.current).toBe(1);
  });

  it("a gap beyond the freeze bridge ends the run regardless of allowance", () => {
    const s = resolveStreak({ ...base, lastStudyDate: "2026-06-20" }, MON);
    expect(s.current).toBe(1);
  });

  it("refreshes the weekly freeze allowance at login", () => {
    const s = resolveStreak({ ...base, freezesRemaining: 0, freezeRefreshedWeek: "2026-W26" }, MON);
    expect(s.freezesRemaining).toBe(1);
    expect(s.freezeRefreshedWeek).toBe(isoWeekKey(MON));
  });
});

describe("daysBetween", () => {
  it("computes whole days between date keys", () => {
    expect(daysBetween("2026-07-01", "2026-07-06")).toBe(5);
    expect(daysBetween("2026-07-06", "2026-07-06")).toBe(0);
  });
});

describe("totalUsage", () => {
  it("sums usage across all recorded days (the free-trial ledger)", () => {
    const state = defaultUserState();
    state.dailyUsage = {
      "2026-07-01": { date: "2026-07-01", flashcards: 6, questions: 10, tutor: 2, scenarios: 0 },
      "2026-07-02": { date: "2026-07-02", flashcards: 6, questions: 5, tutor: 1, scenarios: 1 },
    };
    const sum = totalUsage(state);
    expect(sum.flashcards).toBe(12);
    expect(sum.questions).toBe(15);
    expect(sum.tutor).toBe(3);
    expect(sum.scenarios).toBe(1);
  });
});
