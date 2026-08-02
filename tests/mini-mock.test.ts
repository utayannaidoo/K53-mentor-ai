import { describe, expect, it } from "vitest";
import {
  MINI_MOCK,
  MINI_MOCK_LENGTHS,
  miniMockConfig,
  sampleMiniMock,
} from "@/lib/diagnostic/select";
import { EXAM_FORMAT } from "@/lib/constants";
import { QUESTIONS } from "@/lib/content/questions";
import type { CategoryId } from "@/types";

const POOL = QUESTIONS;

describe("miniMockConfig", () => {
  it("keeps every length at the real test's pass ratio", () => {
    // The point of a mini is that clearing it means something. A length whose
    // pass mark drifts easier than the real paper's is just a participation
    // trophy — 51/64 is 79.7%, so each mini rounds up from 80%.
    const realRatio = EXAM_FORMAT.passMark / EXAM_FORMAT.totalQuestions;
    for (const { total } of MINI_MOCK_LENGTHS) {
      const cfg = miniMockConfig(total);
      expect(cfg.passMark / cfg.total).toBeGreaterThanOrEqual(realRatio);
      expect(cfg.passMark).toBeLessThanOrEqual(cfg.total);
    }
  });

  it("scales the clock with the paper", () => {
    const short = miniMockConfig(5);
    const long = miniMockConfig(20);
    expect(long.seconds).toBeGreaterThan(short.seconds);
    expect(long.seconds / long.total).toBe(short.seconds / short.total);
  });

  it("the default mini is still the 15-question one every surface quotes", () => {
    expect(MINI_MOCK.total).toBe(15);
    expect(MINI_MOCK).toEqual(miniMockConfig(15));
    expect(MINI_MOCK_LENGTHS.some((l) => l.total === 15)).toBe(true);
  });

  it("offers lengths in ascending order, each labelled by intent", () => {
    const totals = MINI_MOCK_LENGTHS.map((l) => l.total);
    expect([...totals].sort((a, b) => a - b)).toEqual([...totals]);
    for (const l of MINI_MOCK_LENGTHS) {
      expect(l.label.length).toBeGreaterThan(0);
      expect(l.blurb.length).toBeGreaterThan(0);
    }
  });
});

describe("sampleMiniMock", () => {
  it("returns exactly the requested number of questions", () => {
    for (const { total } of MINI_MOCK_LENGTHS) {
      expect(sampleMiniMock(POOL, [], "8", [], total)).toHaveLength(total);
    }
  });

  it("defaults to the standard length when none is given", () => {
    expect(sampleMiniMock(POOL, [], "8", [])).toHaveLength(MINI_MOCK.total);
  });

  it("keeps the weak-area tilt proportional at every length", () => {
    // ~60% weak-area at 5 questions and at 20 — a fixed count would make the
    // short check entirely weak-area and the long run barely tilted at all.
    const weak: CategoryId[] = ["signs"];
    for (const total of [5, 20]) {
      const picked = sampleMiniMock(POOL, [], "8", weak, total);
      const weakCount = picked.filter((q) => q.categoryId === "signs").length;
      expect(weakCount).toBeGreaterThanOrEqual(Math.floor(total * 0.5));
    }
  });

  it("never repeats a question inside one paper", () => {
    const picked = sampleMiniMock(POOL, [], "8", ["signs"], 20);
    expect(new Set(picked.map((q) => q.id)).size).toBe(picked.length);
  });
});
