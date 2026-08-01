import { describe, expect, it } from "vitest";
import { passProbabilityFromSections, blockingSection } from "@/lib/diagnostic/scoring";
import { CATEGORIES } from "@/lib/content/categories";
import { SECTION_OF } from "@/lib/constants";
import type { CategoryId } from "@/types";

/** Per-category scores, defaulting every unlisted category to `base`. */
function scores(base: number, overrides: Partial<Record<CategoryId, number>> = {}) {
  const out = {} as Record<CategoryId, number>;
  for (const c of CATEGORIES) out[c.id] = overrides[c.id] ?? base;
  return out;
}

describe("pass probability is section-aware", () => {
  it("is brutal about one weak section, however good the rest is", () => {
    // The exact shape the live mock exposed: perfect controls and rules, 68% on
    // signs. The old readiness-average model said 94% — printed above a panel
    // explaining the paper would have been a fail.
    const p = passProbabilityFromSections(scores(100, { signs: 68 }));
    expect(p).toBeLessThan(25);
  });

  it("a strong learner with no weak section is still given real confidence", () => {
    expect(passProbabilityFromSections(scores(95))).toBeGreaterThan(80);
  });

  it("sits near a coin flip when every section is scraping its own mark", () => {
    // Signs needs 23/28 (82%), rules 22/28 (79%), controls 6/8 (75%).
    const p = passProbabilityFromSections(scores(82));
    expect(p).toBeGreaterThan(15);
    expect(p).toBeLessThan(70);
  });

  it("rises monotonically with competence", () => {
    const ladder = [40, 60, 75, 85, 95].map((n) => passProbabilityFromSections(scores(n)));
    for (let i = 1; i < ladder.length; i++) {
      expect(ladder[i]).toBeGreaterThanOrEqual(ladder[i - 1]);
    }
  });

  it("a beginner is not told they might pass", () => {
    expect(passProbabilityFromSections(scores(18))).toBeLessThan(5);
  });

  it("stays inside 0–100 at the extremes", () => {
    expect(passProbabilityFromSections(scores(0))).toBe(0);
    expect(passProbabilityFromSections(scores(100))).toBe(100);
  });

  it("weighs the signs section on its own categories, not the overall average", () => {
    // Only `signs` maps to the signs section, so dragging any rules-side
    // category must not rescue a weak signs score.
    const signsOnly = CATEGORIES.filter((c) => SECTION_OF[c.id] === "signs").map((c) => c.id);
    expect(signsOnly).toEqual(["signs"]);

    const weakSigns = passProbabilityFromSections(scores(100, { signs: 55 }));
    const weakParking = passProbabilityFromSections(scores(100, { parking: 55 }));
    // Parking is one of five categories feeding the rules section, so the same
    // dip there barely moves the paper; on signs it is decisive.
    expect(weakSigns).toBeLessThan(weakParking);
  });
});

describe("blockingSection", () => {
  it("names the section standing between the learner and a pass", () => {
    expect(blockingSection(scores(100, { signs: 68 }))).toBe("signs");
  });

  it("is silent when every section clears its own mark", () => {
    expect(blockingSection(scores(95))).toBeNull();
  });

  it("picks the section furthest below its mark, not just any one below", () => {
    // Controls needs 75%, signs 82%. At 70 each, signs is further short.
    expect(blockingSection(scores(100, { controls: 70, signs: 70 }))).toBe("signs");
  });

  it("reads the rules section from all five of its categories", () => {
    // Parking alone can't sink rules; it is one of five contributors.
    expect(blockingSection(scores(100, { parking: 60 }))).toBeNull();
    expect(blockingSection(scores(60, { signs: 100, controls: 100 }))).toBe("rules");
  });
});
