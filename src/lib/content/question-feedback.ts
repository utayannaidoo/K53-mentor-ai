import { SUPPORT_EMAIL } from "@/lib/constants";
import { categoryName } from "@/lib/content/categories";
import type { Question } from "@/types";

export type QuestionFeedbackContext = "practice" | "mock review";

/**
 * Build a correction email with enough immutable context for an editor to
 * find the exact bank item. The learner still writes what seems wrong before
 * choosing to send it in their own mail app.
 */
export function questionFeedbackHref(
  question: Pick<Question, "id" | "categoryId" | "prompt">,
  context: QuestionFeedbackContext,
): string {
  const subject = `Question correction: ${question.id}`;
  const body = [
    `Question ID: ${question.id}`,
    `Study area: ${categoryName(question.categoryId)}`,
    `Seen in: ${context}`,
    `Question: ${question.prompt}`,
    "",
    "What seems wrong?",
    "",
  ].join("\n");

  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
