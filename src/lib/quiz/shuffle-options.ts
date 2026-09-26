import type { Question } from "@/types";
import { shuffle } from "@/lib/utils";

/**
 * Reorder a question's answer options at random and remap the correct index,
 * so the correct answer is not always in the same slot. Call once when an
 * attempt is prepared (not on every render) so the layout stays stable while
 * the learner reads it.
 */
export function withShuffledOptions(q: Question): Question {
  const order = shuffle(q.options.map((_, i) => i));
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    correctIndex: order.indexOf(q.correctIndex),
  };
}

