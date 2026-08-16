import { describe, expect, it } from "vitest";
import { EXAM_FORMAT } from "@/lib/constants";
import { scoreTone, thresholdTone } from "@/lib/score";
import type { ExamSection } from "@/lib/diagnostic/select";

/**
 * The pass-mark bar on the mock results screen colours itself against the
 * section's real threshold, not the general 45/70 competence bands.
 *
 * A learner reads that colour to decide whether they are ready to book. Green
 * on a section they actually failed is the one error that costs them a test fee,
 * so these cases are pinned to the real EXAM_FORMAT marks rather than literals.
 */
const SECTIONS = Object.keys(EXAM_FORMAT.sections) as ExamSection[];

function pct(correct: number, total: number) {
  return (correct / total) * 100;
}

describe("threshold tone", () => {
  it("goes green only at or above the pass mark", () => {
    expect(thresholdTone(82, 82)).toBe("success");
    expect(thresholdTone(81.9, 82)).toBe("warning");
    expect(thresholdTone(100, 82)).toBe("success");
    expect(thresholdTone(0, 82)).toBe("warning");
  });

  it("never paints a failing section green, on any real section mark", () => {
    for (const section of SECTIONS) {
      const { questions, pass } = EXAM_FORMAT.sections[section];
      const mark = pct(pass, questions);
      // One short of the pass mark must read as a fail, every time.
      expect(thresholdTone(pct(pass - 1, questions), mark)).toBe("warning");
      expect(thresholdTone(pct(pass, questions), mark)).toBe("success");
    }
  });

  it("catches the case the plain competence bands get wrong", () => {
    // Road signs: 22 of 28 is 78.6% — comfortably "success" on the 45/70 bands,
    // and one mark short of the 23 the DLTC requires.
    const { questions, pass } = EXAM_FORMAT.sections.signs;
    const oneShort = pct(pass - 1, questions);
    expect(scoreTone(oneShort)).toBe("success");
    expect(thresholdTone(oneShort, pct(pass, questions))).toBe("warning");
  });
});
