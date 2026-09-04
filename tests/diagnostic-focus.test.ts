import { describe, expect, it } from "vitest";
import type { DiagnosticResult } from "@/types";
import { diagnosticFocusCategories } from "@/lib/diagnostic/focus";

function result(scores: Record<string, number>): DiagnosticResult {
  return {
    id: "diagnostic_focus",
    at: "2026-09-04T10:00:00.000Z",
    readiness: 20,
    passProbability: 0,
    total: 15,
    correct: 3,
    perCategory: Object.fromEntries(
      Object.entries(scores).map(([categoryId, score]) => [categoryId, { correct: 0, total: 2, score }]),
    ),
    weakCategories: ["signs", "rules", "controls"],
    strongCategories: [],
  } as DiagnosticResult;
}

describe("diagnostic result focus", () => {
  it("shows every tied low area rather than cutting the third one off", () => {
    expect(
      diagnosticFocusCategories(
        result({
          signs: 0,
          rules: 0,
          controls: 0,
          intersections: 55,
          parking: 80,
        }),
      ),
    ).toEqual(["signs", "rules", "controls"]);
  });

  it("does not invent a score for a category the check did not return", () => {
    expect(diagnosticFocusCategories(result({ signs: 0, rules: 30, controls: 50 }))).toEqual([
      "signs",
      "rules",
      "controls",
    ]);
  });
});
