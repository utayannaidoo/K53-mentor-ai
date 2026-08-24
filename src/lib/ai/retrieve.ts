import { QUESTIONS } from "@/lib/content/questions";
import { FLASHCARDS } from "@/lib/content/flashcards";
import { keywords } from "@/lib/ai/fallback";

/**
 * Lightweight retrieval (RAG-lite) over the seeded K53 content bank.
 *
 * Scores every question + flashcard against the keywords in the learner's
 * message and returns the top matches as compact grounding text. This lets the
 * tutor cite *verified* K53 facts beyond the single item the learner clicked
 * from — without an embeddings index or any extra API cost.
 */

/**
 * Lowercased search text per item, built once per server instance. The bank is
 * static for the life of a deployment, and rebuilding ~2,300 haystack strings
 * on every tutor message was pure repeated CPU on the critical path to the
 * first token. Keyed by item id (unique across both banks) so one Map serves
 * the exclusion check too.
 */
const haystacks = new Map<string, string>();
for (const q of QUESTIONS) {
  haystacks.set(q.id, `${q.prompt} ${q.explanation} ${q.options.join(" ")}`.toLowerCase());
}
for (const f of FLASHCARDS) {
  haystacks.set(f.id, `${f.front} ${f.back}`.toLowerCase());
}

export function retrieveRelated(userText: string, excludeId?: string, k = 3): string | null {
  const kw = keywords(userText);
  if (!kw.length) return null;

  const scored: { text: string; score: number }[] = [];

  for (const q of QUESTIONS) {
    if (q.id === excludeId) continue;
    const hay = haystacks.get(q.id)!;
    const score = kw.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0);
    if (score > 0) {
      scored.push({
        text: `Q: ${q.prompt} → ${q.options[q.correctIndex]}. ${q.explanation}`,
        score,
      });
    }
  }

  for (const f of FLASHCARDS) {
    const hay = haystacks.get(f.id)!;
    const score = kw.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0);
    if (score > 0) {
      scored.push({ text: `${f.front} → ${f.back}`, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, k).filter((t) => t.score >= 2);
  return top.length ? top.map((t) => `• ${t.text}`).join("\n") : null;
}
