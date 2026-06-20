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

/** Advance a card's schedule given the learner's self-rating. */
export function scheduleCard(
  state: CardState,
  rating: SrsRating,
  now = new Date(),
): CardState {
  const q = RATING_QUALITY[rating];
  let { reps, lapses, ease, intervalDays } = state;

  // Update ease factor (never below 1.3).
  ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  if (q < 3) {
    // Lapse — relearn today.
    reps = 0;
    lapses += 1;
    intervalDays = 0;
  } else {
    reps += 1;
    if (reps === 1) intervalDays = rating === "easy" ? 2 : 1;
    else if (reps === 2) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * ease);
    if (rating === "hard") intervalDays = Math.max(1, Math.round(intervalDays * 0.7));
    if (rating === "easy") intervalDays = Math.round(intervalDays * 1.15);
  }

  const due = new Date(now);
  if (intervalDays <= 0) due.setMinutes(due.getMinutes() + 10);
  else due.setDate(due.getDate() + intervalDays);

  return {
    ...state,
    reps,
    lapses,
    ease: Math.round(ease * 100) / 100,
    intervalDays,
    due: due.toISOString(),
    lastReviewed: now.toISOString(),
    mastery: computeMastery(intervalDays, reps, lapses),
  };
}

export function isDue(state: CardState | undefined, now = new Date()) {
  if (!state) return true; // never seen → due
  return new Date(state.due).getTime() <= now.getTime();
}

/** Human-friendly preview of the next interval for each rating (for the UI). */
export function previewIntervals(state: CardState): Record<SrsRating, string> {
  const fmt = (s: CardState) => {
    if (s.intervalDays <= 0) return "<10 min";
    if (s.intervalDays === 1) return "1 day";
    if (s.intervalDays < 30) return `${s.intervalDays} days`;
    const months = Math.round(s.intervalDays / 30);
    return months === 1 ? "1 month" : `${months} months`;
  };
  return {
    again: fmt(scheduleCard(state, "again")),
    hard: fmt(scheduleCard(state, "hard")),
    good: fmt(scheduleCard(state, "good")),
    easy: fmt(scheduleCard(state, "easy")),
  };
}
