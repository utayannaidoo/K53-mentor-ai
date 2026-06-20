import { QUESTIONS, QUESTIONS_BY_ID } from "@/lib/content/questions";
import { FLASHCARDS, FLASHCARDS_BY_ID } from "@/lib/content/flashcards";
import { CATEGORY_MAP } from "@/lib/content/categories";
import type { TutorContextInput } from "@/lib/ai/tutor-prompt";
import type { CategoryId } from "@/types";

const STOP = new Set([
  "what", "why", "how", "the", "are", "does", "explain", "this", "that", "when",
  "should", "can", "you", "please", "tell", "about", "again", "another", "example",
  "give", "with", "from", "have", "does", "your", "mean", "like",
]);

function keywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
}

function searchExplanation(text: string) {
  const kw = keywords(text);
  if (!kw.length) return null;
  let best: (typeof QUESTIONS)[number] | null = null;
  let bestScore = 0;
  for (const q of QUESTIONS) {
    const hay = `${q.prompt} ${q.explanation} ${q.options.join(" ")}`.toLowerCase();
    const score = kw.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = q;
    }
  }
  return bestScore >= 1 ? best : null;
}

function intentPrefix(userText: string): string {
  if (/like i'?m 10|eli ?10|simpl|basic/i.test(userText)) return "Let me put it as simply as I can. ";
  if (/another example|example|real.?world|scenario/i.test(userText)) return "Here's a real-world way to picture it. ";
  if (/why/i.test(userText)) return "Good question — here's the reasoning. ";
  return "";
}

/**
 * Rule-based tutor used when no OpenAI key is set. It produces a genuinely
 * useful, grounded explanation from the seeded content rather than a stub.
 */
export function localTutorReply(userText: string, ctx?: TutorContextInput): string {
  const prefix = intentPrefix(userText);

  if (ctx?.type === "question" && ctx.id && QUESTIONS_BY_ID[ctx.id]) {
    const q = QUESTIONS_BY_ID[ctx.id];
    return `${prefix}${q.explanation}\n\nThe key thing to remember: the correct answer is “${q.options[q.correctIndex]}”. \n\nWant me to give you another example, or a quick way to remember this?`;
  }

  if (ctx?.type === "card" && ctx.id && FLASHCARDS_BY_ID[ctx.id]) {
    const f = FLASHCARDS_BY_ID[ctx.id];
    return `${prefix}${f.back}\n\nSo when you see “${f.front}”, that's what to recall. Would a real-world example help it stick?`;
  }

  if (ctx?.type === "category" && ctx.id && CATEGORY_MAP[ctx.id as CategoryId]) {
    const cat = CATEGORY_MAP[ctx.id as CategoryId];
    return `${prefix}${cat.name} covers ${cat.description.toLowerCase()} The best way to lock it in is short, regular practice — shall I pull up a few ${cat.name.toLowerCase()} questions for you?`;
  }

  const hit = searchExplanation(userText);
  if (hit) {
    return `${prefix}${hit.explanation}\n\nDoes that clear it up, or would you like another example?`;
  }

  return "I'm your K53 tutor — ask me to explain any road sign, rule, intersection or following-distance question and I'll break it down with an example. What would you like to understand better?";
}
