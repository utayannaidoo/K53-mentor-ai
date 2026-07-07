import { describe, expect, it } from "vitest";
import {
  RANKS,
  LICENCE_RANK_INDEX,
  computeRankIndex,
  flashcardCp,
  isFirstCorrect,
  questionCp,
} from "@/lib/engagement";
import { initialCardState } from "@/lib/srs/sm2";
import { QUESTIONS } from "@/lib/content/questions";

describe("questionCp", () => {
  it("awards nothing for a wrong answer", () => {
    expect(questionCp(QUESTIONS[0].id, false, true)).toBe(0);
  });

  it("doubles the difficulty-weighted base on the first correct", () => {
    const q = QUESTIONS.find((x) => x.difficulty === 2)!;
    expect(questionCp(q.id, true, false)).toBe(4);
    expect(questionCp(q.id, true, true)).toBe(8);
  });

  it("falls back to difficulty 1 for unknown ids", () => {
    expect(questionCp("nope", true, false)).toBe(2);
  });
});

describe("isFirstCorrect", () => {
  it("is true only when no prior correct attempt exists", () => {
    const history = [
      { questionId: "a", correct: false },
      { questionId: "b", correct: true },
    ];
    expect(isFirstCorrect(history, "a")).toBe(true);
    expect(isFirstCorrect(history, "b")).toBe(false);
    expect(isFirstCorrect(history, "c")).toBe(true);
  });
});

describe("flashcardCp", () => {
  it("scales with the card's proven interval", () => {
    const fresh = initialCardState("c1");
    expect(flashcardCp(fresh, "again")).toBe(0);
    expect(flashcardCp(fresh, "hard")).toBe(1);
    expect(flashcardCp(fresh, "good")).toBe(2);
    expect(flashcardCp({ ...fresh, intervalDays: 7 }, "good")).toBe(4);
    expect(flashcardCp({ ...fresh, intervalDays: 30 }, "good")).toBe(6);
  });
});

describe("computeRankIndex", () => {
  it("starts in the Garage", () => {
    expect(computeRankIndex({ cp: 0, readiness: 0, hasPassedMock: false })).toBe(0);
  });

  it("promotes on CP alone for early ranks", () => {
    expect(computeRankIndex({ cp: 200, readiness: 0, hasPassedMock: false })).toBe(1);
  });

  it("gates later ranks on readiness and a passed mock", () => {
    // Plenty of CP but weak readiness: stuck at Learner Driver.
    expect(computeRankIndex({ cp: 5000, readiness: 20, hasPassedMock: false })).toBe(1);
    // Test-Day Ready needs the passed mock.
    const noMock = computeRankIndex({ cp: 5000, readiness: 90, hasPassedMock: false });
    const withMock = computeRankIndex({ cp: 5000, readiness: 90, hasPassedMock: true });
    expect(withMock).toBeGreaterThan(noMock);
  });

  it("never returns the reserved Licence Achieved rank", () => {
    const idx = computeRankIndex({ cp: 999999, readiness: 100, hasPassedMock: true });
    expect(idx).toBeLessThan(LICENCE_RANK_INDEX);
    expect(idx).toBe(RANKS.length - 2);
  });
});
