import { describe, expect, it } from "vitest";
import { persistOnboarding } from "@/lib/store/persist-onboarding";
import { defaultUserState } from "@/lib/store/local-store";
import { studyCodeOf } from "@/lib/billing/plans";
import type { OnboardingData, UserState, VehicleCode } from "@/types";

/**
 * Changing the licence code from the account screen must reach the SERVER, not
 * just localStorage. It previously did not: the dialog updated local state and
 * reloaded the page 600ms later, which cancelled the store's 800ms debounced
 * account sync before it ran. The edit never reached `profiles.vehicle_code`,
 * and the next hydration restored the old code — so the change silently
 * reverted. Demo mode hid it completely: with no Supabase there is no sync to
 * cancel and no hydration to overwrite, so localStorage alone made it look
 * like it worked.
 */

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

const signedIn: UserState = {
  ...defaultUserState(),
  profile: { id: "u1", name: "R", email: "r@example.com", createdAt: "2026-01-01T00:00:00Z" },
  ownerEmail: "r@example.com",
  tier: "premium_plus",
  onboarding: onboardingWith("8"),
};

/** Records what each sink received, and in what order. */
function sinks(remote?: { fail?: boolean }) {
  const order: string[] = [];
  const local: UserState[] = [];
  const server: UserState[] = [];
  return {
    order,
    local,
    server,
    saveLocal: (s: UserState) => {
      order.push("local");
      local.push(s);
    },
    saveRemote: async (s: UserState) => {
      order.push("remote");
      server.push(s);
      if (remote?.fail) throw new Error("network down");
    },
  };
}

describe("persistOnboarding — a profile edit must be durable", () => {
  it("sends the NEW licence code to the server, not the old one", async () => {
    const t = sinks();
    await persistOnboarding({
      state: signedIn,
      data: onboardingWith("14"),
      saveLocal: t.saveLocal,
      saveRemote: t.saveRemote,
    });
    expect(t.server).toHaveLength(1);
    expect(t.server[0].onboarding?.vehicleCode).toBe("14");
    expect(studyCodeOf(t.server[0])).toBe("14");
  });

  it("returns the updated state so the store reflects the change", async () => {
    const next = await persistOnboarding({
      state: signedIn,
      data: onboardingWith("A"),
      saveLocal: () => {},
      saveRemote: async () => {},
    });
    expect(studyCodeOf(next)).toBe("A");
    // The caller's state object is untouched.
    expect(studyCodeOf(signedIn)).toBe("8");
  });

  it("writes the local cache BEFORE the network, so a failure still keeps the choice", async () => {
    const t = sinks({ fail: true });
    await expect(
      persistOnboarding({
        state: signedIn,
        data: onboardingWith("14"),
        saveLocal: t.saveLocal,
        saveRemote: t.saveRemote,
      }),
    ).rejects.toThrow();
    expect(t.order).toEqual(["local", "remote"]);
    expect(t.local[0].onboarding?.vehicleCode).toBe("14");
  });

  it("propagates a server failure instead of reporting a save that did not happen", async () => {
    const t = sinks({ fail: true });
    await expect(
      persistOnboarding({
        state: signedIn,
        data: onboardingWith("A"),
        saveLocal: t.saveLocal,
        saveRemote: t.saveRemote,
      }),
    ).rejects.toThrow("network down");
  });

  it("skips the server in demo mode (no backend) but still saves locally", async () => {
    const t = sinks();
    await persistOnboarding({
      state: signedIn,
      data: onboardingWith("14"),
      saveLocal: t.saveLocal,
      saveRemote: null,
    });
    expect(t.local[0].onboarding?.vehicleCode).toBe("14");
    expect(t.server).toHaveLength(0);
  });

  it("skips the server when signed out — there is no account to write to", async () => {
    const t = sinks();
    await persistOnboarding({
      state: { ...signedIn, profile: null },
      data: onboardingWith("14"),
      saveLocal: t.saveLocal,
      saveRemote: t.saveRemote,
    });
    expect(t.local).toHaveLength(1);
    expect(t.server).toHaveLength(0);
  });

  it("keeps every other answer, changing only what was edited", async () => {
    const base: UserState = { ...signedIn, onboarding: { ...onboardingWith("8"), priorAttempts: 2 } };
    const next = await persistOnboarding({
      state: base,
      data: { ...base.onboarding!, vehicleCode: "A" },
      saveLocal: () => {},
      saveRemote: async () => {},
    });
    expect(next.onboarding?.priorAttempts).toBe(2);
    expect(next.onboarding?.completedAt).toBe("2026-07-01T10:00:00Z");
    expect(next.onboarding?.vehicleCode).toBe("A");
  });
});
