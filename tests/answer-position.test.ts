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

/**
 * Assert positions look uniform across a large aggregate.
 *
 * Deliberately not asserted per paper: on a 15-question mini a single position
 * lands 9 times by chance about once in a hundred papers, so a per-paper bound
 * tight enough to catch a real regression flakes constantly. Aggregate a few
 * thousand served questions and the distribution becomes something you can
 * actually make a claim about.
 */
function assertUniformPositions(qs: { correctIndex: number }[], label: string) {
  const spread = positionSpread(qs);
  expect(qs.length, `${label}: need a large sample`).toBeGreaterThan(1000);
  for (const pos of [0, 1, 2, 3]) {
    const share = (spread[pos] ?? 0) / qs.length;
    // Uniform is 25%; this band is wide enough never to flake and narrow enough
    // to catch an unshuffled pack, which would pin one position near 100%.
    expect(share, `${label}: position ${pos} share ${(share * 100).toFixed(1)}%`).toBeGreaterThan(
      0.15,
    );
    expect(share, `${label}: position ${pos} share ${(share * 100).toFixed(1)}%`).toBeLessThan(0.35);
  }
}

/** A served paper should never be entirely one position — that means no shuffle. */
function assertNotDegenerate(qs: { correctIndex: number }[], label: string) {
  if (qs.length < 8) return;
  expect(Object.keys(positionSpread(qs)).length, `${label}: every answer in one position`).
    toBeGreaterThan(1);
}

describe("served answer positions", () => {
  it("distributes answer positions uniformly across many full mocks", () => {
    const all = [];
    for (let run = 0; run < 30; run++) {
      const mock = sampleMockExam([], "8");
      assertNotDegenerate(mock, "mock");
      all.push(...mock);
    }
    assertUniformPositions(all, "full mock");
  });

  it("does the same for minis, drills and the diagnostic", () => {
    const all = [];
    for (let run = 0; run < 40; run++) {
      for (const paper of [
        sampleMiniMock([], "8"),
        sampleDiagnostic([], "8"),
        ...(["controls", "signs", "rules"] as const).map((s) => sampleSectionDrill(s, [], "8")),
      ]) {
        assertNotDegenerate(paper, "paper");
        all.push(...paper);
      }
    }
    assertUniformPositions(all, "minis/drills/diagnostic");
  });

  it("does not always place a given question's answer in the same slot", () => {
    // The sharpest signal that a serving path shuffles, and unlike a
    // distribution check it needs no statistical margin: an unshuffled path
    // pins every question to one slot forever, so a single question seen in two
    // different slots proves the shuffle ran.
    const slotsById = new Map<string, Set<number>>();
    const servedCount = new Map<string, number>();
    for (let run = 0; run < 40; run++) {
      for (const q of sampleMockExam([], "8")) {
        const set = slotsById.get(q.id) ?? new Set<number>();
        set.add(q.correctIndex);
        slotsById.set(q.id, set);
        servedCount.set(q.id, (servedCount.get(q.id) ?? 0) + 1);
      }
    }
    // Only questions served more than once can possibly show two slots, so they
    // are the only fair denominator. Counting single-serve questions made this
    // ratio fall as the bank grew — a defect in the test, not in the shuffle.
    const repeatable = [...servedCount.entries()].filter(([, n]) => n > 1).map(([id]) => id);
    expect(repeatable.length).toBeGreaterThan(100);
    const varied = repeatable.filter((id) => (slotsById.get(id)?.size ?? 0) > 1).length;
    expect(varied / repeatable.length).toBeGreaterThan(0.8);
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
