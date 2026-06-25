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
export function retrieveRelated(userText: string, excludeId?: string, k = 3): string | null {
  const kw = keywords(userText);
  if (!kw.length) return null;

  const scored: { text: string; score: number }[] = [];

  for (const q of QUESTIONS) {
    if (q.id === excludeId) continue;
    const hay = `${q.prompt} ${q.explanation} ${q.options.join(" ")}`.toLowerCase();
    const score = kw.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0);
    if (score > 0) {
      scored.push({
        text: `Q: ${q.prompt} → ${q.options[q.correctIndex]}. ${q.explanation}`,
        score,
      });
    }
  }

  for (const f of FLASHCARDS) {
    const hay = `${f.front} ${f.back}`.toLowerCase();
    const score = kw.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0);
    if (score > 0) {
      scored.push({ text: `${f.front} → ${f.back}`, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, k).filter((t) => t.score >= 2);
  return top.length ? top.map((t) => `• ${t.text}`).join("\n") : null;
}
