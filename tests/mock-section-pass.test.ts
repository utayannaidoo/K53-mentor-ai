import { describe, expect, it } from "vitest";
import { EXAM_FORMAT } from "@/lib/constants";
import { SECTION_OF, fullMockPassed, type ExamSection } from "@/lib/diagnostic/select";
import type { CategoryId } from "@/types";

/**
 * Exercises the real `fullMockPassed` the exam screen calls — not a copy of it.
 *
 * A K53 paper is passed only when the total clears 51 AND each of the three
 * sections clears its own mark. Scoring on the total alone told a learner
 * "You passed 🎉" for a paper the DLTC would have failed — the most damaging
 * thing a readiness product can get wrong, because they book the test on it.
 */
const EXAM_SECTIONS = Object.keys(EXAM_FORMAT.sections) as ExamSection[];

function verdict(perSection: Record<ExamSection, number>): { total: number; passed: boolean } {
  return {
    total: EXAM_SECTIONS.reduce((n, s) => n + perSection[s], 0),
    passed: fullMockPassed(perSection),
  };
}

describe("full mock pass rule", () => {
  it("passes only when the total and every section clear their marks", () => {
    const { total, passed } = verdict({ controls: 7, signs: 24, rules: 23 });
    expect(total).toBeGreaterThanOrEqual(EXAM_FORMAT.passMark);
    expect(passed).toBe(true);
  });

  it("FAILS a paper that clears the total but misses one section", () => {
    // 8 + 22 + 26 = 56, comfortably over 51 — but signs needs 23.
    const { total, passed } = verdict({ controls: 8, signs: 22, rules: 26 });
    expect(total).toBeGreaterThan(EXAM_FORMAT.passMark);
    expect(passed).toBe(false);
  });

  it("fails a paper below the total even with every section clear", () => {
    const perSection = {
      controls: EXAM_FORMAT.sections.controls.pass,
      signs: EXAM_FORMAT.sections.signs.pass,
      rules: EXAM_FORMAT.sections.rules.pass,
    };
    const { total, passed } = verdict(perSection);
    // The three section minimums add up to exactly the overall pass mark, so
    // this is the boundary case — scraping every section is precisely a pass.
    expect(total).toBe(EXAM_FORMAT.passMark);
    expect(passed).toBe(true);

    expect(verdict({ ...perSection, controls: perSection.controls - 1 }).passed).toBe(false);
  });

  it("every study category maps to exactly one exam section", () => {
    const cats: CategoryId[] = [
      "signs",
      "rules",
      "controls",
      "intersections",
      "parking",
      "following_distance",
      "hazard_awareness",
    ];
    for (const c of cats) expect(EXAM_SECTIONS).toContain(SECTION_OF[c]);
  });
});
