import { describe, expect, it } from "vitest";
import {
  dominantCategory,
  nextStepAfterFlashcards,
  nextStepAfterMini,
  nextStepAfterMock,
  nextStepAfterQuestions,
} from "@/lib/learning/next-step";

/**
 * Session endings used to dead-end: every session — however lopsided its
 * misses — offered the same "again" and "back" buttons. These rules turn the
 * evidence the session just produced into one honest next action.
 */

describe("dominantCategory", () => {
  it("returns nothing below the dominance floor", () => {
    expect(dominantCategory({ signs: 1 })).toBeNull();
    expect(dominantCategory({})).toBeNull();
  });

  it("crowns the category with the most misses", () => {
    expect(dominantCategory({ signs: 3, rules: 1 })).toBe("signs");
  });

  it("refuses to crown a tie", () => {
    // Equal counts mean no category dominates; picking either would be noise.
    expect(dominantCategory({ signs: 2, rules: 2 })).toBeNull();
  });
});

describe("nextStepAfterQuestions", () => {
  it("drills the category that dominated the misses", () => {
    const step = nextStepAfterQuestions({
      wrongByCategory: { signs: 3, controls: 1 },
      mockRetestDue: false,
    });
    expect(step?.href).toBe("/study/questions?category=signs");
    expect(step?.body).toContain("3 of your 4 misses");
  });

  it("names a single miss without a share sentence", () => {
    const step = nextStepAfterQuestions({
      wrongByCategory: { signs: 2 },
      mockRetestDue: false,
    });
    expect(step?.body).not.toContain("of your");
  });

  it("suggests a stale-predictor re-test when the session was clean", () => {
    const step = nextStepAfterQuestions({ wrongByCategory: {}, mockRetestDue: true });
    expect(step?.href).toBe("/study/mock-exam?mode=mini");
  });

  it("prefers the dominant miss over the re-test nudge", () => {
    const step = nextStepAfterQuestions({
      wrongByCategory: { parking: 2 },
      mockRetestDue: true,
    });
    expect(step?.href).toContain("category=parking");
  });

  it("recommends nothing when there is nothing to act on", () => {
    expect(
      nextStepAfterQuestions({ wrongByCategory: { rules: 1 }, mockRetestDue: false }),
    ).toBeNull();
  });
});

describe("nextStepAfterFlashcards", () => {
  it("routes a cluster of Again ratings at category practice", () => {
    const step = nextStepAfterFlashcards({ againByCategory: { following_distance: 2 } });
    expect(step?.href).toBe("/study/questions?category=following_distance");
    expect(step?.title).toContain("Practise");
  });

  it("stays quiet when recall mostly held", () => {
    expect(nextStepAfterFlashcards({ againByCategory: { rules: 1 } })).toBeNull();
  });
});

describe("nextStepAfterMock", () => {
  it("prescribes a drill for the section furthest under its mark", () => {
    const step = nextStepAfterMock({
      failedSections: [
        { section: "signs", correct: 10, total: 28 },
        { section: "rules", correct: 7, total: 8 },
      ],
      drillsLeft: 1,
      weakestCategoryId: "signs",
    });
    expect(step).toMatchObject({
      href: "/study/mock-exam?mode=drill&section=signs",
    });
  });

  it("falls back to category practice once drills are spent", () => {
    // The loop must not run into a paywall mid-remediation.
    const step = nextStepAfterMock({
      failedSections: [{ section: "controls", correct: 3, total: 8 }],
      drillsLeft: 0,
      weakestCategoryId: "controls",
    });
    expect(step?.href).toBe("/study/questions?category=controls");
  });

  it("recommends nothing after a passed paper", () => {
    expect(nextStepAfterMock({ failedSections: [], drillsLeft: 5, weakestCategoryId: null })).toBeNull();
  });

  it("still answers with practice even without a measurable category", () => {
    const step = nextStepAfterMock({
      failedSections: [{ section: "rules", correct: 2, total: 8 }],
      drillsLeft: 0,
      weakestCategoryId: null,
    });
    expect(step).toBeNull();
  });
});

describe("nextStepAfterMini", () => {
  it("prescribes nothing after a passed mini", () => {
    expect(
      nextStepAfterMini({
        passed: true,
        perCategory: { signs: { correct: 4, total: 5, score: 80 } },
      }),
    ).toBeNull();
  });

  it("aims a failed mini at its lowest-scoring category", () => {
    const step = nextStepAfterMini({
      passed: false,
      perCategory: {
        signs: { correct: 4, total: 5, score: 80 },
        rules: { correct: 1, total: 4, score: 25 },
      },
    });
    expect(step?.href).toBe("/study/questions?category=rules");
    expect(step?.body).toContain("(1/4)");
  });

  it("breaks score ties deterministically", () => {
    // Equal scores: the first measured category wins rather than an arbitrary pick.
    const step = nextStepAfterMini({
      passed: false,
      perCategory: {
        parking: { correct: 2, total: 4, score: 50 },
        signs: { correct: 3, total: 6, score: 50 },
      },
    });
    expect(["/study/questions?category=parking", "/study/questions?category=signs"]).toContain(
      step?.href,
    );
  });

  it("stays quiet without measurable categories", () => {
    expect(nextStepAfterMini({ passed: false, perCategory: {} })).toBeNull();
  });
});
