import { describe, expect, it } from "vitest";
import {
  ACUITY_LEVELS,
  CARD_WIDTH_MM,
  E_ROTATION,
  EYE_STAGES,
  LMV_PASS_INDEX,
  bestAcrossStages,
  bestPassedIndex,
  firstRenderableIndex,
  ladderBounds,
  lmvVerdict,
  minDistanceMmFor,
  minOptotypePx,
  optotypeHeightMm,
  optotypeHeightPx,
  pxPerMmFromCardWidth,
  reaches,
  stageLabel,
  stageResult,
  type StageResult,
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

const i = (label: string) => ACUITY_LEVELS.findIndex((l) => l.label === label);

/**
 * The bug this file exists to keep fixed: a reader answered every letter
 * correctly, the ladder ran out of rungs at 6/24 because the next line would
 * have been six pixels tall, and the result panel reported "6/24 — about 40%
 * visual acuity loss. Worth getting checked."
 *
 * A ladder that ends at the screen's floor has not measured an acuity. It has
 * established a lower bound and nothing else.
 */
describe("a ladder that runs out of rungs", () => {
  const perfect = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, n) => ({ index: from + n, correct: 4, asked: 4 }));

  it("reports a floor as a floor, not as a reading", () => {
    const result = stageResult(perfect(0, 2), 3, { startIndex: 0, maxIndex: 2 });
    expect(result).toEqual({ kind: "atLeast", index: 2 });
    expect(stageLabel(result)).toBe("6/24 or better");
  });

  it("reports a threshold as a reading when a line was actually failed", () => {
    const outcomes = [...perfect(0, 2), { index: 3, correct: 1, asked: 4 }];
    const result = stageResult(outcomes, 3, { startIndex: 0, maxIndex: 7 });
    expect(result).toEqual({ kind: "measured", index: 2 });
    expect(stageLabel(result)).toBe("6/24");
  });

  it("distinguishes failing the largest line from never being tested", () => {
    expect(stageResult([{ index: 0, correct: 1, asked: 4 }], 3, { startIndex: 0, maxIndex: 7 }))
      .toEqual({ kind: "belowChart", startIndex: 0 });
    expect(stageResult([], 3, { startIndex: 0, maxIndex: 7 })).toEqual({ kind: "untested" });
  });

  it("will not claim a floor above the standard settles the standard", () => {
    // The reported case, end to end: floor at 6/24, perfect reader, verdict
    // must be "cannot say" — never "below the standard".
    const floored = stageResult(perfect(0, 2), 3, { startIndex: 0, maxIndex: 2 });
    expect(reaches(floored, LMV_PASS_INDEX)).toBe("unknown");
    expect(lmvVerdict(floored, floored)).toBe("unknown");
  });

  it("does settle it once the floor is at or past 6/12", () => {
    const floored = stageResult(perfect(0, 4), 3, { startIndex: 0, maxIndex: 4 });
    expect(reaches(floored, LMV_PASS_INDEX)).toBe("yes");
    expect(lmvVerdict(floored, floored)).toBe("yes");
  });

  it("says nothing about 6/12 when the chart never got that far up either", () => {
    // A chart whose largest drawable line is already sharper than the target:
    // failing it leaves the target untested in both directions.
    const below = stageResult([{ index: i("6/9"), correct: 0, asked: 4 }], 3, {
      startIndex: i("6/9"),
      maxIndex: 7,
    });
    expect(reaches(below, LMV_PASS_INDEX)).toBe("unknown");
  });
});

/**
 * Regulation 102 of the National Road Traffic Act, for codes A1/A/B/EB: 6/12 in
 * each eye, or where one eye is under 6/12 or blind, 6/9 in the other.
 *
 * This replaced "6/12 in one eye, or both eyes together" — a looser rule that
 * passed readers the DLTC will fail, which is the one direction a screener must
 * never be wrong in.
 */
