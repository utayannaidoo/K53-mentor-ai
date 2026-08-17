import { describe, expect, it } from "vitest";
import {
  bookedTests,
  formatTestDate,
  isTestToday,
  licenceHeld,
  testOutcomeDue,
} from "@/lib/licence/test-day";
import { hydrateAccountState } from "@/lib/store/account-hydrate";
import { defaultUserState } from "@/lib/store/local-store";
import { LICENCE_RANK_INDEX } from "@/lib/engagement";
import { buildPassport, passportMessage } from "@/lib/share/passport";
import { computeReadiness } from "@/lib/diagnostic/scoring";
import type { LicenceGoal, LicenceResult, OnboardingData, UserState } from "@/types";

const NOW = new Date("2026-08-17T09:00:00.000Z");
const TODAY = "2026-08-17";

function onboarding(
  testDate: string | null,
  goal: LicenceGoal = "learners",
  driversTestDate: string | null = null,
): OnboardingData {
  return {
    goal,
    vehicleCode: "8",
    testDate,
    driversTestDate,
    confidence: 3,
    worryCategories: [],
    knowledgeLevel: "some",
    studyFrequency: "steady",
    priorAttempts: 0,
    completedAt: "2026-07-01T00:00:00.000Z",
  };
}

function passed(testDate = TODAY): LicenceResult {
  return { result: "passed", at: NOW.toISOString(), testDate };
}
function failed(testDate = TODAY): LicenceResult {
  return { result: "failed", at: NOW.toISOString(), testDate };
}

function stateWith(patch: Partial<UserState>): UserState {
  return { ...defaultUserState(), ...patch };
}

describe("which tests are booked", () => {
  it("reads testDate as the LEARNER'S test when that is the goal", () => {
    expect(bookedTests(onboarding(TODAY, "learners"))).toEqual([
      { kind: "learners", testDate: TODAY },
    ]);
  });

  it("reads the same field as the DRIVER'S test when that is the goal", () => {
    // The trap this function exists for: `testDate` is the only date whenever
    // the goal isn't "both", so for a driver's-licence learner it holds the
    // driver's test and `driversTestDate` is empty.
    expect(bookedTests(onboarding(TODAY, "drivers"))).toEqual([
      { kind: "drivers", testDate: TODAY },
    ]);
  });

  it("returns both, learner's first, when the goal is both", () => {
    expect(bookedTests(onboarding(TODAY, "both", "2026-11-02"))).toEqual([
      { kind: "learners", testDate: TODAY },
      { kind: "drivers", testDate: "2026-11-02" },
    ]);
  });

  it("returns nothing when no date is booked", () => {
    expect(bookedTests(onboarding(null))).toEqual([]);
    expect(bookedTests(null)).toEqual([]);
    // "learners" never uses driversTestDate, even if one is lying around.
    expect(bookedTests(onboarding(null, "learners", TODAY))).toEqual([]);
  });
});

describe("test-day prompt — when it is owed", () => {
  it("asks on the booked day, about the right test", () => {
    expect(testOutcomeDue(stateWith({ onboarding: onboarding(TODAY) }), NOW)).toEqual({
      kind: "learners",
      testDate: TODAY,
    });
    expect(testOutcomeDue(stateWith({ onboarding: onboarding(TODAY, "drivers") }), NOW)).toEqual({
      kind: "drivers",
      testDate: TODAY,
    });
  });

  it("still asks after the day, for anyone who did not open the app on it", () => {
    expect(testOutcomeDue(stateWith({ onboarding: onboarding("2026-08-02") }), NOW)).toMatchObject({
      kind: "learners",
    });
  });

  it("stays quiet before the day, and when nothing is booked", () => {
    expect(testOutcomeDue(stateWith({ onboarding: onboarding("2026-09-30") }), NOW)).toBeNull();
    expect(testOutcomeDue(stateWith({ onboarding: onboarding(null) }), NOW)).toBeNull();
    expect(testOutcomeDue(stateWith({ onboarding: null }), NOW)).toBeNull();
  });

  it("does not ask twice about the same booking", () => {
    const answered = stateWith({
      onboarding: onboarding(TODAY),
      licence: { learners: failed() },
    });
    expect(testOutcomeDue(answered, NOW)).toBeNull();
  });

  it("asks again after a failure is re-booked, which a boolean flag never could", () => {
    const rebooked = stateWith({
      licence: { learners: failed("2026-03-04") },
      onboarding: onboarding(TODAY),
    });
    expect(testOutcomeDue(rebooked, NOW)).toMatchObject({ kind: "learners" });
  });

  it("holds off for the rest of the day once put off, and returns tomorrow", () => {
    const deferred = stateWith({
      onboarding: onboarding(TODAY),
      licenceDeferredOn: { learners: TODAY },
    });
    expect(testOutcomeDue(deferred, NOW)).toBeNull();
    expect(testOutcomeDue(deferred, new Date("2026-08-18T09:00:00.000Z"))).toMatchObject({
      kind: "learners",
    });
  });
});

