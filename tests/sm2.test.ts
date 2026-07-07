import { describe, expect, it } from "vitest";
import { initialCardState, isDue, scheduleCard } from "@/lib/srs/sm2";

const NOW = new Date("2026-07-06T10:00:00Z");

describe("SM-2 scheduling", () => {
  it("a new card rated good is scheduled ~1 day out", () => {
    const next = scheduleCard(initialCardState("c", NOW), "good", NOW);
    expect(next.reps).toBe(1);
    expect(next.intervalDays).toBe(1);
    expect(new Date(next.due).getTime()).toBeGreaterThan(NOW.getTime());
  });

  it("intervals grow across consecutive good reviews", () => {
    let s = initialCardState("c", NOW);
    s = scheduleCard(s, "good", NOW);
    const i1 = s.intervalDays;
    s = scheduleCard(s, "good", NOW);
    const i2 = s.intervalDays;
    s = scheduleCard(s, "good", NOW);
    expect(i2).toBeGreaterThan(i1);
    expect(s.intervalDays).toBeGreaterThan(i2);
  });

  it("'again' lapses the card and resets the interval", () => {
    let s = initialCardState("c", NOW);
    s = scheduleCard(s, "good", NOW);
    s = scheduleCard(s, "good", NOW);
    const lapsed = scheduleCard(s, "again", NOW);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.intervalDays).toBeLessThanOrEqual(1);
  });

  it("ease never drops below the SM-2 floor of 1.3", () => {
    let s = initialCardState("c", NOW);
    for (let i = 0; i < 12; i++) s = scheduleCard(s, "again", NOW);
    expect(s.ease).toBeGreaterThanOrEqual(1.3);
  });

  it("isDue respects the due date", () => {
    const s = scheduleCard(initialCardState("c", NOW), "easy", NOW);
    expect(isDue(s, NOW)).toBe(false);
    expect(isDue(s, new Date("2026-08-01T10:00:00Z"))).toBe(true);
    expect(isDue(undefined, NOW)).toBe(true); // unseen cards are due
  });
});
