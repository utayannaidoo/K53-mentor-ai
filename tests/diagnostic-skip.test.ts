import { describe, expect, it } from "vitest";
import { hydrateAccountState } from "@/lib/store/account-hydrate";
import { defaultUserState } from "@/lib/store/local-store";
import type { DiagnosticResult, OnboardingData, UserState } from "@/types";
import type { RemoteProgress } from "@/lib/supabase/progress";

const onboarding: OnboardingData = {
  goal: "learners",
  vehicleCode: "8",
  testDate: null,
  driversTestDate: null,
  confidence: 3,
  worryCategories: [],
  knowledgeLevel: "some",
  studyFrequency: "steady",
  priorAttempts: 0,
  completedAt: "2026-09-04T08:00:00.000Z",
};

const emptyProgress: RemoteProgress = {
  attempts: [],
  scenarioAttempts: [],
  mockExams: [],
  diagnostics: [],
  cardStates: {},
  sessions: [],
  readinessHistory: [],
};

describe("diagnostic deferral hydration", () => {
  it("keeps a pre-signup skip while the new server profile is still blank", () => {
    const local: UserState = {
      ...defaultUserState(),
      onboarding,
      diagnosticSkippedAt: "2026-09-04T08:05:00.000Z",
    };

    const next = hydrateAccountState(
      local,
      { onboarding: null, diagnosticSkippedAt: null },
      emptyProgress,
      "new@example.com",
    );

    expect(next.onboarding).toEqual(onboarding);
    expect(next.diagnosticSkippedAt).toBe("2026-09-04T08:05:00.000Z");
  });

  it("restores a skip saved on another device", () => {
    const next = hydrateAccountState(
      defaultUserState(),
      {
        onboarding,
        diagnosticSkippedAt: "2026-09-03T17:00:00.000Z",
      },
      emptyProgress,
      "learner@example.com",
    );

    expect(next.diagnosticSkippedAt).toBe("2026-09-03T17:00:00.000Z");
  });

  it("clears an old skip marker when a synced diagnostic exists", () => {
    const diagnostic: DiagnosticResult = {
      id: "diag-1",
      at: "2026-09-04T09:00:00.000Z",
      readiness: 55,
      passProbability: 42,
      total: 15,
      correct: 9,
      perCategory: {},
      weakCategories: ["signs"],
      strongCategories: ["parking"],
    };
    const next = hydrateAccountState(
      {
        ...defaultUserState(),
        diagnosticSkippedAt: "2026-09-03T17:00:00.000Z",
      },
      { onboarding, diagnosticSkippedAt: null },
      { ...emptyProgress, diagnostics: [diagnostic] },
      "learner@example.com",
    );

    expect(next.diagnostics).toHaveLength(1);
    expect(next.diagnosticSkippedAt).toBeNull();
  });
});
