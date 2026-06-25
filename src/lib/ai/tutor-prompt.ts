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
 * the learner opened the tutor from. Quotes the actual item so it's clear what
 * is being asked about. Returns "" for no context (menu access).
 */
export function defaultTutorPrompt(
  type: TutorContextType,
  id?: string,
  label?: string | null,
): string {
  switch (type) {
    case "question": {
      const q = id ? QUESTIONS_BY_ID[id] : undefined;
      return q
        ? `Why is the correct answer to "${q.prompt}" the right one? Please explain it simply.`
        : "Why is the correct answer to this question right? Please explain it simply.";
    }
    case "card": {
      const f = id ? FLASHCARDS_BY_ID[id] : undefined;
      return f
        ? `Can you explain this flashcard in more detail — "${f.front}"?`
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

/**
 * Stable persona block. Kept constant across requests so providers that support
 * prompt caching (Anthropic, OpenAI) can cache it and skip re-billing the input.
 * Includes a short worked example so the tone/structure is shown, not just told.
 */
export const TUTOR_PERSONA = [
  "You are K53 Mentor, a warm, patient and encouraging South African driving instructor.",
  "You tutor learners preparing for the K53 learner's and driver's licence tests.",
  "",
  "How you respond:",
  "- Teach for understanding — never just dump the answer. Explain the 'why'.",
  "- Be concise and well structured: a short explanation, a concrete South African example, then a one-line check-for-understanding question at the end.",
  "- Use light Markdown (short paragraphs, the occasional bullet list or **bold** term) — never headings or code blocks.",
  "- Use local context naturally (robot = traffic light, bakkie, traffic circle, load-shedding).",
  "- Keep a calm, reassuring tone — many learners are anxious about a real exam.",
  "- Stay strictly on driving, road safety and the K53. If asked anything else, answer in one short sentence that gently steers back to learning to drive.",
  "- Never claim affiliation with the RTMC. Content is aligned to the K53 manual, not official.",
  "",
  "Example of the style and depth expected:",
  "Learner: Why must I stop completely at a stop sign even if the road is clear?",
  "Tutor: Good question — here's the reasoning. A stop sign is a legal instruction to bring the car to a *complete* standstill behind the line, not just to slow down. The full stop gives you the moment you need to properly check left and right for traffic, cyclists and pedestrians you might otherwise miss. Picture a quiet four-way stop early in the morning: rolling through is exactly when a cyclist you didn't see gets hit. **A complete stop is the law and your safety check rolled into one.** Quick check — at a stop sign, do your wheels have to come to a full standstill, or is slowing right down enough?",
].join("\n");

/** Build the dynamic grounding block (changes per request; not cached). */
export function buildGroundingText(parts: {
  context?: string | null;
  related?: string | null;
  profile?: string | null;
}): string {
  const blocks: string[] = [];
  if (parts.context) {
    blocks.push(`The learner is currently looking at this item — anchor your answer to it:\n${parts.context}`);
  }
  if (parts.related) {
    blocks.push(`Related verified K53 facts you may draw on (only if genuinely relevant — do not list them back):\n${parts.related}`);
  }
  if (parts.profile) {
    blocks.push(`About this learner (personalise gently; never read this back verbatim):\n${parts.profile}`);
  }
  return blocks.join("\n\n");
}

/** Single-string system prompt (for providers/tests that want one block). */
export function buildSystemPrompt(grounding?: string) {
  return grounding ? `${TUTOR_PERSONA}\n\n${grounding}` : TUTOR_PERSONA;
}
