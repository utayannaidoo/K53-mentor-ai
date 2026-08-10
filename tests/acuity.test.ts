import { describe, expect, it } from "vitest";
import {
  ACUITY_LEVELS,
  CARD_WIDTH_MM,
  E_ROTATION,
  EYE_STAGES,
  LMV_PASS_INDEX,
  bestAcrossStages,
  bestPassedIndex,
  meetsLmvStandard,
  firstRenderableIndex,
  optotypeHeightMm,
  optotypeHeightPx,
  pxPerMmFromCardWidth,
} from "@/lib/vision/acuity";

/**
 * The eye-test sizes are the whole feature: if the geometry is wrong the app
 * confidently reports an acuity the learner does not have. These pin the
 * maths against values that can be checked by hand.
 */
describe("optotype geometry", () => {
  it("makes a 6/6 letter subtend 5 arcminutes", () => {
    // At 6 m, 5 arcmin ≈ 8.73 mm — the standard Snellen 6/6 letter height.
    expect(optotypeHeightMm(6, 6000)).toBeCloseTo(8.73, 2);
  });

  it("scales with the Snellen denominator", () => {
    // Not exactly linear — the height comes from tan(θ/2), which only
    // approximates θ at small angles. Doubling the denominator therefore
    // slightly more than doubles the height, and that is the correct optics.
    const six = optotypeHeightMm(6, 400);
    const twelve = optotypeHeightMm(12, 400);
    expect(twelve / six).toBeCloseTo(2, 4);
    expect(twelve / six).toBeGreaterThan(2);
  });

  it("scales linearly with viewing distance", () => {
    expect(optotypeHeightMm(6, 800) / optotypeHeightMm(6, 400)).toBeCloseTo(2, 6);
  });

  it("orders the ladder largest-first, as the manual's chart reads", () => {
    const denominators = ACUITY_LEVELS.map((l) => l.denominator);
    expect(denominators).toEqual([...denominators].sort((a, b) => b - a));
  });

  it("puts the Code B threshold at 6/12", () => {
    expect(ACUITY_LEVELS[LMV_PASS_INDEX].label).toBe("6/12");
  });
});

describe("screen calibration", () => {
  it("derives px per mm from a card sized on screen", () => {
    expect(pxPerMmFromCardWidth(CARD_WIDTH_MM * 3)).toBeCloseTo(3, 6);
  });

  it("skips lines that cannot fit on screen", () => {
    // 40 cm away on a small phone: 6/60 is ~58 mm tall and will not fit in a
    // 200 px box, so the test must start further down the chart.
    const pxPerMm = 4;
    const start = firstRenderableIndex(400, pxPerMm, 200);
    expect(optotypeHeightPx(ACUITY_LEVELS[start].denominator, 400, pxPerMm)).toBeLessThanOrEqual(200);
    if (start > 0) {
      expect(
        optotypeHeightPx(ACUITY_LEVELS[start - 1].denominator, 400, pxPerMm),
      ).toBeGreaterThan(200);
    }
  });

  it("falls back to the smallest line rather than crashing on a tiny box", () => {
    expect(firstRenderableIndex(400, 4, 1)).toBe(ACUITY_LEVELS.length - 1);
  });
});

describe("scoring", () => {
  const required = 3;

  it("reports the deepest level actually passed", () => {
    const outcomes = [
      { index: 0, correct: 4, asked: 4 },
      { index: 1, correct: 3, asked: 4 },
      { index: 2, correct: 1, asked: 4 },
    ];
    expect(bestPassedIndex(outcomes, required)).toBe(1);
  });

  it("returns null when even the first line failed", () => {
    expect(bestPassedIndex([{ index: 0, correct: 1, asked: 4 }], required)).toBeNull();
  });

  it("does not promote a lucky guesser", () => {
    // 2 of 4 is above chance but below the line; it must not count as a pass.
    expect(bestPassedIndex([{ index: 3, correct: 2, asked: 4 }], required)).toBeNull();
  });
});

/**
 * The DLTC tests each eye alone and then both together, and the standard is
 * "6/12 or better in one eye, **or** both eyes together". That disjunction is
 * the whole point — someone with one weak eye still passes on the strong one,
 * and reporting only a binocular figure would hide the weak eye entirely.
 */
describe("per-eye pass rule", () => {
  const i = (label: string) => ACUITY_LEVELS.findIndex((l) => l.label === label);

  it("passes on one strong eye even when the other is poor", () => {
    expect(meetsLmvStandard({ left: i("6/60"), right: i("6/9"), both: i("6/12") })).toBe(true);
  });

  it("passes on the binocular reading when neither eye alone reaches it", () => {
    expect(meetsLmvStandard({ left: i("6/18"), right: i("6/18"), both: i("6/12") })).toBe(true);
  });

  it("fails when nothing reaches 6/12", () => {
    expect(meetsLmvStandard({ left: i("6/18"), right: i("6/24"), both: i("6/18") })).toBe(false);
  });

  it("treats 6/12 exactly as a pass, not a near miss", () => {
    expect(meetsLmvStandard({ left: i("6/12"), right: null, both: null })).toBe(true);
  });

  it("ignores stages that were never completed", () => {
    expect(meetsLmvStandard({ left: null, right: null, both: null })).toBe(false);
    expect(meetsLmvStandard({})).toBe(false);
  });

  it("reports the best reading across the three stages", () => {
    expect(bestAcrossStages({ left: i("6/18"), right: i("6/6"), both: i("6/9") })).toBe(i("6/6"));
    expect(bestAcrossStages({ left: null, right: null, both: null })).toBeNull();
  });

  it("runs the eyes in the order the DLTC does", () => {
    expect(EYE_STAGES).toEqual(["left", "right", "both"]);
  });
});

describe("E orientation", () => {
  it("maps each direction to a distinct quarter turn", () => {
    expect(Object.values(E_ROTATION).sort((a, b) => a - b)).toEqual([0, 90, 180, 270]);
  });
});
