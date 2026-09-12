import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/content/questions";
import { STARTER_QUESTIONS } from "@/lib/content/starter";
import {
  sampleDiagnostic,
  sampleMiniMock,
  sampleMockExam,
  sampleSectionDrill,
} from "@/lib/diagnostic/select";
import type { Question } from "@/types";

/**
 * The learner's test is the computerised theory paper. Yard- and road-test
 * items — the examiner's score sheet, manoeuvre attempts, the pre-trip
 * inspection — are driver's practical material. Tagged `learners`, they leaked
 * into the starting check and the 64-question mock, where a yard-scoring
 * question in the 8-question Controls section (6 to pass) measures something
 * the real paper never asks.
 */
const PRACTICAL =
  /\b(yard test|yard manoeuvre|yard movement|yard sequence|yard parking|alley dock\w*|pre-trip inspection|road test|road-test|test sheet|examiner|turn in the road|three-point turn|incline start)\b/i;

function leaked(pool: Question[]): string[] {
  return pool.filter((q) => q.scope === "learners" && PRACTICAL.test(q.prompt)).map((q) => q.id);
}

describe("learner's scope", () => {
  it("no learner-scoped question is about the yard or road test", () => {
    expect(leaked(QUESTIONS)).toEqual([]);
  });

  it("the bundled starter pack agrees with the bank", () => {
    expect(leaked(STARTER_QUESTIONS)).toEqual([]);
  });

  it("every learner's-test paper draws from learner's items only", () => {
    const papers = [
      sampleDiagnostic(QUESTIONS, [], "8"),
      sampleMockExam(QUESTIONS, [], "8"),
      sampleMiniMock(QUESTIONS, [], "8"),
      ...(["controls", "signs", "rules"] as const).map((s) => sampleSectionDrill(QUESTIONS, s, [], "8")),
    ];
    for (const paper of papers) {
      expect(paper.length).toBeGreaterThan(0);
      expect(paper.filter((q) => q.scope !== "learners").map((q) => q.id)).toEqual([]);
    }
  });
});
