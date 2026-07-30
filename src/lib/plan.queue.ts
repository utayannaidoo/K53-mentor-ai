import type { CategoryId, Flashcard, UserState } from "@/types";
import { FLASHCARDS } from "@/lib/content/flashcards";
import { forCode } from "@/lib/content/vehicle";
import { isDue } from "@/lib/srs/sm2";
import { studyCodeOf } from "@/lib/billing/plans";
import { shuffle } from "@/lib/utils";

/**
 * Queue building — the part of planning that returns real cards.
 *
 * Split out of ./plan on purpose. Everything left there answers questions about
 * shape (how many are due, which category is weakest) and runs inside the study
 * store, which mounts on every app route. This function hands back actual
 * Flashcards, so it has to import the deck, and anything importing it inherits
 * the deck too. Keeping the two apart means only the surfaces that render cards
 * carry them.
 */

/**
 * Build the flashcard study queue: due cards first (shuffled each session),
 * then unseen cards, optionally filtered to a category.
 */
export function selectFlashcardQueue(
  state: UserState,
  opts: { categoryId?: CategoryId; limit?: number } = {},
): Flashcard[] {
  const now = new Date();
  let pool = forCode(FLASHCARDS, studyCodeOf(state));
  if (opts.categoryId) pool = pool.filter((f) => f.categoryId === opts.categoryId);

  // due cards (shuffled so the review order varies each session), then unseen
  const due = shuffle(
    pool.filter((f) => state.cardStates[f.id] && isDue(state.cardStates[f.id], now)),
  );
  const unseen = shuffle(pool.filter((f) => !state.cardStates[f.id]));

  const queue = [...due, ...unseen];
  return opts.limit ? queue.slice(0, opts.limit) : queue;
}
