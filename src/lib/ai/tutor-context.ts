import { CATEGORY_MAP } from "@/lib/content/categories";
import type { CategoryId, Flashcard, Question } from "@/types";

/**
 * The client-safe half of the tutor's context handling.
 *
 * Opening the tutor from a question or a flashcard needs two strings: a chip
 * label ("Question · Road signs") and a starter prompt that quotes the item.
 * Both used to come from tutor-prompt.ts, which looks items up in
 * QUESTIONS_BY_ID / FLASHCARDS_BY_ID — so importing either one from a client
 * component dragged the whole bank into /tutor.
 *
 * These take the item instead of an id, because the client already holds it:
 * whatever the learner is looking at came out of the content pool. The
 * lookup-by-id versions stay in tutor-prompt.ts, which is server-only — the API
 * route genuinely needs the full question text, correct answer and explanation
 * to ground the model, and that is exactly the material a browser should not be
 * handed.
 */

export type TutorContextType = "question" | "card" | "category" | "none";

export interface TutorContextInput {
  type: TutorContextType;
  id?: string;
}

/** The chip shown above the composer. Null when there is no anchor item. */
export function contextLabel(type: TutorContextType, categoryId?: CategoryId | null): string | null {
  if (type === "none") return null;
  if (type === "category") {
    return categoryId ? `Topic · ${CATEGORY_MAP[categoryId].name}` : null;
  }
  if (!categoryId) return null;
  const kind = type === "question" ? "Question" : "Flashcard";
  return `${kind} · ${CATEGORY_MAP[categoryId].name}`;
}

/**
 * What to pre-fill the composer with, based on where the tutor was opened from.
 * Quotes the item so it is obvious what is being asked about; falls back to a
 * generic phrasing when the item isn't in the learner's pool (a deep link to
 * something outside the starter pack, say). Returns "" for menu access.
 */
export function starterPrompt(
  type: TutorContextType,
  item: Question | Flashcard | null,
  label?: string | null,
): string {
  switch (type) {
    case "question": {
      const prompt = item && "prompt" in item ? item.prompt : null;
      return prompt
        ? `Why is the correct answer to "${prompt}" the right one? Please explain it simply.`
        : "Why is the correct answer to this question right? Please explain it simply.";
    }
    case "card": {
      const front = item && "front" in item ? item.front : null;
      return front
        ? `Can you explain this flashcard in more detail — "${front}"?`
        : "Can you explain this flashcard to me in more detail?";
    }
    case "category": {
      const topic = label?.replace(/^Topic · /, "").trim();
      return `Can you help me understand ${topic && topic.length ? topic : "this topic"}?`;
    }
    default:
      return "";
  }
}
