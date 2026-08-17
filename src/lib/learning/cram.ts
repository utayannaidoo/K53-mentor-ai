import type { Question, UserState } from "@/types";
import { CATEGORY_WEIGHTS } from "@/lib/diagnostic/scoring";
import { openMistakes } from "@/lib/learning/mistakes";
import { daysUntil } from "@/lib/utils";

/**
 * Emergency Revision — the last two days before the test.
 *
 * Everything the product normally does is built for a learner with weeks: space
 * the reviews, ladder the difficulty, interleave, come back tomorrow. None of
 * that helps someone sitting the test on Thursday. With 48 hours left the only
 * rational play is to spend every remaining minute on the things they are still
 * getting wrong, heaviest-weighted section first — signs and rules are 56 of
 * the 64 marks, so a shaky parking question is not where the last hour goes.
 *
 * Deliberately ignores the spacing rule in `dueMistakes`: on test eve, drilling
 * the same miss twice in one day is correct, not a bug.
 *
 * Takes the pool as an argument, so it holds no content of its own.
 */

/** Days before the test when cram mode becomes the right advice. */
export const CRAM_WINDOW_DAYS = 2;

/**
 * Whole days until the learner's test, or null if no date is set.
 * Negative once the test has been sat — callers must not clamp that to 0.
 */
export function daysUntilTest(state: UserState, now = new Date()): number | null {
  return daysUntil(state.onboarding?.testDate ?? null, now);
}

/** True inside the final stretch — test is today, tomorrow, or the day after. */
export function isCramWindow(state: UserState, now = new Date()): boolean {
  const days = daysUntilTest(state, now);
  return days !== null && days >= 0 && days <= CRAM_WINDOW_DAYS;
}

/**
 * Every unresolved mistake, ordered by how much its category is worth on the
 * real paper, then by how often it has been missed.
 *
 * Returns questions, not mistakes, so it drops straight into the practice queue.
 */
export function cramQueue(state: UserState, pool: Question[], limit: number): Question[] {
  const byId = new Map(pool.map((q) => [q.id, q]));
  return openMistakes(state)
    .map((m) => ({ m, q: byId.get(m.questionId) }))
    .filter((x): x is { m: (typeof x)["m"]; q: Question } => Boolean(x.q))
    .sort(
      (a, b) =>
        CATEGORY_WEIGHTS[b.q.categoryId] - CATEGORY_WEIGHTS[a.q.categoryId] ||
        b.m.wrongCount - a.m.wrongCount,
    )
    .slice(0, limit)
    .map((x) => x.q);
}
