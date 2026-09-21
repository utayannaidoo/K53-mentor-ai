import { describe, expect, it } from "vitest";
import { shouldSkipOnboarding, signedInFromStateBlob } from "@/lib/auth/onboarding-guard";

/**
 * A learner two months into studying was walked through Navi's first-run tour
 * and had their study profile overwritten, because every marketing CTA points
 * at /onboarding and the wizard had no idea it had already been completed.
 *
 * The damage is not the tour. Finishing the wizard is the only writer of
 * `firstRunTourDone: false` anywhere in the app, and the sync that follows
 * upserts goal, vehicle code, test dates, confidence, worries, knowledge level,
 * study frequency and prior attempts — `vehicle_code` decides which content a
 * learner is served. Confirmed in production: an account created 2026-07-07
 * with 647 question attempts behind it had `onboarded_at` reset to 2026-09-04.
 */

const settled = { ready: true, accountHydrated: true };

describe("shouldSkipOnboarding", () => {
  it("sends an onboarded learner to their dashboard instead of setup", () => {
    expect(shouldSkipOnboarding({ ...settled, isAuthed: true, hasOnboarded: true })).toBe(true);
  });

  it("lets a brand-new visitor through — this is the page they were promised", () => {
    expect(shouldSkipOnboarding({ ...settled, isAuthed: false, hasOnboarded: false })).toBe(false);
  });

  it("lets a signed-in learner who has never finished setup through", () => {
    expect(shouldSkipOnboarding({ ...settled, isAuthed: true, hasOnboarded: false })).toBe(false);
  });

  it("does not redirect a signed-out visitor, whatever the local store says", () => {
    // /dashboard bounces them to /login, which would turn the site's main call
    // to action into a sign-in wall for someone who just wanted the quiz.
    expect(shouldSkipOnboarding({ ...settled, isAuthed: false, hasOnboarded: true })).toBe(false);
  });

  it("waits for the account to hydrate before deciding", () => {
    // The case the guard exists for: a learner on a device they have not used
    // before. Until the server account lands, hasOnboarded describes an empty
    // local store, and acting on it would wave the wizard straight through.
    expect(
      shouldSkipOnboarding({
        ready: true,
        accountHydrated: false,
        isAuthed: true,
        hasOnboarded: false,
      }),
    ).toBe(false);
  });

  it("waits for localStorage to be read at all", () => {
    expect(
      shouldSkipOnboarding({
        ready: false,
        accountHydrated: true,
        isAuthed: true,
        hasOnboarded: true,
      }),
    ).toBe(false);
  });
});

describe("signedInFromStateBlob", () => {
  it("reads a signed-in learner off the stored blob", () => {
    const raw = JSON.stringify({ profile: { id: "u1", name: "Thabo" }, onboarding: {} });
    expect(signedInFromStateBlob(raw)).toBe(true);
  });

  it("treats a stored-but-signed-out blob as signed out", () => {
    expect(signedInFromStateBlob(JSON.stringify({ profile: null, attempts: [] }))).toBe(false);
  });

  it("is signed out with nothing stored", () => {
    expect(signedInFromStateBlob(null)).toBe(false);
    expect(signedInFromStateBlob(undefined)).toBe(false);
    expect(signedInFromStateBlob("")).toBe(false);
  });

  it("survives junk rather than taking the home page down with it", () => {
    // The landing page is the first thing a stranger sees; a hand-edited or
    // half-written blob must cost a wrong label, never a blank screen.
    expect(signedInFromStateBlob("{not json")).toBe(false);
    expect(signedInFromStateBlob('"a string"')).toBe(false);
    expect(signedInFromStateBlob("[1,2,3]")).toBe(false);
    expect(signedInFromStateBlob("null")).toBe(false);
  });
});
