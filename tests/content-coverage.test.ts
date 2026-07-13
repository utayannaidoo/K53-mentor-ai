import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/content/questions";
import { FLASHCARDS } from "@/lib/content/flashcards";
import type { CategoryId } from "@/types";

/**
 * Content ratchet: minimum counts per category. Bump these numbers with every
 * content sprint — CI then guarantees the bank only ever grows and a refactor
 * can't silently drop a batch. (Targets live in docs/content/expansion-roadmap.md.)
 */
const MIN_QUESTIONS: Record<CategoryId, number> = {
  signs: 119,
  rules: 113,
  controls: 86,
  hazard_awareness: 59,
  intersections: 54,
  parking: 40,
  following_distance: 39,
};

const MIN_FLASHCARDS: Record<CategoryId, number> = {
  signs: 93,
  rules: 82,
  controls: 73,
  hazard_awareness: 45,
  intersections: 42,
  parking: 31,
  following_distance: 28,
};

function countBy(items: { categoryId: CategoryId }[]): Record<string, number> {
  const c: Record<string, number> = {};
  for (const i of items) c[i.categoryId] = (c[i.categoryId] ?? 0) + 1;
  return c;
}

/** Normalize a prompt so trivial rewording doesn't hide a duplicate. */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

describe("content coverage ratchet", () => {
  const qCounts = countBy(QUESTIONS);
  const fCounts = countBy(FLASHCARDS);

  it.each(Object.entries(MIN_QUESTIONS))("questions: %s has at least %d", (cat, min) => {
    expect(qCounts[cat] ?? 0).toBeGreaterThanOrEqual(min);
  });

  it.each(Object.entries(MIN_FLASHCARDS))("flashcards: %s has at least %d", (cat, min) => {
    expect(fCounts[cat] ?? 0).toBeGreaterThanOrEqual(min);
  });
});

describe("content integrity", () => {
  it("question ids are unique", () => {
    const seen = new Set<string>();
    const dupes = QUESTIONS.filter((q) => (seen.has(q.id) ? true : (seen.add(q.id), false)));
    expect(dupes.map((d) => d.id)).toEqual([]);
  });

  it("flashcard ids are unique", () => {
    const seen = new Set<string>();
    const dupes = FLASHCARDS.filter((f) => (seen.has(f.id) ? true : (seen.add(f.id), false)));
    expect(dupes.map((d) => d.id)).toEqual([]);
  });

  it("no two questions share a normalized prompt (for the same visual)", () => {
    // Sign questions may legitimately reuse prompt text ("What does this sign
    // prohibit?") across DIFFERENT images — the visual is part of the question.
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const q of QUESTIONS) {
      const key = `${normalize(q.prompt)}|${q.image ?? ""}|${q.sign ?? ""}`;
      const prior = seen.get(key);
      if (prior) dupes.push(`${prior} == ${q.id}`);
      else seen.set(key, q.id);
    }
    expect(dupes).toEqual([]);
  });

  it("every question has exactly one correct option within range", () => {
    for (const q of QUESTIONS) {
      expect(q.options.length, q.id).toBeGreaterThanOrEqual(2);
      expect(q.correctIndex, q.id).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex, q.id).toBeLessThan(q.options.length);
    }
  });
});
