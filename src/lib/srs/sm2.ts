import type { CardState, SrsRating } from "@/types";
import { clamp } from "@/lib/utils";

/**
 * SM-2 spaced-repetition scheduler (the classic SuperMemo-2 algorithm).
 * The blueprint defers FSRS until there is review history to optimise against;
 * the CardState shape keeps stability/difficulty-style fields available so an
 * FSRS upgrade is a drop-in replacement later.
 */

export const RATING_QUALITY: Record<SrsRating, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

export const RATING_LABEL: Record<SrsRating, string> = {
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

export function initialCardState(cardId: string, now = new Date()): CardState {
  return {
    cardId,
    reps: 0,
    lapses: 0,
    ease: 2.5,
    intervalDays: 0,
    due: now.toISOString(),
    lastReviewed: null,
    mastery: 0,
  };
}

/** Mastery is a legible 0–100 proxy derived from interval length and lapses. */
function computeMastery(intervalDays: number, reps: number, lapses: number) {
  if (reps === 0) return Math.max(0, 4 - lapses * 2);
  const base = (100 * intervalDays) / (intervalDays + 16);
  return clamp(Math.round(base - lapses * 4), 0, 100);
}

/**
 * Lapses before a card is a leech — it keeps being forgotten, so more repeats
 * of the same prompt won't fix it. Anki's default is 8; 6 is tighter because a
 * learner's licence has a test date and there isn't time to keep failing.
 */
export const LEECH_LAPSES = 6;

/** A card the learner keeps forgetting. Needs a different angle, not more reps. */
export function isLeech(state: CardState | undefined): boolean {
  return (state?.lapses ?? 0) >= LEECH_LAPSES;
}

/** Fraction of the pre-lapse interval a relearned card returns to. */
const LAPSE_RECOVERY = 0.3;

/** Spread of the random jitter applied to intervals of 2+ days. */
const FUZZ = 0.15;

/**
 * Nudge an interval by ±15% so cards learned together don't all come back on
 * the same day. Without it, one big session builds a review cliff a week later
 * and the learner opens the app to 40 due cards — the classic reason people
 * quit spaced repetition. Intervals of a day or less are left alone.
 */
function fuzzed(days: number, rand: () => number): number {
  if (days < 2) return days;
  const spread = days * FUZZ;
  return Math.max(1, Math.round(days + (rand() * 2 - 1) * spread));
}

/**
 * Advance a card's schedule given the learner's self-rating.
 *
 * `rand` is injectable purely so the fuzz is testable; callers should leave it.
 */
export function scheduleCard(
  state: CardState,
  rating: SrsRating,
  now = new Date(),
  rand: () => number = Math.random,
): CardState {
  const q = RATING_QUALITY[rating];
  let { reps, lapses, ease, intervalDays } = state;
  let lapsedFrom = state.lapsedFrom;

  // Update ease factor (never below 1.3).
  ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  if (q < 3) {
    // Lapse — relearn today, but remember how well established this card was.
    reps = 0;
    lapses += 1;
    if (intervalDays >= 2) lapsedFrom = intervalDays;
    intervalDays = 0;
  } else {
    reps += 1;
    if (reps === 1) {
      // First success after a lapse returns toward the old interval rather than
      // starting from scratch — the memory was there yesterday, it isn't gone.
      intervalDays = lapsedFrom
        ? Math.max(1, Math.round(lapsedFrom * LAPSE_RECOVERY))
        : rating === "easy"
          ? 2
          : 1;
      lapsedFrom = undefined;
    } else if (reps === 2) intervalDays = Math.max(6, intervalDays);
    else intervalDays = Math.round(intervalDays * ease);
    if (rating === "hard") intervalDays = Math.max(1, Math.round(intervalDays * 0.7));
    if (rating === "easy") intervalDays = Math.round(intervalDays * 1.15);
    intervalDays = fuzzed(intervalDays, rand);
  }

  const due = new Date(now);
  if (intervalDays <= 0) due.setMinutes(due.getMinutes() + 10);
  else due.setDate(due.getDate() + intervalDays);

  const next: CardState = {
    ...state,
    reps,
    lapses,
    ease: Math.round(ease * 100) / 100,
    intervalDays,
    due: due.toISOString(),
    lastReviewed: now.toISOString(),
    mastery: computeMastery(intervalDays, reps, lapses),
  };
  if (lapsedFrom === undefined) delete next.lapsedFrom;
  else next.lapsedFrom = lapsedFrom;
  return next;
}

export function isDue(state: CardState | undefined, now = new Date()) {
  if (!state) return true; // never seen → due
  return new Date(state.due).getTime() <= now.getTime();
}

/**
 * Human-friendly preview of the next interval for each rating (for the UI).
 *
 * Previews with the fuzz neutralised (`0.5` is the midpoint of the jitter), so
 * the button that says "6 days" doesn't then schedule 7. The real draw happens
 * once, when the rating is actually recorded.
 */
const noFuzz = () => 0.5;

export function previewIntervals(state: CardState): Record<SrsRating, string> {
  const fmt = (s: CardState) => {
    if (s.intervalDays <= 0) return "<10 min";
    if (s.intervalDays === 1) return "1 day";
    if (s.intervalDays < 30) return `${s.intervalDays} days`;
    const months = Math.round(s.intervalDays / 30);
    return months === 1 ? "1 month" : `${months} months`;
  };
  const now = new Date();
  return {
    again: fmt(scheduleCard(state, "again", now, noFuzz)),
    hard: fmt(scheduleCard(state, "hard", now, noFuzz)),
    good: fmt(scheduleCard(state, "good", now, noFuzz)),
    easy: fmt(scheduleCard(state, "easy", now, noFuzz)),
  };
}
