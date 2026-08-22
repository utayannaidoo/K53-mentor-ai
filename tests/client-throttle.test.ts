import { describe, expect, it } from "vitest";
import {
  checkAuthAttempt,
  recordAuthResult,
  type ThrottleSurface,
} from "@/lib/auth/client-throttle";

/**
 * The rule under test: max 5 FAILED attempts per surface per rolling
 * 15-minute window, success wipes the surface's history, and every storage
 * problem fails OPEN (GoTrue remains the hard gate — see client-throttle).
 * The literals below pin those numbers on purpose: quietly changing either
 * rule must break a test first.
 */
const MIN = 60 * 1000;
const WINDOW_MS = 15 * MIN;
const T0 = 1_800_000_123_456; // arbitrary fixed epoch — nothing here reads the clock

type Store = Record<string, string>;

/** Stub globalThis.window like tests/local-store.test.ts does; returns undo. */
function stubWindow(localStorageOverrides?: Partial<Storage>): () => void {
  const store: Store = {};
  const prev = (globalThis as { window?: unknown }).window;
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      ...localStorageOverrides,
    },
  };
  return () => {
    (globalThis as { window?: unknown }).window = prev;
  };
}

/** Five failed attempts on one surface — exactly at the limit, not over. */
function recordFiveFailures(surface: ThrottleSurface) {
  for (let i = 0; i < 5; i++) recordAuthResult(surface, false, T0 + i * MIN);
}

describe("checkAuthAttempt", () => {
  it("allows attempts until the limit and blocks the 6th with time until the oldest ages out", () => {
    const restore = stubWindow();
    try {
      expect(checkAuthAttempt("login", T0)).toEqual({ allowed: true, retryAfterS: 0 });
      recordFiveFailures("login");
      // 5 failures at T0..T0+4min, checked at T0+5min: oldest (T0) leaves the
      // window at T0+15min — 10 minutes from now.
      const decision = checkAuthAttempt("login", T0 + 5 * MIN);
      expect(decision.allowed).toBe(false);
      expect(decision.retryAfterS).toBe(10 * 60);
    } finally {
      restore();
    }
  });

  it("rolls the window: failures older than 15 minutes stop counting", () => {
    const restore = stubWindow();
    try {
      recordFiveFailures("login");
      // One second before the oldest failure exits — still blocked, 1s left.
      expect(checkAuthAttempt("login", T0 + WINDOW_MS - 1)).toEqual({
        allowed: false,
        retryAfterS: 1,
      });
      // Exactly at the boundary the oldest failure has aged out entirely.
      expect(checkAuthAttempt("login", T0 + WINDOW_MS)).toEqual({
        allowed: true,
        retryAfterS: 0,
      });
    } finally {
      restore();
    }
  });

  it("does not consume budget — checking repeatedly never records anything", () => {
    const restore = stubWindow();
    try {
      for (let i = 0; i < 20; i++) {
        expect(checkAuthAttempt("signup", T0).allowed).toBe(true);
      }
      // Still allowed after 20 checks: only recordAuthResult spends the budget.
      recordAuthResult("signup", false, T0);
      expect(checkAuthAttempt("signup", T0).allowed).toBe(true);
    } finally {
      restore();
    }
  });

  it("treats each surface independently — five failed logins don't block reset", () => {
    const restore = stubWindow();
    try {
      recordFiveFailures("login");
      expect(checkAuthAttempt("login", T0 + 5 * MIN).allowed).toBe(false);
      expect(checkAuthAttempt("reset", T0 + 5 * MIN).allowed).toBe(true);
      expect(checkAuthAttempt("signup", T0 + 5 * MIN).allowed).toBe(true);
      expect(checkAuthAttempt("resend", T0 + 5 * MIN).allowed).toBe(true);
    } finally {
      restore();
    }
  });
});

describe("recordAuthResult", () => {
  it("clears a surface's history on success and only that surface's", () => {
    const restore = stubWindow();
    try {
      recordFiveFailures("login");
      recordFiveFailures("reset");
      expect(checkAuthAttempt("login", T0).allowed).toBe(false);

      recordAuthResult("login", true, T0);
      expect(checkAuthAttempt("login", T0).allowed).toBe(true);
      // A real user logging in isn't punished later — but other surfaces keep
      // whatever history they earned.
      expect(checkAuthAttempt("reset", T0).allowed).toBe(false);
    } finally {
      restore();
    }
  });

  it("lets an attempt pass the check and stay allowed until failures pile up", () => {
    const restore = stubWindow();
    try {
      // The caller flow: check → attempt → record the outcome. Each recorded
      // failure alone never trips the gate; once the fifth is down the next
      // check is the first blocked one.
      for (let i = 0; i < 5; i++) {
        expect(checkAuthAttempt("login", T0 + i * MIN).allowed).toBe(true);
        recordAuthResult("login", false, T0 + i * MIN);
        expect(checkAuthAttempt("login", T0 + i * MIN).allowed).toBe(i < 4);
      }
      expect(checkAuthAttempt("login", T0 + 5 * MIN).allowed).toBe(false);
    } finally {
      restore();
    }
  });
});

describe("fail-open", () => {
  it("allows everything when there is no window at all (SSR)", () => {
    // Node env: no globalThis.window unless stubbed. Must not throw, must allow.
    expect(checkAuthAttempt("login")).toEqual({ allowed: true, retryAfterS: 0 });
    expect(() => recordAuthResult("login", false)).not.toThrow();
  });

  it("allows when reading storage throws (private mode)", () => {
    const restore = stubWindow({
      getItem: () => {
        throw new Error("SecurityError");
      },
    });
    try {
      expect(checkAuthAttempt("reset")).toEqual({ allowed: true, retryAfterS: 0 });
    } finally {
      restore();
    }
  });

  it("allows when writing storage throws (quota) — nothing persisted, nothing enforced", () => {
    const restore = stubWindow({
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });
    try {
      recordFiveFailures("login");
      // Every failed record was swallowed, so every read sees a clean slate.
      expect(checkAuthAttempt("login")).toEqual({ allowed: true, retryAfterS: 0 });
    } finally {
      restore();
    }
  });

  it("reads corrupted JSON as an empty history", () => {
    const restore = stubWindow();
    try {
      window.localStorage.setItem("k53.auth.throttle.v1", '{"login": [not numbers]}');
      expect(checkAuthAttempt("login")).toEqual({ allowed: true, retryAfterS: 0 });
    } finally {
      restore();
    }
  });
});
