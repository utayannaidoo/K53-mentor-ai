import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EXAM_FORMAT } from "@/lib/constants";

/**
 * The marketing pages must quote the exam the app actually sits.
 *
 * They didn't. The landing page advertised a "68-question mock exam" in three
 * places, and rendered a 62/68 score in a fourth, while EXAM_FORMAT — and every
 * in-app screen — said 64. Nobody noticed because the wrong number was spelled
 * out in prose, four files away from the constant that defines it.
 *
 * The fix was to interpolate EXAM_FORMAT everywhere, so this guards the shape
 * of that fix rather than the value: a hardcoded question count in marketing
 * copy is the bug, whether or not today's build happens to agree with it.
 */

const LANDING = [
  "src/components/landing/how-it-works.tsx",
  "src/components/landing/features.tsx",
  "src/components/landing/comparison.tsx",
];

/** Counts that are genuinely their own number, not the exam's. */
const NOT_THE_EXAM = new Set([
  15, // the adaptive diagnostic, and the free tier's daily mini mock
]);

describe("landing copy states the real exam format", () => {
  it("never hardcodes a question count that EXAM_FORMAT owns", () => {
    for (const file of LANDING) {
      const source = readFileSync(path.resolve(__dirname, "..", file), "utf8");
      const hardcoded = [...source.matchAll(/(\d+)-question/g)]
        .map((m) => Number(m[1]))
        .filter((n) => !NOT_THE_EXAM.has(n));

      expect(
        hardcoded,
        `${file} spells out a question count. Interpolate EXAM_FORMAT.totalQuestions ` +
          `instead — a literal here is how the page came to advertise 68 while the app ran 64.`,
      ).toEqual([]);
    }
  });

  it("still adds up to the format the exam pages enforce", () => {
    // If this ever fails the copy is fine and the constant moved; the sections
    // are the source of truth for the total.
    const { controls, signs, rules } = EXAM_FORMAT.sections;
    expect(controls.questions + signs.questions + rules.questions).toBe(
      EXAM_FORMAT.totalQuestions,
    );
    expect(controls.pass + signs.pass + rules.pass).toBe(EXAM_FORMAT.passMark);
  });
});
