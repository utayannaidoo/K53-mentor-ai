import type { CategoryId, Difficulty, Question, QuestionAttempt } from "@/types";

/**
 * Per-category ability, and the difficulty ladder it drives.
 *
 * Every question in the bank carries a `difficulty` of 1–3, and until now it
 * was read in exactly one place — `easyFirst`, for a self-declared beginner's
 * very first session. Everyone else got the whole eligible pool shuffled by
 * recency, so a learner who had mastered a category kept meeting its easiest
 * questions and one who was drowning kept meeting its hardest.
 *
 * This is deliberately not IRT. With ~150 items per category and a learner who
 * answers a few dozen questions in total, a rolling accuracy is as much signal
 * as the data can carry; anything fancier would be false precision.
 *
 * Takes the pool as an argument and holds no content of its own, so the study
 * surfaces can use it without pulling the bank into the browser bundle.
 */

/** Attempts per category beyond which older ones stop counting. */
const WINDOW = 20;

/** Attempts needed before ability is treated as real rather than a guess. */
export const MIN_ATTEMPTS_FOR_ABILITY = 6;

/** Accuracy at which the next difficulty tier unlocks. */
const PROMOTE_TO_MEDIUM = 0.7;
const PROMOTE_TO_HARD = 0.85;

export interface CategoryAbility {
  /** Rolling accuracy over the recent window, 0–1. */
  accuracy: number;
  attempts: number;
  /** Hardest tier this learner should be meeting in this category. */
  ceiling: Difficulty;
  /** False while we're still guessing from too little data. */
  confident: boolean;
}

/**
 * Recent accuracy per category, most-recent-`WINDOW` attempts only, so a
 * learner who has improved isn't held back by how they answered a fortnight ago.
 */
export function abilityByCategory(
  attempts: readonly QuestionAttempt[],
): Partial<Record<CategoryId, CategoryAbility>> {
  const recent: Partial<Record<CategoryId, QuestionAttempt[]>> = {};
  // Walk backwards so we keep the newest WINDOW per category without sorting.
  for (let i = attempts.length - 1; i >= 0; i--) {
    const a = attempts[i];
    // A timed-out mock records its blanks with selectedIndex -1. computeReadiness
    // deliberately excludes them ("running out of time is not evidence about
    // what the learner knows") and so does this ladder: letting them count as
    // wrong demoted the difficulty ceiling after a single rushed paper, which
    // then served easier questions to exactly the learners who don't need it.
    if (a.selectedIndex < 0) continue;
    const list = (recent[a.categoryId] ??= []);
    if (list.length < WINDOW) list.push(a);
  }

  const out: Partial<Record<CategoryId, CategoryAbility>> = {};
  for (const [cat, list] of Object.entries(recent) as [CategoryId, QuestionAttempt[]][]) {
    const accuracy = list.filter((a) => a.correct).length / list.length;
    const confident = list.length >= MIN_ATTEMPTS_FOR_ABILITY;
    // Until there's real signal, hold at medium: hard questions early read as
    // "this app is impossible", easy ones as "this app is beneath me".
    const ceiling: Difficulty = !confident
      ? 2
      : accuracy >= PROMOTE_TO_HARD
        ? 3
        : accuracy >= PROMOTE_TO_MEDIUM
          ? 2
          : 1;
    out[cat] = { accuracy, attempts: list.length, ceiling, confident };
  }
  return out;
}

/**
 * Keep questions at or below the learner's ceiling in their category, with one
 * rung of headroom so there's always something to stretch for.
 *
 * Never returns an empty list: if the filter would starve the pool (a thin
 * category, or a learner rated down to easy-only), the unfiltered pool wins. A
 * shorter session is a worse outcome than a slightly-too-hard question.
 */
export function withinReach(
  pool: Question[],
  ability: Partial<Record<CategoryId, CategoryAbility>>,
): Question[] {
  const filtered = pool.filter((q) => {
    const ceiling = ability[q.categoryId]?.ceiling ?? 2;
    return q.difficulty <= Math.min(3, ceiling + 1);
  });
  return filtered.length > 0 ? filtered : pool;
}

/**
 * Reorder so no more than two questions in a row share a category.
 *
 * Blocked practice — ten signs questions back to back — feels productive and
 * measurably retains worse than interleaving, because you stop retrieving
 * *which* rule applies and start pattern-matching the last one. Mixed sessions
 * are the default surface, so this is where it matters.
 *
 * Order is otherwise preserved, so the mistakes seeded at the front stay there.
 */
export function interleave(questions: Question[], maxRun = 2): Question[] {
  const remaining = [...questions];
  const out: Question[] = [];
  let lastCat: CategoryId | null = null;
  let run = 0;

  while (remaining.length > 0) {
    let pick = 0;
    if (run >= maxRun) {
      const different = remaining.findIndex((q) => q.categoryId !== lastCat);
      // Everything left is the same category — the run is unavoidable.
      if (different !== -1) pick = different;
    }
    const [q] = remaining.splice(pick, 1);
    run = q.categoryId === lastCat ? run + 1 : 1;
    lastCat = q.categoryId;
    out.push(q);
  }
  return out;
}
