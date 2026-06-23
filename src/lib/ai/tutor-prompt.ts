import { QUESTIONS_BY_ID } from "@/lib/content/questions";
import { FLASHCARDS_BY_ID } from "@/lib/content/flashcards";
import { CATEGORY_MAP } from "@/lib/content/categories";
import type { CategoryId } from "@/types";

export type TutorContextType = "question" | "card" | "category" | "none";

export interface TutorContextInput {
  type: TutorContextType;
  id?: string;
}

export interface ResolvedContext {
  label: string;
  text: string;
}

const LETTERS = ["A", "B", "C", "D"];

/** Resolve a context reference into a label (for the UI pill) and grounding text. */
export function resolveContext(ctx?: TutorContextInput): ResolvedContext | null {
  if (!ctx || ctx.type === "none" || !ctx.id) return null;

  if (ctx.type === "question") {
    const q = QUESTIONS_BY_ID[ctx.id];
    if (!q) return null;
    const opts = q.options.map((o, i) => `${LETTERS[i]}. ${o}`).join("\n");
    return {
      label: `Question · ${CATEGORY_MAP[q.categoryId].name}`,
      text: `QUESTION: ${q.prompt}\nOPTIONS:\n${opts}\nCORRECT ANSWER: ${LETTERS[q.correctIndex]}. ${q.options[q.correctIndex]}\nOFFICIAL EXPLANATION: ${q.explanation}`,
    };
  }

  if (ctx.type === "card") {
    const f = FLASHCARDS_BY_ID[ctx.id];
    if (!f) return null;
    return {
      label: `Flashcard · ${CATEGORY_MAP[f.categoryId].name}`,
      text: `FLASHCARD FRONT: ${f.front}\nFLASHCARD BACK: ${f.back}`,
    };
  }

  if (ctx.type === "category") {
    const cat = CATEGORY_MAP[ctx.id as CategoryId];
    if (!cat) return null;
    return {
      label: `Topic · ${cat.name}`,
      text: `TOPIC: ${cat.name} — ${cat.description}`,
    };
  }

  return null;
}

/**
 * A natural starter prompt to pre-fill the tutor composer with, based on where
 * the learner opened the tutor from. Returns "" for no context (menu access),
 * so the box is left blank.
 */
export function defaultTutorPrompt(type: TutorContextType, label?: string | null): string {
  switch (type) {
    case "question":
      return "Why is the correct answer to this question right? Please explain it simply.";
    case "card":
      return "Can you explain this flashcard to me in more detail?";
    case "category": {
      const topic = label?.replace(/^Topic · /, "").trim();
      return `Can you help me understand ${topic && topic.length ? topic : "this topic"}?`;
    }
    default:
      return "";
  }
}

export function buildSystemPrompt(contextText?: string) {
  return [
    "You are K53 Mentor, a warm, patient and encouraging South African driving instructor.",
    "You tutor learners preparing for the K53 learner's and driver's licence tests.",
    "",
    "How you respond:",
    "- Teach for understanding — never just dump the answer. Explain the 'why'.",
    "- Be concise and well structured: a short explanation, a concrete South African example, then a one-line check-for-understanding question at the end.",
    "- Use local context naturally (robot = traffic light, bakkie, traffic circle, load-shedding).",
    "- Keep a calm, reassuring tone — many learners are anxious about a real exam.",
    "- If asked something outside driving/road-safety/K53, gently steer back.",
    "- Never claim affiliation with the RTMC. Content is aligned to the K53 manual, not official.",
    contextText ? `\nThe learner is currently looking at this item — anchor your answer to it:\n${contextText}` : "",
  ].join("\n");
}
