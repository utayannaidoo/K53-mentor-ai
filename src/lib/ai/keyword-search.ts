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
  "give", "with", "from", "have", "your", "mean", "like",
]);

export function keywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
}

/**
 * Best keyword match for a free-text question, or null when nothing scores.
 *
 * Deliberately crude: it counts how many of the asker's content words appear in
 * each question's prompt, explanation and options. That is enough to land on
 * the right K53 topic, and it cannot invent an answer — everything it returns
 * is a verified explanation someone already wrote.
 */
export function bestQuestionFor(text: string, pool: readonly Question[]): Question | null {
  const kw = keywords(text);
  if (!kw.length) return null;

  let best: Question | null = null;
  let bestScore = 0;
  for (const q of pool) {
    const hay = `${q.prompt} ${q.explanation} ${q.options.join(" ")}`.toLowerCase();
    const score = kw.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = q;
    }
  }
  return bestScore >= 1 ? best : null;
}