describe("the Code B pass rule", () => {
  const at = (label: string): StageResult => ({ kind: "measured", index: i(label) });

  it("passes when both eyes clear 6/12", () => {
    expect(lmvVerdict(at("6/12"), at("6/12"))).toBe("yes");
  });

  it("fails a weak eye that a 6/12 fellow eye cannot carry", () => {
    // The old rule passed this: one eye at 6/12 was enough on its own.
    expect(lmvVerdict(at("6/12"), at("6/36"))).toBe("no");
  });

  it("passes it once the fellow eye reaches 6/9", () => {
    expect(lmvVerdict(at("6/9"), at("6/36"))).toBe("yes");
    expect(lmvVerdict(at("6/36"), at("6/6"))).toBe("yes");
  });

  it("fails when neither eye reaches 6/12", () => {
    expect(lmvVerdict(at("6/18"), at("6/24"))).toBe("no");
  });

  it("ignores the binocular stage entirely", () => {
    // Two eyes at 6/18 with a good binocular reading used to pass. The
    // regulation is written per eye, so summation cannot rescue it.
    expect(lmvVerdict(at("6/18"), at("6/18"))).toBe("no");
  });

  it("cannot decide on an eye that was never tested", () => {
    expect(lmvVerdict(at("6/6"), { kind: "untested" })).toBe("unknown");
    expect(lmvVerdict({ kind: "untested" }, { kind: "untested" })).toBe("unknown");
  });

  it("still fails outright when one eye is definitively short and the other is not known to carry it", () => {
    expect(lmvVerdict(at("6/12"), { kind: "belowChart", startIndex: 0 })).toBe("no");
  });

  it("reports the best reading across the three stages", () => {
    expect(
      bestAcrossStages({ left: at("6/18"), right: at("6/6"), both: at("6/9") }),
    ).toEqual(at("6/6"));
    expect(bestAcrossStages({})).toEqual({ kind: "untested" });
  });

  it("runs the eyes in the order the DLTC does", () => {
    expect(EYE_STAGES).toEqual(["left", "right", "both"]);
  });
});

/**
 * The reason the ladder ran out at 6/24 in the first place. Paper has no
 * smallest line; a display does, and it is set by device pixels — which is why
 * the identical test at the identical distance reaches 6/5 on a phone and
 * stalls three rungs above the standard on a desktop monitor.
 */
describe("what the screen can honestly draw", () => {
  // The reporter's setup: a 320 px card outline on a ~95 dpi monitor.
  const deskPxPerMm = pxPerMmFromCardWidth(320);

  it("gives a denser screen a smaller floor, in CSS pixels", () => {
    expect(minOptotypePx(1)).toBe(10);
    expect(minOptotypePx(2)).toBe(5);
    expect(minOptotypePx(3)).toBeCloseTo(10 / 3, 6);
  });

  it("never lets a bogus device pixel ratio raise the floor", () => {
    expect(minOptotypePx(0)).toBe(10);
    expect(minOptotypePx(0.5)).toBe(10);
  });

  it("reproduces the reported ladder: 40 cm on a desktop monitor stops above 6/12", () => {
    const { maxIndex } = ladderBounds(400, deskPxPerMm, 416, minOptotypePx(1));
    expect(ACUITY_LEVELS[maxIndex].label).toBe("6/36");
    expect(maxIndex).toBeLessThan(LMV_PASS_INDEX);
  });

  it("and reaches the standard once the reader moves back", () => {
    const needed = minDistanceMmFor(12, deskPxPerMm, minOptotypePx(1));
    expect(needed / 10).toBeCloseTo(92, 0); // ~92 cm
    const { maxIndex } = ladderBounds(needed, deskPxPerMm, 416, minOptotypePx(1));
    expect(maxIndex).toBeGreaterThanOrEqual(LMV_PASS_INDEX);
  });

  it("agrees with the height it is derived from", () => {
    for (const denominator of [60, 12, 6, 5]) {
      const minPx = minOptotypePx(2);
      const distance = minDistanceMmFor(denominator, deskPxPerMm, minPx);
      expect(optotypeHeightPx(denominator, distance, deskPxPerMm)).toBeCloseTo(minPx, 6);
    }
  });

  it("needs less distance on a phone than on a monitor for the same line", () => {
    const phonePxPerMm = pxPerMmFromCardWidth(505); // ~150 CSS dpi, dpr 3
    expect(minDistanceMmFor(6, phonePxPerMm, minOptotypePx(3))).toBeLessThan(
      minDistanceMmFor(6, deskPxPerMm, minOptotypePx(1)),
    );
  });
});

describe("E orientation", () => {
  it("maps each direction to a distinct quarter turn", () => {
    expect(Object.values(E_ROTATION).sort((a, b) => a - b)).toEqual([0, 90, 180, 270]);
  });
});