describe("test-day prompt — the two tests do not silence each other", () => {
  const both = onboarding(TODAY, "both", "2026-08-16");

  it("asks about the learner's first when both are owed", () => {
    expect(testOutcomeDue(stateWith({ onboarding: both }), NOW)).toMatchObject({
      kind: "learners",
    });
  });

  it("moves on to the driver's once the learner's is answered", () => {
    const state = stateWith({ onboarding: both, licence: { learners: passed() } });
    expect(testOutcomeDue(state, NOW)).toEqual({ kind: "drivers", testDate: "2026-08-16" });
  });

  it("still asks about the driver's after a learner's pass maxed the rank", () => {
    // The gate this replaced was "are they licensed?", which would have gone
    // quiet here for everyone chasing both licences.
    const state = stateWith({
      onboarding: both,
      licence: { learners: passed() },
      rankAchieved: LICENCE_RANK_INDEX,
    });
    expect(testOutcomeDue(state, NOW)).toMatchObject({ kind: "drivers" });
  });

  it("deferring one does not defer the other", () => {
    const state = stateWith({
      onboarding: both,
      licence: { learners: passed() },
      licenceDeferredOn: { learners: TODAY },
    });
    expect(testOutcomeDue(state, NOW)).toMatchObject({ kind: "drivers" });
  });

  it("goes quiet once both are answered", () => {
    const state = stateWith({
      onboarding: both,
      licence: { learners: passed(), drivers: passed("2026-08-16") },
    });
    expect(testOutcomeDue(state, NOW)).toBeNull();
  });
});

describe("test-day prompt — copy helpers", () => {
  it("names the day so the question is about a date the learner recognises", () => {
    expect(formatTestDate("2026-08-17")).toContain("17");
    expect(formatTestDate("2026-08-17")).toContain("August");
  });

  it("survives a malformed date rather than printing Invalid Date", () => {
    expect(formatTestDate("not-a-date")).toBe("not-a-date");
  });

  it("separates today's test from one already past", () => {
    expect(isTestToday(TODAY, NOW)).toBe(true);
    expect(isTestToday("2026-08-02", NOW)).toBe(false);
  });

  it("reports the driver's licence as the one held when both are passed", () => {
    expect(licenceHeld({ learners: passed(), drivers: passed() })).toBe("drivers");
    expect(licenceHeld({ learners: passed() })).toBe("learners");
    expect(licenceHeld({ learners: failed() })).toBeNull();
    expect(licenceHeld({})).toBeNull();
  });
});

describe("a pass outlives the device it was recorded on", () => {
  it("re-grants the licence rank from the server's answer", () => {
    const hydrated = hydrateAccountState(
      defaultUserState(),
      {
        profile: { id: "u1", name: "Thabo", email: "t@k53.test", createdAt: NOW.toISOString() },
        onboarding: onboarding(TODAY),
        licence: { learners: passed() },
      },
      null,
      "t@k53.test",
    );

    expect(hydrated.rankAchieved).toBe(LICENCE_RANK_INDEX);
    expect(testOutcomeDue(hydrated, NOW)).toBeNull();
  });

  it("does not promote a learner who failed", () => {
    const hydrated = hydrateAccountState(
      defaultUserState(),
      { licence: { learners: failed() } },
      null,
      "t@k53.test",
    );
    expect(hydrated.rankAchieved).toBe(0);
  });

  it("merges per test rather than letting one answer drop the other", () => {
    // Passed the learner's long ago (already on the server); answered about the
    // driver's ten seconds ago and it has not flushed yet.
    const local = stateWith({
      ownerEmail: "t@k53.test",
      licence: { drivers: passed("2026-08-16") },
    });
    const hydrated = hydrateAccountState(
      local,
      { onboarding: onboarding(TODAY, "both", "2026-08-16"), licence: { learners: passed() } },
      null,
      "t@k53.test",
    );
    expect(hydrated.licence.learners?.result).toBe("passed");
    expect(hydrated.licence.drivers?.result).toBe("passed");
  });

  it("does not carry one learner's licence into another account", () => {
    const previous = stateWith({
      ownerEmail: "first@k53.test",
      licence: { learners: passed() },
      rankAchieved: LICENCE_RANK_INDEX,
    });
    const hydrated = hydrateAccountState(previous, {}, null, "second@k53.test");
    expect(hydrated.licence).toEqual({});
    expect(hydrated.rankAchieved).toBe(0);
  });
});

describe("the passport the pass unlocks", () => {
  function licensedState(licence: UserState["licence"]) {
    return stateWith({
      onboarding: onboarding(TODAY, "both", "2026-08-16"),
      rankAchieved: LICENCE_RANK_INDEX,
      licence,
    });
  }

  it("turns gold and names the learner's licence", () => {
    const s = licensedState({ learners: passed() });
    const p = buildPassport(s, computeReadiness(s), { now: NOW });

    expect(p.hero.tone).toBe("gold");
    expect(p.stamp).toEqual({ title: "LICENSED", detail: "LEARNER'S LICENCE", tone: "gold" });
    expect(p.headline).toBe("Learner's licence in hand. On to the driving.");
  });

  it("names the driver's licence once that is the one held", () => {
    const s = licensedState({ learners: passed(), drivers: passed("2026-08-16") });
    const p = buildPassport(s, computeReadiness(s), { now: NOW });

    expect(p.stamp?.detail).toBe("DRIVER'S LICENCE");
    expect(p.headline).toBe("Driver's licence. See you on the road.");
  });

  it("stops forecasting a pass for an exam already passed", () => {
    const s = licensedState({ learners: passed() });
    const p = buildPassport(s, computeReadiness(s), { now: NOW });

    expect(p.licensed).toBe(true);
    expect(p.qualifier).not.toContain("Predicted pass");
    expect(passportMessage(p)).not.toContain("Predicted pass");
    // Readiness is a record of what they knew, so it stays.
    expect(p.qualifier).toContain("Readiness");
  });
});
