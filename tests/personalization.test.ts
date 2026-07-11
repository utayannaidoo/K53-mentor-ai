import { describe, expect, it } from "vitest";
import { diagnosticPlanFor, sampleDiagnostic, easyFirst } from "@/lib/diagnostic/select";
import { generateTodayPlan, SIZE_BY_FREQUENCY } from "@/lib/plan";
import { defaultUserState } from "@/lib/store/local-store";
import type { ReadinessBreakdown } from "@/lib/diagnostic/scoring";
import type { CategoryId, Question, StudyFrequency } from "@/types";

const BASE_TOTAL = 15;

const readiness: ReadinessBreakdown = {
  readiness: 40,
  passProbability: 30,
  perCategory: {
    signs: 40,
    rules: 40,
    controls: 40,
    intersections: 40,
    parking: 40,
    following_distance: 40,
    hazard_awareness: 40,
  },
  weakCategories: [],
  strongCategories: [],
};

function planSum(plan: Record<CategoryId, number>): number {
  return Object.values(plan).reduce((s, n) => s + n, 0);
}

describe("diagnosticPlanFor — worry-seeded diagnostic", () => {
  it("keeps the total at 15 with no worries", () => {
    expect(planSum(diagnosticPlanFor())).toBe(BASE_TOTAL);
  });

  it("adds a question to each of the top-2 worry categories, total unchanged", () => {
    const plan = diagnosticPlanFor(["parking", "hazard_awareness", "rules"]);
    expect(planSum(plan)).toBe(BASE_TOTAL);
    expect(plan.parking).toBe(2); // 1 + 1
    expect(plan.hazard_awareness).toBe(3); // 2 + 1
    // third worry is ignored (top 2 only)
    expect(plan.rules).toBeLessThanOrEqual(3);
  });

  it("never drops a category to zero coverage", () => {
    const plan = diagnosticPlanFor(["signs", "rules"]);
    for (const n of Object.values(plan)) expect(n).toBeGreaterThanOrEqual(1);
    expect(planSum(plan)).toBe(BASE_TOTAL);
  });

  it("sampleDiagnostic still returns 15 questions and includes worry categories", () => {
    const qs = sampleDiagnostic([], "8", ["parking", "following_distance"]);
    expect(qs).toHaveLength(BASE_TOTAL);
    const cats = qs.map((q) => q.categoryId);
    expect(cats.filter((c) => c === "parking").length).toBeGreaterThanOrEqual(2);
    expect(cats.filter((c) => c === "following_distance").length).toBeGreaterThanOrEqual(2);
  });
});

describe("generateTodayPlan — sized by studyFrequency", () => {
  function planFor(frequency: StudyFrequency) {
    const s = defaultUserState();
    s.onboarding = {
      goal: "learners",
      vehicleCode: "8",
      testDate: null,
      driversTestDate: null,
      confidence: 3,
      worryCategories: [],
      knowledgeLevel: "some",
      studyFrequency: frequency,
      priorAttempts: 0,
      completedAt: new Date().toISOString(),
    };
    return generateTodayPlan(s, readiness);
  }

  it("casual gets a lighter session than intense", () => {
    const casualQ = planFor("casual").find((t) => t.type === "questions")!;
    const intenseQ = planFor("intense").find((t) => t.type === "questions")!;
    expect(casualQ.targetCount).toBe(SIZE_BY_FREQUENCY.casual.questions);
    expect(intenseQ.targetCount).toBe(SIZE_BY_FREQUENCY.intense.questions);
    expect(intenseQ.targetCount).toBeGreaterThan(casualQ.targetCount);
  });

  it("flashcard target respects the frequency clamp", () => {
    const casualF = planFor("casual").find((t) => t.type === "flashcards")!;
    expect(casualF.targetCount).toBeLessThanOrEqual(SIZE_BY_FREQUENCY.casual.flashMax);
    expect(casualF.targetCount).toBeGreaterThanOrEqual(SIZE_BY_FREQUENCY.casual.flashMin);
  });

  it("defaults to steady when onboarding is missing", () => {
    const s = defaultUserState();
    const q = generateTodayPlan(s, readiness).find((t) => t.type === "questions")!;
    expect(q.targetCount).toBe(SIZE_BY_FREQUENCY.steady.questions);
  });
});

describe("easyFirst", () => {
  it("orders questions easiest-first", () => {
    const mk = (id: string, difficulty: 1 | 2 | 3): Question => ({
      id,
      categoryId: "signs",
      prompt: id,
      options: ["a", "b"],
      correctIndex: 0,
      explanation: "",
      difficulty,
      scope: "learners",
    });
    const out = easyFirst([mk("hard", 3), mk("easy", 1), mk("mid", 2)]);
    expect(out.map((q) => q.id)).toEqual(["easy", "mid", "hard"]);
  });
});
