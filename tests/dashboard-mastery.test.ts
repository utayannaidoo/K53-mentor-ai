import { describe, expect, it } from "vitest";
import { categoryMastery } from "@/lib/dashboard/mastery";
import { CATEGORIES } from "@/lib/content/categories";
import { EXAM_FORMAT, SECTION_OF } from "@/lib/constants";
import type { CategoryId } from "@/types";

/**
 * The mastery rail's whole claim is that a percentage means different things in
 * different categories, because each exam section carries its own minimum. If
 * `required` ever stops tracking EXAM_FORMAT, every bar on the dashboard is
 * quietly measuring against the wrong line.
 */

const flat = (v: number) =>
  Object.fromEntries(CATEGORIES.map((c) => [c.id, v])) as Record<CategoryId, number>;

describe("category mastery", () => {
  it("covers every category exactly once", () => {
    const rows = categoryMastery(flat(50));
    expect(rows).toHaveLength(CATEGORIES.length);
    expect(new Set(rows.map((r) => r.id)).size).toBe(CATEGORIES.length);
  });

  it("takes each category's mark from its own exam section", () => {
    for (const row of categoryMastery(flat(50))) {
      const { questions, pass } = EXAM_FORMAT.sections[SECTION_OF[row.id]];
      expect(row.required, row.id).toBe(Math.round((pass / questions) * 100));
      expect(row.section, row.id).toBe(SECTION_OF[row.id]);
    }
  });

  it("reads the same score as clearing in one section and short in another", () => {
    // The reason the rail exists. Signs needs 23/28 (82%), rules 22/28 (79%),
    // so a flat 80% is a fail on one and a pass on the other.
    const rows = categoryMastery(flat(80));
    const signs = rows.find((r) => r.id === "signs")!;
    const rules = rows.find((r) => r.id === "rules")!;
    expect(signs.required).toBeGreaterThan(rules.required);
    expect(signs.clearing).toBe(false);
    expect(rules.clearing).toBe(true);
  });

  it("ranks weakest first, so the rail opens on what to study", () => {
    const scores = { ...flat(70), signs: 20, rules: 95 } as Record<CategoryId, number>;
    const rows = categoryMastery(scores);
    expect(rows[0].id).toBe("signs");
    expect(rows[rows.length - 1].id).toBe("rules");
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].value).toBeGreaterThanOrEqual(rows[i - 1].value);
    }
  });

  it("treats exactly meeting the mark as clearing it", () => {
    const signsRequired = categoryMastery(flat(0)).find((r) => r.id === "signs")!.required;
    const rows = categoryMastery({ ...flat(0), signs: signsRequired } as Record<CategoryId, number>);
    expect(rows.find((r) => r.id === "signs")!.clearing).toBe(true);
  });
});
