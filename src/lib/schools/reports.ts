/**
 * The owner's numbers, computed from the diary, the ledger and test results.
 *
 * Pure functions, so every figure on the reports screen can be tested against
 * a hand-worked example. The definitions are deliberately strict, because a
 * school will quote these to parents and to itself:
 *
 *   - a no-show rate is out of lessons that were DUE to happen (taught plus
 *     missed) — blocked time and cancellations cannot dilute it;
 *   - a pass rate counts every attempt (see passRate in test-day.ts);
 *   - nothing here is a stored total, so nothing here can drift.
 */

export interface LessonFact {
  instructor_id: string;
  learner_id: string | null;
  status: string;
  kind: string;
  starts_at: string;
}

export interface LessonStats {
  taught: number;
  noShows: number;
  cancelled: number;
  booked: number;
  /** No-shows out of lessons that were due to happen; null when none were. */
  noShowRate: number | null;
}

/** Lesson counts for bookings that start in [fromIso, toIso). */
export function lessonStats(lessons: LessonFact[], fromIso: string, toIso: string): LessonStats {
  const from = Date.parse(fromIso);
  const to = Date.parse(toIso);
  const inWindow = lessons.filter((l) => {
    const at = Date.parse(l.starts_at);
    return l.kind !== "block" && at >= from && at < to;
  });
  const taught = inWindow.filter((l) => l.status === "completed").length;
  const noShows = inWindow.filter((l) => l.status === "no_show").length;
  const cancelled = inWindow.filter((l) => l.status.startsWith("cancelled")).length;
  const booked = inWindow.filter((l) => l.status === "scheduled").length;
  const due = taught + noShows;
  return { taught, noShows, cancelled, booked, noShowRate: due === 0 ? null : noShows / due };
}

/** Monday of the week containing `day` (`YYYY-MM-DD`), as `YYYY-MM-DD`. */
export function mondayOf(day: string): string {
  const date = new Date(`${day}T12:00:00Z`);
  const weekday = (date.getUTCDay() + 6) % 7; // Monday 0 … Sunday 6
  date.setUTCDate(date.getUTCDate() - weekday);
  return date.toISOString().slice(0, 10);
}

/** "12%", or "—" when there is nothing to divide by. */
export function percent(rate: number | null): string {
  return rate === null ? "—" : `${Math.round(rate * 100)}%`;
}
