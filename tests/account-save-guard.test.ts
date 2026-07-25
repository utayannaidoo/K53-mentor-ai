import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { saveAccount } from "@/lib/supabase/account";
import { defaultUserState } from "@/lib/store/local-store";
import type { OnboardingData, UserState, VehicleCode } from "@/types";

/**
 * `saveAccount` writes the profile row of whoever the SESSION says is signed
 * in, using whatever the local store holds. Local state is a browser-wide
 * cache shared by every account used on the device, so without an owner check
 * one learner's name, email and licence code get upserted over another's row
 * — the write that put one account's motorcycle code onto another account's
 * profile permanently. The guard must refuse those writes.
 */

interface Upsert {
  table: string;
  row: Record<string, unknown>;
}

/** Minimal Supabase double: records upserts, reports a fixed signed-in user. */
function fakeSupabase(userId: string) {
  const writes: Upsert[] = [];
  const client = {
    auth: {
      getUser: async () => ({ data: { user: { id: userId, email: "signed-in@example.com" } } }),
    },
    from: (table: string) => ({
      upsert: async (row: Record<string, unknown>) => {
        writes.push({ table, row });
        return { error: null };
      },
    }),
  } as unknown as SupabaseClient;
  return { client, writes };
}

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

function stateFor(profileId: string | null, code: VehicleCode, extra: Partial<UserState> = {}): UserState {
  return {
    ...defaultUserState(),
    profile: profileId
      ? { id: profileId, name: "Other Learner", email: "other@example.com", createdAt: "2026-01-01T00:00:00Z" }
      : null,
    onboarding: onboardingWith(code),
    ...extra,
  };
}

describe("saveAccount — refuses to write another account's data", () => {
  it("writes nothing when the local state belongs to a different user", async () => {
    const { client, writes } = fakeSupabase("user-B");
    await saveAccount(client, stateFor("user-A", "A"));
    expect(writes).toEqual([]);
  });

  it("writes nothing when there is no local profile at all", async () => {
    const { client, writes } = fakeSupabase("user-B");
    await saveAccount(client, stateFor(null, "A"));
    expect(writes).toEqual([]);
  });

  it("writes normally when the local state is the signed-in user's", async () => {
    const { client, writes } = fakeSupabase("user-B");
    await saveAccount(client, stateFor("user-B", "8"));
    const profile = writes.find((w) => w.table === "profiles");
    expect(profile?.row.id).toBe("user-B");
    expect(profile?.row.vehicle_code).toBe("8");
  });

  it("writes the learner's own code unchanged, on every tier", async () => {
    // The plan must never rewrite what someone is studying.
    for (const tier of ["free", "premium", "premium_plus"] as const) {
      const { client, writes } = fakeSupabase("user-B");
      await saveAccount(client, stateFor("user-B", "A", { tier }));
      expect(writes.find((w) => w.table === "profiles")?.row.vehicle_code, tier).toBe("A");
    }
  });
});
