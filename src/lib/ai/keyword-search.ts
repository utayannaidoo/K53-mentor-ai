import type { Question } from "@/types";

/**
 * The rule-based tutor's question matcher, over whatever pool it is given.
 *
 * Split out of `fallback.ts` so it can be used on the client. `fallback.ts`
 * imports the whole bank to resolve ids, which is right for the API route and
 * wrong for anything that renders in a browser — and the landing page's tutor
 * demo needs exactly this matching against exactly the content a signed-out
 * visitor is allowed to have (the bundled starter pack).
 *
 * Holds no content of its own.
 */

const STOP = new Set([
  "what", "why", "how", "the", "are", "does", "explain", "this", "that", "when",
  "should", "can", "you", "please", "tell", "about", "again", "another", "example",
  "give", "with", "from", "have", "your", "mean", "like", "work", "works",
]);

export function keywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
}

/** Match a topic term, never a coincidental substring ("four" ≠ "fourth"). */
export function containsKeyword(text: string, word: string): boolean {
  return new RegExp(`\\b${word}\\b`, "i").test(text);
}

/**
 * Best keyword match for a free-text question, or null when nothing scores.
 *
 * A match must share at least two content words and one must occur in the
 * question prompt. Supporting text must not turn one generic word such as
 * "stop" into an unrelated answer.
 */
export function bestQuestionFor(text: string, pool: readonly Question[]): Question | null {
  const kw = keywords(text);
  if (!kw.length) return null;

  let best: Question | null = null;
  let bestScore = 0;
  for (const q of pool) {
    const prompt = q.prompt.toLowerCase();
    const supporting = `${q.explanation} ${q.options.join(" ")}`.toLowerCase();
    const promptMatches = kw.filter((word) => containsKeyword(prompt, word));
    const totalMatches = kw.filter((word) => containsKeyword(prompt, word) || containsKeyword(supporting, word));
    if (promptMatches.length === 0 || totalMatches.length < 2) continue;
    const score = promptMatches.length * 2 + totalMatches.length;
    if (score > bestScore) {
      bestScore = score;
      best = q;
    }
  }
  return bestScore >= 3 ? best : null;
}
