import { describe, expect, it } from "vitest";
import { SCENARIOS } from "@/lib/content/scenarios";
import { forCode } from "@/lib/content/vehicle";
import type { CategoryId, VehicleCode } from "@/types";

/**
 * Scenarios had no content validation at all — `content-coverage.test.ts` guards
 * questions and flashcards only. These are the equivalents, plus a balance check
 * that would have caught the imbalance this pack was written to fix: one parking
 * scenario and one signs scenario, the latter gated to motorcycles, so a code 08
 * learner met no signs scenario ever.
 */
const CODES: VehicleCode[] = ["8", "A", "14"];

describe("scenario content integrity", () => {
  it("has unique ids", () => {
    const ids = SCENARIOS.map((s) => s.id);
    const seen = new Set<string>();
    const dupes = ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
    expect(dupes).toEqual([]);
  });

  it("gives every scenario exactly one correct choice", () => {
    for (const s of SCENARIOS) {
      const correct = s.choices.filter((c) => c.correct);
      expect(correct.length, `${s.id} has ${correct.length} correct choices`).toBe(1);
    }
  });

  it("offers at least three distinct choices with unique ids", () => {
    for (const s of SCENARIOS) {
      expect(s.choices.length, s.id).toBeGreaterThanOrEqual(3);
      expect(new Set(s.choices.map((c) => c.id)).size, `${s.id} has duplicate choice ids`).toBe(
        s.choices.length,
      );
      expect(new Set(s.choices.map((c) => c.text)).size, `${s.id} repeats a choice`).toBe(
        s.choices.length,
      );
    }
  });

  it("explains the consequence of every choice, right or wrong", () => {
    // The consequence is the whole teaching value of a scenario — a wrong
    // choice that just says "wrong" teaches nothing.
    for (const s of SCENARIOS) {
      for (const c of s.choices) {
        expect(c.consequence?.trim().length, `${s.id}/${c.id} has no consequence`).toBeGreaterThan(
          20,
        );
      }
    }
  });

  it("gives every scenario a debrief", () => {
    for (const s of SCENARIOS) {
      expect(s.debrief?.trim().length, `${s.id} has no debrief`).toBeGreaterThan(20);
    }
  });

  it("points any image at a real sign asset path", () => {
    for (const s of SCENARIOS) {
      if (s.image) expect(s.image, s.id).toMatch(/^\/signs\/.+\.png$/);
    }
  });
});

describe("scenario balance", () => {
  it("gives every licence code a usable pool", () => {
    for (const code of CODES) {
      expect(forCode(SCENARIOS, code).length, `code ${code}`).toBeGreaterThanOrEqual(30);
    }
  });

  it("leaves no category empty for any licence code", () => {
    // A session serves a slice of the pool, so a category with nothing in it is
    // a category the learner will never practise.
    for (const code of CODES) {
      const pool = forCode(SCENARIOS, code);
      const counts = new Map<CategoryId, number>();
      for (const s of pool) counts.set(s.categoryId, (counts.get(s.categoryId) ?? 0) + 1);
      for (const category of ["signs", "parking", "rules", "intersections"] as CategoryId[]) {
        expect(counts.get(category) ?? 0, `code ${code} has no ${category} scenarios`).toBeGreaterThan(
          0,
        );
      }
    }
  });
});
