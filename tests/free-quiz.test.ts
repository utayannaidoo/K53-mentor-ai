import { afterEach, describe, expect, it, vi } from "vitest";
import { pickQuestions } from "@/lib/quiz/free-quiz";
import { STARTER_QUESTIONS } from "@/lib/content/starter";
import { SECTION_OF } from "@/lib/constants";

afterEach(() => vi.restoreAllMocks());

describe("public free quiz", () => {
  it("shuffles answer positions without changing the correct answer or source bank", () => {
    // With this deterministic shuffle, the heavily used first answer moves to D.
    vi.spyOn(Math, "random").mockReturnValue(0);
    const original = structuredClone(STARTER_QUESTIONS);
    const questions = pickQuestions(STARTER_QUESTIONS);
    expect(questions).toHaveLength(10);
    expect(new Set(questions.map((q) => q.id)).size).toBe(10);
    expect(questions.map((q) => SECTION_OF[q.categoryId]).sort()).toEqual([
      "controls", "controls", "rules", "rules", "rules", "rules", "signs", "signs", "signs", "signs",
    ]);
    for (const q of questions) {
      const source = original.find((s) => s.id === q.id)!;
      expect(q.options[q.correctIndex]).toBe(source.options[source.correctIndex]);
      expect(q.options).not.toEqual(source.options);
      expect([...q.options].sort()).toEqual([...source.options].sort());
    }
    expect(questions.some((q) => q.correctIndex === 3)).toBe(true);
    expect(STARTER_QUESTIONS).toEqual(original);
  });

  it("fills missing sections without repeating questions", () => {
    const pool = STARTER_QUESTIONS.filter((q) => SECTION_OF[q.categoryId] === "rules");
    const questions = pickQuestions(pool);
    expect(questions).toHaveLength(10);
    expect(new Set(questions.map((q) => q.id)).size).toBe(10);
  });
});
