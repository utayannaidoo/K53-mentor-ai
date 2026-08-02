import type { Question, UserState } from "@/types";
import { categoryName } from "@/lib/content/categories";
import { openMistakes } from "@/lib/learning/mistakes";
import { isCramWindow, daysUntilTest } from "@/lib/learning/cram";

/**
 * What the tutor says before being asked.
 *
 * An instructor doesn't wait in silence for you to think of a question — they
 * open with the thing they noticed. The tutor arrives at a blank screen with
 * four generic prompt chips, which puts the burden of knowing what to ask on
 * the person who by definition doesn't know.
 *
 * Derived locally from the same signals as the learner profile: no API call, no
 * latency, no cost, and nothing is said unless there's something specific worth
 * saying. Returning null is the common, correct case — an opener that fires on
 * every visit with nothing behind it is just noise.
 *
 * Takes the learner's content pool rather than importing the bank: this runs in
 * a client component, and /tutor is the route that already paid for that
 * mistake once.
 */

export interface TutorOpener {
  /** Shown as the tutor's opening line. */
  line: string;
  /** Pre-fills the composer so one tap starts a real conversation. */
  prompt: string;
}

/** Misses needed in one category before it's a pattern rather than a bad day. */
const PATTERN_THRESHOLD = 3;

export function buildTutorOpener(
  state: UserState,
  pool: readonly Question[],
  now = new Date(),
): TutorOpener | null {
  const mistakes = openMistakes(state);
  if (mistakes.length === 0) return null;
  const byId = new Map(pool.map((q) => [q.id, q]));

  // 1. Test imminent and things still unresolved — nothing else matters today.
  if (isCramWindow(state, now)) {
    const days = daysUntilTest(state, now) ?? 0;
    const when = days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
    const worst = byId.get(mistakes[0].questionId);
    return {
      line: `Your test is ${when}, and ${mistakes.length} question${mistakes.length === 1 ? " is" : "s are"} still tripping you up. Let's clear the biggest one first.`,
      prompt: worst
        ? `I keep getting this wrong: "${worst.prompt}". Explain it so it sticks.`
        : "What should I focus on in the time I have left?",
    };
  }

  // 2. A repeated pattern in one category beats a one-off miss.
  const byCategory = new Map<string, number>();
  for (const m of mistakes) {
    byCategory.set(m.categoryId, (byCategory.get(m.categoryId) ?? 0) + 1);
  }
  const [worstCat, count] = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
  if (worstCat && count >= PATTERN_THRESHOLD) {
    const name = categoryName(worstCat as never);
    return {
      line: `You've got ${count} unresolved ${name.toLowerCase()} questions. That's usually one idea being misread, not ${count} separate gaps — want to find it?`,
      prompt: `I keep getting ${name.toLowerCase()} questions wrong. What am I most likely misunderstanding?`,
    };
  }

  // 3. A single stubborn question — specific enough to be worth opening with.
  const stubborn = mistakes.find((m) => m.wrongCount >= 2);
  if (stubborn) {
    const q = byId.get(stubborn.questionId);
    const chose = q?.options[stubborn.chosenIndex];
    if (q && chose) {
      return {
        line: `This one has caught you ${stubborn.wrongCount} times — last time you answered "${chose}". Want to take it apart?`,
        prompt: `Why is "${chose}" wrong for "${q.prompt}"?`,
      };
    }
  }

  return null;
}
