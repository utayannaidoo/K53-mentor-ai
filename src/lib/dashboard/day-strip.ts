/**
 * The fortnight either side of today, as a planner reads it.
 *
 * A study app's calendar is not a diary of appointments — nothing is booked.
 * What a learner actually wants from a date strip is two things: the run of
 * days they have kept up, and how many are left before the test. So each day
 * carries only whether it was worked and where it sits relative to today and
 * to test day, and the strip starts on the Monday of this week so the columns
 * line up under fixed weekday headings.
 */

export type DayState = "worked" | "missed" | "today" | "future" | "test";

export interface StripDay {
  /** yyyy-mm-dd, local. */
  key: string;
  /** Day of month, for the label. */
  day: number;
  weekday: number;
  state: DayState;
  isToday: boolean;
  isTestDay: boolean;
}

/** Local yyyy-mm-dd — never toISOString, which shifts the day in +SAST. */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function buildDayStrip(opts: {
  /** Every date the learner did something, as yyyy-mm-dd. */
  activeDays: ReadonlySet<string>;
  /** The booked test date, yyyy-mm-dd, if there is one. */
  testDate?: string | null;
  now?: Date;
  /** Days to show. Two weeks fits a phone at seven columns a row. */
  length?: number;
}): StripDay[] {
  const now = opts.now ?? new Date();
  const todayKey = dayKey(now);

  // Back up to Monday so the columns sit under fixed weekday headings —
  // a strip that starts on an arbitrary day makes the headings lie.
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const sinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - sinceMonday);

  const out: StripDay[] = [];
  for (let i = 0; i < (opts.length ?? 14); i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dayKey(d);
    const isToday = key === todayKey;
    const isTestDay = Boolean(opts.testDate) && key === opts.testDate;

    // Test day outranks everything — it is the one date the strip exists for.
    // Today outranks worked/missed so the marker never disappears mid-session.
    const state: DayState = isTestDay
      ? "test"
      : isToday
        ? "today"
        : opts.activeDays.has(key)
          ? "worked"
          : key < todayKey
            ? "missed"
            : "future";

    out.push({ key, day: d.getDate(), weekday: d.getDay(), state, isToday, isTestDay });
  }
  return out;
}

/** How much the learner did each day, from the shapes the store already keeps. */
export function activityByDay(
  sources: ReadonlyArray<ReadonlyArray<{ at?: string; endedAt?: string }>>,
): Map<string, number> {
  const days = new Map<string, number>();
  for (const list of sources) {
    for (const item of list) {
      const stamp = item.at ?? item.endedAt;
      if (!stamp) continue;
      const d = new Date(stamp);
      if (Number.isNaN(d.getTime())) continue;
      const key = dayKey(d);
      days.set(key, (days.get(key) ?? 0) + 1);
    }
  }
  return days;
}

/** Days the learner did anything, from the shapes the store already keeps. */
export function activeDaysFrom(
  sources: ReadonlyArray<ReadonlyArray<{ at?: string; endedAt?: string }>>,
): Set<string> {
  return new Set(activityByDay(sources).keys());
}

/** Intensity bands above zero. Four is enough to read a shape, few enough to stay legible. */
export const HEAT_LEVELS = 4;

export interface HeatDay {
  /** yyyy-mm-dd, local. */
  key: string;
  /** Items recorded that day. */
  count: number;
  /** 0 for nothing, else 1…HEAT_LEVELS. */
  level: number;
  isToday: boolean;
  /** After today — rendered as an empty slot, never as a missed day. */
  future: boolean;
}

/**
 * The last N weeks as a calendar grid, column-major and Monday-first.
 *
 * A streak is a number; this is its shape. The count answers "did I keep it up",
 * which two integers cannot — a 6-day streak reads the same whether the month
 * behind it was solid or a single good week after three empty ones.
 *
 * Returned flat, in the order a `grid-flow-col` with seven rows consumes it, so
 * the caller needs no nested map to render it. Bands are cut against the
 * learner's own busiest day rather than a fixed count: a 12-question day is a
 * good day for someone who does 10 and a slow one for someone who does 60.
 */
export function buildHeatmap(opts: {
  counts: ReadonlyMap<string, number>;
  /** Weeks to show, including this one. */
  weeks?: number;
  now?: Date;
}): HeatDay[] {
  const now = opts.now ?? new Date();
  const weeks = opts.weeks ?? 12;
  const todayKey = dayKey(now);

  // End on the Sunday that closes this week so today sits in the last column,
  // then walk back whole weeks — the grid always has exactly 7 × weeks cells.
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (weeks - 1) * 7);

  const peak = Math.max(1, ...opts.counts.values());
  const out: HeatDay[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dayKey(d);
    const count = opts.counts.get(key) ?? 0;
    out.push({
      key,
      count,
      level: count === 0 ? 0 : Math.max(1, Math.ceil((count / peak) * HEAT_LEVELS)),
      isToday: key === todayKey,
      future: key > todayKey,
    });
  }
  return out;
}
