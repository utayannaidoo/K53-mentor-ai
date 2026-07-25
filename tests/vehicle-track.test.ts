import { describe, expect, it } from "vitest";
import { studyCodeFor, studyCodeOf, defaultCodeForClass } from "@/lib/billing/plans";
import { hydrateAccountState } from "@/lib/store/account-hydrate";
import { defaultUserState } from "@/lib/store/local-store";
import { QUESTIONS } from "@/lib/content/questions";
import { FLASHCARDS } from "@/lib/content/flashcards";
import { SCENARIOS } from "@/lib/content/scenarios";
import { forCode, sameGroup } from "@/lib/content/vehicle";
import { selectFlashcardQueue } from "@/lib/plan";
import { sampleDiagnostic, sampleMockExam, sampleMiniMock } from "@/lib/diagnostic/select";
import type { RemoteProgress } from "@/lib/supabase/progress";
import type { OnboardingData, UserState, VehicleCode } from "@/types";

/**
 * A Car subscriber must never be served motorcycle or heavy content, and a
 * Bike & Heavy subscriber must never be served car-only content — no matter
 * what the locally cached profile says. The licence code is client-owned data
 * (localStorage, shared across accounts on one device, written back by the
 * client); the paid track is server truth. These lock in that the track wins.
 */

const emptyRemote: RemoteProgress = {
  attempts: [],
  scenarioAttempts: [],
  mockExams: [],
  diagnostics: [],
  cardStates: {},
  readinessHistory: [],
};

function onboardingWith(code: VehicleCode): OnboardingData {
  return {
    goal: "learners",
    vehicleCode: code,
    testDate: null,
    driversTestDate: null,
    confidence: 3,
    worryCategories: [],
    knowledgeLevel: "some",
    studyFrequency: "steady",
    priorAttempts: 0,
    completedAt: "2026-07-01T10:00:00Z",
  };
}

describe("studyCodeFor — the paid track outranks the stored code", () => {
  it("clamps a motorcycle code to Code 8 for a Car subscriber", () => {
    expect(studyCodeFor("premium_plus", "car", "A")).toBe("8");
    expect(studyCodeFor("premium_plus", "car", "A1")).toBe("8");
    expect(studyCodeFor("premium", "car", "14")).toBe("8");
  });

  it("clamps a car code to A for a Bike & Heavy subscriber", () => {
    expect(studyCodeFor("premium", "bike_heavy", "8")).toBe("A");
  });

  it("keeps a code that already sits inside the paid track", () => {
    expect(studyCodeFor("premium_plus", "car", "8")).toBe("8");
    expect(studyCodeFor("premium_plus", "bike_heavy", "14")).toBe("14");
    expect(studyCodeFor("premium_plus", "bike_heavy", "A1")).toBe("A1");
  });

  it("never returns undefined — an unknown code narrows, it does not open up", () => {
    // This is the regression that mattered most: `undefined` used to mean
    // "show everything", so the full bank (bike + heavy included) leaked out
    // during the window before the account hydrated.
    expect(studyCodeFor("premium_plus", "car", undefined)).toBe("8");
    expect(studyCodeFor("premium_plus", "bike_heavy", undefined)).toBe("A");
    expect(studyCodeFor("free", null, undefined)).toBe("8");
  });

  it("leaves a free learner's own choice alone — no track was bought", () => {
    expect(studyCodeFor("free", null, "A")).toBe("A");
    expect(studyCodeFor("free", null, "14")).toBe("14");
  });

  it("falls back to the stored code when a paid sub has no track on record", () => {
    // Pre-0017 subscriptions have track = null; behaviour is unchanged for
    // them until the webhook backfills it on the next charge.
    expect(studyCodeFor("premium", null, "A")).toBe("A");
  });

  it("defaultCodeForClass matches the tracks", () => {
    expect(defaultCodeForClass("car")).toBe("8");
    expect(defaultCodeForClass("bike_heavy")).toBe("A");
  });
});

