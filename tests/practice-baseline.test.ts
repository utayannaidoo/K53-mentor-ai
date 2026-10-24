import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { BASELINE_ANSWERS, BASELINE_PER_SECTION, baselineStatus } from "@/lib/learning/baseline";
import type { CategoryId, QuestionAttempt } from "@/types";

/**
 * The starting check is gone, so readiness is measured from practice. The
 * rule it has to keep is the check's: evidence from every exam section, since
 * the real test is passed or failed per section.
 */

function answers(categoryId: CategoryId, n: number, selectedIndex = 0): QuestionAttempt[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${categoryId}_${i}`,
    questionId: `${categoryId}_q${i}`,
    categoryId,
    correct: true,
    selectedIndex,
    context: "practice",
    at: "2026-10-24T10:00:00.000Z",
  }));
}

const empty = { diagnostics: [], attempts: [] as QuestionAttempt[] };

describe("practice baseline", () => {
  it("is unmeasured with no answers, and says how many are needed", () => {
    const status = baselineStatus(empty);
    expect(status.measured).toBe(false);
    expect(status.remaining).toBe(BASELINE_ANSWERS);
    expect(status.missingSections).toEqual(["controls", "signs", "rules"]);
  });

  it("does not measure a learner who only practised one section", () => {
    // Twenty sign answers say nothing about controls or rules — a score from
    // them would describe a test that does not exist.
    const status = baselineStatus({ ...empty, attempts: answers("signs", 20) });
    expect(status.measured).toBe(false);
    expect(status.remaining).toBe(BASELINE_PER_SECTION * 2);
    expect(status.missingSections).toEqual(["controls", "rules"]);
  });

  it("counts every rules-section category toward the rules section", () => {
    const attempts = [
      ...answers("controls", 5),
      ...answers("signs", 5),
      ...answers("intersections", 2),
      ...answers("parking", 3),
    ];
    expect(baselineStatus({ ...empty, attempts }).measured).toBe(true);
  });

  it("needs the overall count as well as every section", () => {
    const attempts = [...answers("controls", 3), ...answers("signs", 3), ...answers("rules", 3)];
    const status = baselineStatus({ ...empty, attempts });
    expect(status.measured).toBe(false);
    expect(status.remaining).toBe(BASELINE_ANSWERS - 9);
  });

  it("ignores blank, timed-out answers", () => {
    const attempts = [
      ...answers("controls", 5, -1),
      ...answers("signs", 5),
      ...answers("rules", 5),
    ];
    expect(baselineStatus({ ...empty, attempts }).missingSections).toEqual(["controls"]);
  });

  it("keeps the measured baseline of anyone who took the old starting check", () => {
    const diagnostics = [{} as never];
    expect(baselineStatus({ diagnostics, attempts: [] }).measured).toBe(true);
  });
});

describe("onboarding has no test in it", () => {
  const wizard = readFileSync(
    path.resolve(__dirname, "../src/components/onboarding/onboarding-wizard.tsx"),
    "utf8",
  );

  it("never sends a new learner to the starting check", () => {
    expect(wizard).not.toContain('"/diagnostic"');
    expect(wizard).toContain("What do you find hardest?");
  });

  it("saves what the learner finds hardest as the plan's starting point", () => {
    expect(wizard).toContain("worryCategories: hardest");
  });
});
