import { describe, expect, it } from "vitest";
import { activeDaysFrom, buildDayStrip, dayKey } from "@/lib/dashboard/day-strip";

/**
 * The planner strip is the one part of Today that claims to know what day it
 * is, so the things worth pinning are the ones a date bug hides behind: that
 * the columns line up under fixed weekday headings, that "today" is the day the
 * learner is actually having, and that a UTC slice never shifts a South African
 * evening onto tomorrow.
 */

// A Thursday, late evening in SAST — the case where toISOString() would already
// have rolled over to the next day.
const THURSDAY_NIGHT = new Date(2026, 7, 13, 23, 30);

describe("buildDayStrip", () => {
  it("starts on Monday, so the weekday headings do not lie", () => {
    const strip = buildDayStrip({ activeDays: new Set(), now: THURSDAY_NIGHT });
    expect(strip[0].weekday).toBe(1);
    expect(strip).toHaveLength(14);
    // Consecutive days, no gaps.
    for (let i = 1; i < strip.length; i++) {
      const prev = new Date(strip[i - 1].key);
      const cur = new Date(strip[i].key);
      expect((cur.getTime() - prev.getTime()) / 86_400_000).toBe(1);
    }
  });

  it("marks today from the local date, not a UTC slice", () => {
    // 23:30 SAST on the 13th is already the 14th in UTC. Using toISOString()
    // here would light up tomorrow and leave today unmarked.
    const strip = buildDayStrip({ activeDays: new Set(), now: THURSDAY_NIGHT });
    const today = strip.filter((d) => d.isToday);
    expect(today).toHaveLength(1);
    expect(today[0].day).toBe(13);
    expect(today[0].state).toBe("today");
  });

  it("separates days worked from days missed, and never marks the future missed", () => {
    const worked = new Set([dayKey(new Date(2026, 7, 10)), dayKey(new Date(2026, 7, 11))]);
    const strip = buildDayStrip({ activeDays: worked, now: THURSDAY_NIGHT });
    const byDay = Object.fromEntries(strip.map((d) => [d.day, d.state]));

    expect(byDay[10]).toBe("worked");
    expect(byDay[11]).toBe("worked");
    expect(byDay[12]).toBe("missed");
    expect(byDay[14]).toBe("future");
    expect(strip.filter((d) => d.state === "missed").every((d) => d.key < dayKey(THURSDAY_NIGHT))).toBe(true);
  });

  it("flags test day above everything else", () => {
    const testDate = dayKey(new Date(2026, 7, 18));
    const strip = buildDayStrip({
      // Even if the learner studied on test day, the flag is what matters.
      activeDays: new Set([testDate]),
      testDate,
      now: THURSDAY_NIGHT,
    });
    const day = strip.find((d) => d.key === testDate)!;
    expect(day.state).toBe("test");
    expect(day.isTestDay).toBe(true);
  });

  it("keeps today marked even once the learner has studied today", () => {
    // Otherwise the marker moves mid-session and the strip looks broken.
    const strip = buildDayStrip({
      activeDays: new Set([dayKey(THURSDAY_NIGHT)]),
      now: THURSDAY_NIGHT,
    });
    expect(strip.find((d) => d.isToday)!.state).toBe("today");
  });
});

describe("activeDaysFrom", () => {
  it("collects days across every surface the learner studies on", () => {
    const days = activeDaysFrom([
      [{ at: "2026-08-10T08:00:00.000Z" }],
      [{ endedAt: "2026-08-11T19:00:00.000Z" }],
      [{ at: "2026-08-10T20:00:00.000Z" }],
    ]);
    expect(days.size).toBe(2);
  });

  it("ignores entries with no usable timestamp", () => {
    expect(activeDaysFrom([[{}, { at: "not a date" }]]).size).toBe(0);
  });
});
