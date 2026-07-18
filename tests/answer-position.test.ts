import { describe, expect, it } from "vitest";
import {
  sampleMockExam,
  sampleMiniMock,
  sampleSectionDrill,
  sampleDiagnostic,
  withShuffledOptions,
} from "@/lib/diagnostic/select";
import { QUESTIONS } from "@/lib/content/questions";

/**
 * Content is authored with the correct answer in a convenient position and
 * shuffled when it is served, so the position carries no information. That only
 * holds while *every* path that shows a question shuffles it — miss one and a
 * whole pack becomes answerable by picking the same letter every time.
 *
 * These tests assert the property learners actually experience: across a served
 * paper, the correct answer moves around.
 */
function positionSpread(qs: { correctIndex: number }[]): Record<number, number> {
  const d: Record<number, number> = {};
  for (const q of qs) d[q.correctIndex] = (d[q.correctIndex] ?? 0) + 1;
  return d;
}

/** No single position may account for more than this share of a served set. */
function assertNoDominantPosition(qs: { correctIndex: number }[], limit = 0.6) {
  const spread = positionSpread(qs);
  for (const [pos, n] of Object.entries(spread)) {
    expect(
      n / qs.length,
      `answer position ${pos} accounts for ${n}/${qs.length} of the paper`,
    ).toBeLessThan(limit);
  }
}

describe("served answer positions", () => {
  it("moves the answer around within a full mock", () => {
    // Averaged over several papers, so one unlucky shuffle can't fail the suite.
    for (let run = 0; run < 20; run++) {
      assertNoDominantPosition(sampleMockExam([], "8"));
    }
  });

  it("moves the answer around in minis, drills and the diagnostic", () => {
    for (let run = 0; run < 20; run++) {
      assertNoDominantPosition(sampleMiniMock([], "8"));
      assertNoDominantPosition(sampleDiagnostic([], "8"));
      for (const section of ["controls", "signs", "rules"] as const) {
        assertNoDominantPosition(sampleSectionDrill(section, [], "8"), 0.7);
      }
    }
  });

  it("keeps the same option correct after shuffling", () => {
    // The shuffle must remap the index, not just reorder the text.
    for (const q of QUESTIONS.slice(0, 300)) {
      const before = q.options[q.correctIndex];
      const after = withShuffledOptions(q);
      expect(after.options[after.correctIndex]).toBe(before);
      expect([...after.options].sort()).toEqual([...q.options].sort());
    }
  });
});
