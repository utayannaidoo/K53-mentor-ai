import type { Question, Flashcard, CategoryId } from "@/types";

/**
 * Flashcards derived from the question bank.
 *
 * Every question already carries a vetted correct answer + a teaching
 * explanation and traces to the same sources as the bank (provenance.ts), so a
 * question is a source-safe seed for a recall card: the prompt becomes the
 * front, the correct option + explanation become the back. This turns the large
 * question bank into spaced-repetition coverage without re-authoring facts.
 *
 * Derivation is deterministic and de-duplicated so it never competes with the
 * hand-authored cards or repeats a fact:
 *  - questions that need their options to be answerable are skipped;
 *  - a sign already covered by a hand-authored card (same image) is skipped, and
 *    only one card is derived per sign;
 *  - a non-sign fact already covered (same front, or same answer) is skipped.
 *
 * Per category we top up to TARGET_RATIO of that category's question count, so
 * coverage is even and the deck doesn't balloon past the bank.
 */

/** Flashcards should cover this fraction of each category's questions. */
const TARGET_RATIO = 0.75;

/**
 * Prompts that can't be answered without seeing the options ("which of the
 * following…") make poor recall fronts — skip them.
 */
const NEEDS_OPTIONS =
  /\b(which of (the )?(following|these)|which of the|which statement|which one|all of the above|none of the above|which is (correct|true|false)|the following)\b/i;

const norm = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

/** The card back is a fixed-height box in the UI — keep backs tidy, like the
 *  hand-authored ones (which top out ~170 chars). */
const MAX_BACK = 240;

/** Trim to MAX_BACK on a sentence boundary where possible, else on a word. */
function clamp(text: string): string {
  if (text.length <= MAX_BACK) return text;
  const cut = text.slice(0, MAX_BACK);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "), cut.lastIndexOf("! "));
  if (stop > MAX_BACK * 0.55) return text.slice(0, stop + 1).trim();
  return cut.replace(/\s+\S*$/, "").trim() + "…";
}

/**
 * Build the card back from the question's answer + explanation. The explanation
 * teaches the why and usually already states the answer, so prefer it alone;
 * only prepend the answer when it adds a fact the explanation doesn't, and only
 * when the result stays tidy. Always clamped so a card never overflows.
 */
function toBack(q: Question): string {
  const answer = q.options[q.correctIndex]?.trim() ?? "";
  const exp = q.explanation?.trim() ?? "";
  if (!exp) return clamp(answer);
  if (!answer) return clamp(exp);
  if (norm(exp).includes(norm(answer))) return clamp(exp); // explanation already says it
  const combined = `${answer} — ${exp}`;
  return clamp(combined.length <= MAX_BACK ? combined : exp);
}

/**
 * Build the derived flashcards. Pure (takes the bank + the hand-authored cards
 * as arguments) so this module imports no content and can't create an import
 * cycle with flashcards.ts.
 */
export function deriveFlashcards(questions: Question[], existing: Flashcard[]): Flashcard[] {
  const existingFronts = new Set(existing.map((f) => norm(f.front)));
  const existingImages = new Set(existing.filter((f) => f.image).map((f) => f.image!));
  const existingAnswers = new Set(existing.map((f) => norm(f.back).slice(0, 40)));

  const qByCat = new Map<CategoryId, number>();
  const exByCat = new Map<CategoryId, number>();
  for (const q of questions) qByCat.set(q.categoryId, (qByCat.get(q.categoryId) ?? 0) + 1);
  for (const f of existing) exByCat.set(f.categoryId, (exByCat.get(f.categoryId) ?? 0) + 1);

  // How many new cards each category may take to reach TARGET_RATIO coverage.
  const quota = new Map<CategoryId, number>();
  for (const [cat, qn] of qByCat) {
    quota.set(cat, Math.max(0, Math.ceil(qn * TARGET_RATIO) - (exByCat.get(cat) ?? 0)));
  }

  const takenByCat = new Map<CategoryId, number>();
  const usedImages = new Set<string>();
  const usedFronts = new Set<string>();
  const usedAnswers = new Set<string>();
  const usedIds = new Set(existing.map((f) => f.id));
  const out: Flashcard[] = [];

  for (const q of questions) {
    if ((takenByCat.get(q.categoryId) ?? 0) >= (quota.get(q.categoryId) ?? 0)) continue;
    if (NEEDS_OPTIONS.test(q.prompt)) continue;

    if (q.image) {
      // Sign card: one per sign, and never one a hand-authored card already covers.
      if (existingImages.has(q.image) || usedImages.has(q.image)) continue;
    } else {
      const front = norm(q.prompt);
      const answer = norm(q.options[q.correctIndex] ?? "").slice(0, 50);
      if (existingFronts.has(front) || usedFronts.has(front)) continue;
      if (existingAnswers.has(answer.slice(0, 40)) || usedAnswers.has(answer)) continue;
      usedFronts.add(front);
      usedAnswers.add(answer);
    }

    const id = `fcd_${q.id}`;
    if (usedIds.has(id)) continue;
    usedIds.add(id);
    if (q.image) usedImages.add(q.image);

    out.push({
      id,
      categoryId: q.categoryId,
      front: q.prompt,
      back: toBack(q),
      difficulty: q.difficulty,
      ...(q.sign ? { sign: q.sign } : {}),
      ...(q.image ? { image: q.image } : {}),
      ...(q.codes ? { codes: q.codes } : {}),
    });
    takenByCat.set(q.categoryId, (takenByCat.get(q.categoryId) ?? 0) + 1);
  }

  return out;
}
