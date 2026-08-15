import { describe, expect, it } from "vitest";
import { hydrateAccountState, hydrateSessionOnly } from "@/lib/store/account-hydrate";
import { defaultUserState } from "@/lib/store/local-store";
import type { RemoteProgress } from "@/lib/supabase/progress";
import type { QuestionAttempt, UserState } from "@/types";

const attempt = (id: string, at: string): QuestionAttempt => ({
  id,
  questionId: "q1",
  categoryId: "signs",
  correct: true,
  selectedIndex: 0,
  context: "practice",
  at,
});

const emptyRemote: RemoteProgress = {
  attempts: [],
  scenarioAttempts: [],
  mockExams: [],
  diagnostics: [],
  cardStates: {},
  sessions: [],
  readinessHistory: [],
};

/** Local state that already belongs to account A, with some progress. */
function accountAState(): UserState {
  const s = defaultUserState();
  s.ownerEmail = "alice@example.com";
  s.attempts = [attempt("a1", "2026-07-01T10:00:00Z")];
  s.cp = 100;
  return s;
}

describe("hydrateAccountState — cross-account isolation", () => {
  it("does NOT carry account A's progress when account B signs in", () => {
    const remoteB: RemoteProgress = {
      ...emptyRemote,
      attempts: [attempt("b1", "2026-07-05T10:00:00Z")],
    };
    const next = hydrateAccountState(
      accountAState(),
      { tier: "free", cp: 20 },
      remoteB,
      "bob@example.com",
    );
    // Alice's attempt must be gone; only Bob's remains.
    expect(next.attempts.map((a) => a.id)).toEqual(["b1"]);
    // CP is Bob's own, not max(100, 20) — a different account starts fresh.
    expect(next.cp).toBe(20);
    expect(next.ownerEmail).toBe("bob@example.com");
  });

  it("keeps and merges progress when the SAME account signs in again", () => {
    const remoteA: RemoteProgress = {
      ...emptyRemote,
      attempts: [attempt("a2", "2026-07-03T10:00:00Z")],
    };
    const next = hydrateAccountState(
      accountAState(),
      { tier: "free", cp: 50 },
      remoteA,
      "alice@example.com",
    );
    // Union of local (a1) + server (a2), nothing dropped.
    expect(next.attempts.map((a) => a.id).sort()).toEqual(["a1", "a2"]);
    // CP only grows for the same account: max(100, 50).
    expect(next.cp).toBe(100);
    expect(next.ownerEmail).toBe("alice@example.com");
  });

  it("is case-insensitive on the owner email", () => {
    const next = hydrateAccountState(
      accountAState(),
      { tier: "free", cp: 0 },
      emptyRemote,
      "ALICE@example.com",
    );
    // Same person despite casing — data kept.
    expect(next.attempts.map((a) => a.id)).toEqual(["a1"]);
  });

  it("adopts the account cleanly on a first sign-in (no prior owner)", () => {
    const fresh = defaultUserState(); // ownerEmail null
    const next = hydrateAccountState(fresh, { tier: "premium", cp: 5 }, emptyRemote, "new@example.com");
    expect(next.ownerEmail).toBe("new@example.com");
    expect(next.tier).toBe("premium");
    expect(next.cp).toBe(5);
  });
});

const alice = { id: "auth-alice", email: "alice@example.com", fullName: "Alice Mokoena" };

describe("hydrateSessionOnly — the account rows failed to load", () => {
  it("still signs in a browser with no cached profile", () => {
    // The loop this prevents: isAuthed false against a live session made
    // AppShell redirect to /login and the middleware redirect straight back,
    // which is the WebKit history throttle and another crash on a phone.
    const next = hydrateSessionOnly(defaultUserState(), alice);
    expect(next.profile).not.toBeNull();
    expect(next.profile?.id).toBe("auth-alice");
    expect(next.profile?.email).toBe("alice@example.com");
    expect(next.profile?.name).toBe("Alice Mokoena");
    expect(next.ownerEmail).toBe("alice@example.com");
  });

  it("falls back to a generic name when the session carries none", () => {
    const next = hydrateSessionOnly(defaultUserState(), { ...alice, fullName: null });
    expect(next.profile?.name).toBe("Learner");
  });

  it("leaves an already-loaded profile for the same user completely alone", () => {
    const s = defaultUserState();
    s.ownerEmail = "alice@example.com";
    s.profile = {
      id: "auth-alice",
      name: "Alice M.",
      email: "alice@example.com",
      createdAt: "2026-01-01T00:00:00Z",
    };
    s.cp = 100;
    const next = hydrateSessionOnly(s, alice);
    // Real data from an earlier successful load beats anything synthesised.
    expect(next.profile).toEqual(s.profile);
    expect(next.cp).toBe(100);
  });

  it("keeps this account's progress rather than throwing it away", () => {
    // A failed read of `profiles` is no reason to drop a session's work.
    const next = hydrateSessionOnly(accountAState(), alice);
    expect(next.attempts.map((a) => a.id)).toEqual(["a1"]);
    expect(next.cp).toBe(100);
  });

  it("does NOT hand account B the cache belonging to account A", () => {
    // Same cross-account rule as hydrateAccountState — a failed read must not
    // become a way to inherit someone else's progress.
    const next = hydrateSessionOnly(accountAState(), {
      id: "auth-bob",
      email: "bob@example.com",
      fullName: "Bob Dlamini",
    });
    expect(next.attempts).toEqual([]);
    expect(next.cp).toBe(0);
    expect(next.ownerEmail).toBe("bob@example.com");
    expect(next.profile?.id).toBe("auth-bob");
  });

  it("never leaves a session without a profile, whatever the cache held", () => {
    // The invariant the loop turned on: isAuthed is Boolean(state.profile), so
    // a live session must always come out of here authed. If a future edit can
    // return profile: null for any of these, the redirect loop is back.
    const otherAccount = defaultUserState();
    otherAccount.ownerEmail = "bob@example.com";
    const noOwner = defaultUserState();
    noOwner.profile = { id: "x", name: "X", email: "", createdAt: "2026-01-01T00:00:00Z" };

    for (const s of [defaultUserState(), accountAState(), otherAccount, noOwner]) {
      expect(hydrateSessionOnly(s, alice).profile).not.toBeNull();
      expect(hydrateSessionOnly(s, { ...alice, email: null, fullName: null }).profile).not.toBeNull();
    }
  });

  it("upgrades a local-only profile to the real account id", () => {
    // Demo/offline sign-in minted its own uid; the session's id is the true one.
    const s = defaultUserState();
    s.ownerEmail = "alice@example.com";
    s.profile = {
      id: "user_local_123",
      name: "Alice M.",
      email: "alice@example.com",
      createdAt: "2026-01-01T00:00:00Z",
    };
    const next = hydrateSessionOnly(s, alice);
    expect(next.profile?.id).toBe("auth-alice");
    // …while salvaging what the cache already knew.
    expect(next.profile?.name).toBe("Alice M.");
    expect(next.profile?.createdAt).toBe("2026-01-01T00:00:00Z");
  });
});
