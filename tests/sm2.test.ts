import { describe, expect, it } from "vitest";
import {
  initialCardState,
  isDue,
  isLeech,
  previewIntervals,
  scheduleCard,
  LEECH_LAPSES,
} from "@/lib/srs/sm2";

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

describe("interval fuzz", () => {
  // Cards learned in one session must not all come back on the same day —
  // that review cliff a week later is the classic reason people quit SRS.
  const mature = () => ({ ...initialCardState("c", NOW), reps: 3, intervalDays: 20, ease: 2.5 });

  it("spreads a mature interval either side of the plain SM-2 value", () => {
    const low = scheduleCard(mature(), "good", NOW, () => 0).intervalDays;
    const mid = scheduleCard(mature(), "good", NOW, () => 0.5).intervalDays;
    const high = scheduleCard(mature(), "good", NOW, () => 1).intervalDays;
    expect(low).toBeLessThan(mid);
    expect(high).toBeGreaterThan(mid);
    // ...but stays within ±15%, so scheduling is still SM-2, not noise.
    expect(low).toBeGreaterThanOrEqual(Math.round(mid * 0.85) - 1);
    expect(high).toBeLessThanOrEqual(Math.round(mid * 1.15) + 1);
  });

  it("leaves short intervals alone — jittering 1 day is meaningless", () => {
    const fresh = initialCardState("c", NOW);
    expect(scheduleCard(fresh, "good", NOW, () => 0).intervalDays).toBe(1);
    expect(scheduleCard(fresh, "good", NOW, () => 1).intervalDays).toBe(1);
  });

  it("previewIntervals is stable — the button can't say 6 days and schedule 7", () => {
    // The preview neutralises the fuzz, so repeated reads agree with each other
    // and with the midpoint the learner is actually being promised.
    const s = mature();
    const a = previewIntervals(s);
    const b = previewIntervals(s);
    expect(a).toEqual(b);
    expect(a.good).not.toBe(a.hard); // still reflects the rating
  });
});

describe("lapse recovery", () => {
  it("a mature card that lapses does not restart from one day", () => {
    // Plain SM-2 costs two months of schedule for one bad morning.
    let s = { ...initialCardState("c", NOW), reps: 4, intervalDays: 30, ease: 2.5 };
    s = scheduleCard(s, "again", NOW);
    expect(s.intervalDays).toBe(0); // relearn now
    expect(s.lapsedFrom).toBe(30);

    s = scheduleCard(s, "good", NOW, () => 0.5);
    expect(s.intervalDays).toBe(9); // 30 * 0.3, not 1
    expect(s.lapsedFrom).toBeUndefined();
  });

  it("a brand-new card is unaffected — there is no old interval to recover", () => {
    let s = initialCardState("c", NOW);
    s = scheduleCard(s, "again", NOW);
    expect(s.lapsedFrom).toBeUndefined();
    s = scheduleCard(s, "good", NOW, () => 0.5);
    expect(s.intervalDays).toBe(1);
  });

  it("recovery does not get undone by the next review", () => {
    let s = { ...initialCardState("c", NOW), reps: 4, intervalDays: 30, ease: 2.5 };
    s = scheduleCard(s, "again", NOW);
    s = scheduleCard(s, "good", NOW, () => 0.5); // 9
    s = scheduleCard(s, "good", NOW, () => 0.5); // must not drop to the fixed 6
    expect(s.intervalDays).toBeGreaterThanOrEqual(9);
  });
});

describe("leeches", () => {
  it("flags a card the learner keeps forgetting", () => {
    expect(isLeech(undefined)).toBe(false);
    expect(isLeech({ ...initialCardState("c", NOW), lapses: LEECH_LAPSES - 1 })).toBe(false);
    expect(isLeech({ ...initialCardState("c", NOW), lapses: LEECH_LAPSES })).toBe(true);
  });
})
