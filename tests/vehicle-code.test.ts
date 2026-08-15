import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { studyCodeOf, SELECTABLE_CODES } from "@/lib/billing/plans";
import { hydrateAccountState } from "@/lib/store/account-hydrate";
import { defaultUserState, loadState, saveState, STORAGE_KEY } from "@/lib/store/local-store";
import { QUESTIONS } from "@/lib/content/questions";
import { FLASHCARDS } from "@/lib/content/flashcards";
import { SCENARIOS } from "@/lib/content/scenarios";
import { forCode, sameGroup } from "@/lib/content/vehicle";
import { selectFlashcardQueue } from "@/lib/plan.queue";
import { sampleDiagnostic, sampleMockExam, sampleMiniMock } from "@/lib/diagnostic/select";
import type { RemoteProgress } from "@/lib/supabase/progress";
import type { OnboardingData, SubscriptionTier, UserState, VehicleCode } from "@/types";

/**
 * The learner's licence code is theirs: they pick it at onboarding, they can
 * change it in their account, and NOTHING else may move it — not their plan,
 * not a sign-in, not another account's leftovers on the same device. These
 * lock that down, because the drift is invisible until someone is already deep
 * into the wrong vehicle's content.
 */

const emptyRemote: RemoteProgress = {
  attempts: [],
  scenarioAttempts: [],
  mockExams: [],
  diagnostics: [],
  cardStates: {},
  sessions: [],
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

const ALL_TIERS: SubscriptionTier[] = ["free", "premium", "premium_plus"];

describe("studyCodeOf — the learner's choice, and nothing else", () => {
  it("returns exactly the chosen code on every tier", () => {
    for (const code of SELECTABLE_CODES) {
      for (const tier of ALL_TIERS) {
        const state = { ...defaultUserState(), tier, onboarding: onboardingWith(code) };
        expect(studyCodeOf(state), `${tier} / ${code}`).toBe(code);
      }
    }
  });

  it("never returns undefined — an unknown code narrows to Code 8", () => {
    // `forCode` used to treat an unresolved code as "show everything", leaking
    // motorcycle and heavy content to car learners before the account landed.
    expect(studyCodeOf({ ...defaultUserState(), onboarding: null })).toBe("8");
  });

  it("changing tier does not move the code", () => {
    const onboarding = onboardingWith("A");
    const asFree: UserState = { ...defaultUserState(), tier: "free", onboarding };
    const asPaid: UserState = { ...defaultUserState(), tier: "premium_plus", onboarding };
    expect(studyCodeOf(asPaid)).toBe(studyCodeOf(asFree));
    expect(studyCodeOf(asPaid)).toBe("A");
  });
});

describe("content follows the chosen code, exclusively", () => {
  const foreignTo = (code: VehicleCode) => (codes?: VehicleCode[]) =>
    Boolean(codes?.length) && !codes!.some((c) => sameGroup(c, code));

  for (const code of SELECTABLE_CODES) {
    it(`code ${code} is served no other vehicle group's content`, () => {
      const state: UserState = {
        ...defaultUserState(),
        tier: "premium_plus",
        onboarding: onboardingWith(code),
      };
      const isForeign = foreignTo(code);
      const resolved = studyCodeOf(state);
      expect(resolved).toBe(code);

      for (const pool of [
        forCode(QUESTIONS, resolved),
        forCode(FLASHCARDS, resolved),
        forCode(SCENARIOS, resolved),
        selectFlashcardQueue(FLASHCARDS, state),
        sampleDiagnostic(QUESTIONS, [], resolved),
        sampleMockExam(QUESTIONS, [], resolved),
        sampleMiniMock(QUESTIONS, [], resolved),
      ]) {
        expect(pool.length).toBeGreaterThan(0);
        expect(pool.filter((i) => isForeign(i.codes))).toEqual([]);
      }
    });
  }
});

describe("hydrateAccountState — the code is established on sign-in", () => {
  it("takes the server's code, so every device agrees", () => {
    const local: UserState = {
      ...defaultUserState(),
      ownerEmail: "rider@example.com",
      onboarding: onboardingWith("8"),
    };
    const next = hydrateAccountState(
      local,
      { tier: "premium_plus", onboarding: onboardingWith("A") },
      emptyRemote,
      "rider@example.com",
    );
    expect(studyCodeOf(next)).toBe("A");
  });

  it("signing in repeatedly never changes the code", () => {
    const account = { tier: "premium" as const, onboarding: onboardingWith("14") };
    let s = hydrateAccountState(defaultUserState(), account, emptyRemote, "t@example.com");
    for (let i = 0; i < 5; i++) {
      s = hydrateAccountState(s, account, emptyRemote, "t@example.com");
      expect(studyCodeOf(s)).toBe("14");
    }
  });

  it("a server with no onboarding does NOT blank a code chosen before signup", () => {
    // The visitor who completed the wizard, then created an account. Wiping
    // here would send them back through onboarding and reset them to Code 8.
    const local: UserState = { ...defaultUserState(), onboarding: onboardingWith("A") };
    const next = hydrateAccountState(
      local,
      { tier: "free", onboarding: null },
      emptyRemote,
      "new@example.com",
    );
    expect(studyCodeOf(next)).toBe("A");
  });

  it("a different account does not inherit the previous learner's code", () => {
    const bikeLocal: UserState = {
      ...defaultUserState(),
      ownerEmail: "bike@example.com",
      onboarding: onboardingWith("A"),
    };
    const next = hydrateAccountState(
      bikeLocal,
      { tier: "premium_plus", onboarding: onboardingWith("8") },
      emptyRemote,
      "car@example.com",
    );
    expect(studyCodeOf(next)).toBe("8");
  });
});

describe("local store — the code survives a reload unchanged", () => {
  // The suite runs in the node environment, so stand up just enough of the
  // browser for the persistence path to execute.
  const store = new Map<string, string>();
  beforeEach(() => {
    store.clear();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
      },
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("round-trips through localStorage", () => {
    const state: UserState = {
      ...defaultUserState(),
      profile: { id: "u1", name: "R", email: "r@example.com", createdAt: "2026-01-01T00:00:00Z" },
      ownerEmail: "r@example.com",
      onboarding: onboardingWith("14"),
    };
    saveState(state);
    expect(studyCodeOf(loadState())).toBe("14");
  });

  it("a v2 blob carrying the retired paid track loses it, keeping the code", () => {
    const legacy = {
      ...defaultUserState(),
      version: 2,
      onboarding: onboardingWith("A"),
      vehicleClass: "car", // the retired track — must not survive or override
    };
    store.set(STORAGE_KEY, JSON.stringify(legacy));
    const loaded = loadState();
    expect(studyCodeOf(loaded)).toBe("A");
    expect((loaded as UserState & { vehicleClass?: unknown }).vehicleClass).toBeUndefined();
  });
});
