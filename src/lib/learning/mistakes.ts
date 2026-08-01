import type { CategoryId, QuestionAttempt, UserState } from "@/types";
import { todayKey } from "@/lib/store/local-store";

/**
 * The Mistake Notebook.
 *
 * Every wrong answer used to vanish into `state.attempts` and feed nothing but
 * aggregate scoring. Worse, the practice queue orders by least-recently-seen —
 * so the question you just proved you don't know went to the *back*. The one
 * item worth re-testing was the one the product hid from you.
 *
 * This derives an open-mistakes list from the attempt log. Nothing new is
 * persisted: the log already carries everything needed, including
 * `selectedIndex` — the distractor the learner actually chose, which is the
 * misconception itself and the most valuable unused datum in the product.
 * "You picked *stop completely* for a yield sign" is teachable; "you got signs
 * wrong" is not.
 */

/** Correct answers, on separate days, needed to retire a mistake. */
export const CORRECTIONS_TO_RETIRE = 2;

export interface Mistake {
  questionId: string;
  categoryId: CategoryId;
  /** The option chosen the last time this was answered wrongly. */
  chosenIndex: number;
  /** Times answered wrongly, ever. */
  wrongCount: number;
  /** ISO timestamp of the most recent wrong answer. */
  lastWrongAt: string;
  /** Distinct yyyy-mm-dd days with a correct answer since that wrong answer. */
  correctDays: string[];
}

function attemptsByQuestion(attempts: readonly QuestionAttempt[]): Map<string, QuestionAttempt[]> {
  const byId = new Map<string, QuestionAttempt[]>();
  for (const a of attempts) {
    const list = byId.get(a.questionId);
    if (list) list.push(a);
    else byId.set(a.questionId, [a]);
  }
  // Attempts arrive in order, but a merge from another device may not be.
  for (const list of byId.values()) list.sort((x, y) => x.at.localeCompare(y.at));
  return byId;
}

/**
 * Questions the learner has got wrong and not yet re-earned.
 *
 * A mistake stays open until it has been answered correctly on
 * `CORRECTIONS_TO_RETIRE` separate days *since the last wrong answer*. Separate
 * days rather than separate attempts on purpose — answering the same question
 * right twice in one sitting is recognition, not recall.
 */
export function openMistakes(state: UserState): Mistake[] {
  const out: Mistake[] = [];

  for (const [questionId, list] of attemptsByQuestion(state.attempts)) {
    const lastWrongIdx = list.map((a) => a.correct).lastIndexOf(false);
    if (lastWrongIdx === -1) continue; // never missed

    const lastWrong = list[lastWrongIdx];
    const correctDays = [
      ...new Set(
        list
          .slice(lastWrongIdx + 1)
          .filter((a) => a.correct)
          .map((a) => a.at.slice(0, 10)),
      ),
    ];
    if (correctDays.length >= CORRECTIONS_TO_RETIRE) continue; // retired

    out.push({
      questionId,
      categoryId: lastWrong.categoryId,
      chosenIndex: lastWrong.selectedIndex,
      wrongCount: list.filter((a) => !a.correct).length,
      lastWrongAt: lastWrong.at,
      correctDays,
    });
  }

  // Most-missed first, then oldest unresolved — the ones actually hurting.
  return out.sort(
    (a, b) => b.wrongCount - a.wrongCount || a.lastWrongAt.localeCompare(b.lastWrongAt),
  );
}

/**
 * Mistakes to put in front of the learner right now.
 *
 * Spacing without a second scheduler: a mistake is not due again on a day it
 * has already been answered. That turns "2 correct on separate days" into a
 * natural one-per-day cadence, and stops a single bad answer from dominating
 * every session until it's fixed.
 */
export function dueMistakes(state: UserState, now = new Date()): Mistake[] {
  const today = todayKey(now);
  const answeredToday = new Set(
    state.attempts.filter((a) => a.at.slice(0, 10) === today).map((a) => a.questionId),
  );
  return openMistakes(state).filter((m) => !answeredToday.has(m.questionId));
}

/**
 * Retired vs open, for progress surfaces and for the honest health metric:
 * mistakes retired over mistakes created. Above 1 means learners are getting
 * better, which readiness alone can't tell you.
 */
export function mistakeStats(state: UserState): {
  open: number;
  retired: number;
  everMissed: number;
} {
  let everMissed = 0;
  for (const list of attemptsByQuestion(state.attempts).values()) {
    if (list.some((a) => !a.correct)) everMissed += 1;
  }
  const open = openMistakes(state).length;
  return { open, retired: everMissed - open, everMissed };
}
