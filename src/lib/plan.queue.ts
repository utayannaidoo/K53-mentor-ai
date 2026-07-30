import type { CategoryId, Flashcard, UserState } from "@/types";
import { forCode } from "@/lib/content/vehicle";
import { isDue } from "@/lib/srs/sm2";
import { studyCodeOf } from "@/lib/billing/plans";
import { shuffle } from "@/lib/utils";

/**
 * Queue building — the part of planning that returns real cards.
 *
 * Split out of ./plan on purpose. Everything left there answers questions about
 * shape (how many are due, which category is weakest) and runs inside the study
 * store, which mounts on every app route. This one hands back actual Flashcards.
 *
 * It takes the deck as an argument rather than importing it, so the caller
 * decides which deck applies — the bundled starter pack for a free learner, the
 * synced full bank for a paid one. That keeps the deck out of every module that
 * merely wants to schedule a session, and keeps this function a pure function
 * of (deck, history).
 */

/**
 * Build the flashcard study queue: due cards first (shuffled each session),
 * then unseen cards, optionally filtered to a category.
 */
export function selectFlashcardQueue(
  deck: Flashcard[],
  state: UserState,
  opts: { categoryId?: CategoryId; limit?: number } = {},
): Flashcard[] {
  const now = new Date();
  let pool = forCode(deck, studyCodeOf(state));
  if (opts.categoryId) pool = pool.filter((f) => f.categoryId === opts.categoryId);

  // due cards (shuffled so the review order varies each session), then unseen
  const due = shuffle(
    pool.filter((f) => state.cardStates[f.id] && isDue(state.cardStates[f.id], now)),
  );
  const unseen = shuffle(pool.filter((f) => !state.cardStates[f.id]));

  const queue = [...due, ...unseen];
  return opts.limit ? queue.slice(0, opts.limit) : queue;
}
