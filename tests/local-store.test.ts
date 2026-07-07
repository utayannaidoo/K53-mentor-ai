import { describe, expect, it } from "vitest";
import {
  daysBetween,
  defaultUserState,
  isoWeekKey,
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
};
const MON = new Date("2026-07-06T12:00:00Z");

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

  it("bridges a single missed day with a freeze", () => {
    const s = touchStreak({ ...base, lastStudyDate: "2026-07-04" }, MON);
    expect(s.current).toBe(4);
    expect(s.freezesRemaining).toBe(0);
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