describe("content served to a Car subscriber holding a stale bike code", () => {
  const state: UserState = {
    ...defaultUserState(),
    tier: "premium_plus",
    vehicleClass: "car", // server truth: they pay for the Car track
    onboarding: onboardingWith("A"), // stale/leaked code from another account
  };

  const isBikeOrHeavy = (codes?: VehicleCode[]) =>
    Boolean(codes?.length) && !codes!.some((c) => sameGroup(c, "8"));

  it("resolves to Code 8", () => {
    expect(studyCodeOf(state)).toBe("8");
  });

  it("serves no motorcycle- or heavy-only questions", () => {
    const pool = forCode(QUESTIONS, studyCodeOf(state));
    expect(pool.filter((q) => isBikeOrHeavy(q.codes))).toEqual([]);
    expect(pool.length).toBeGreaterThan(0);
  });

  it("serves no motorcycle- or heavy-only flashcards or scenarios", () => {
    expect(
      selectFlashcardQueue(state).filter((f) => isBikeOrHeavy(f.codes)),
    ).toEqual([]);
    expect(
      forCode(SCENARIOS, studyCodeOf(state)).filter((s) => isBikeOrHeavy(s.codes)),
    ).toEqual([]);
    expect(forCode(FLASHCARDS, studyCodeOf(state)).length).toBeGreaterThan(0);
  });

  it("builds diagnostics and mocks from car content only", () => {
    const code = studyCodeOf(state);
    for (const paper of [
      sampleDiagnostic([], code),
      sampleMockExam([], code),
      sampleMiniMock([], code),
    ]) {
      expect(paper.length).toBeGreaterThan(0);
      expect(paper.filter((q) => isBikeOrHeavy(q.codes))).toEqual([]);
    }
  });
});

describe("hydrateAccountState — the track comes from the server", () => {
  it("repairs a stored code that contradicts the paid track", () => {
    const local: UserState = {
      ...defaultUserState(),
      ownerEmail: "car@example.com",
      onboarding: onboardingWith("A"),
    };
    const next = hydrateAccountState(
      local,
      { tier: "premium_plus", vehicleClass: "car", onboarding: onboardingWith("A") },
      emptyRemote,
      "car@example.com",
    );
    expect(next.vehicleClass).toBe("car");
    expect(next.onboarding?.vehicleCode).toBe("8");
  });

  it("keeps a code that already agrees with the track", () => {
    const next = hydrateAccountState(
      defaultUserState(),
      { tier: "premium", vehicleClass: "bike_heavy", onboarding: onboardingWith("14") },
      emptyRemote,
      "bike@example.com",
    );
    expect(next.onboarding?.vehicleCode).toBe("14");
  });

  it("does not touch a free learner's code", () => {
    const next = hydrateAccountState(
      defaultUserState(),
      { tier: "free", vehicleClass: null, onboarding: onboardingWith("A") },
      emptyRemote,
      "free@example.com",
    );
    expect(next.onboarding?.vehicleCode).toBe("A");
  });

  it("a null server track keeps the local one instead of clearing it", () => {
    const local: UserState = {
      ...defaultUserState(),
      ownerEmail: "legacy@example.com",
      vehicleClass: "car",
    };
    const next = hydrateAccountState(
      local,
      { tier: "premium", vehicleClass: null },
      emptyRemote,
      "legacy@example.com",
    );
    expect(next.vehicleClass).toBe("car");
  });

  it("a different account does not inherit the previous track", () => {
    const bikeLocal: UserState = {
      ...defaultUserState(),
      ownerEmail: "bike@example.com",
      tier: "premium_plus",
      vehicleClass: "bike_heavy",
      onboarding: onboardingWith("A"),
    };
    const next = hydrateAccountState(
      bikeLocal,
      { tier: "premium_plus", vehicleClass: "car", onboarding: onboardingWith("8") },
      emptyRemote,
      "car@example.com",
    );
    expect(next.vehicleClass).toBe("car");
    expect(studyCodeOf(next)).toBe("8");
  });
});
