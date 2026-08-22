/**
 * Client-side backoff gate for the auth surfaces (login / signup / reset /
 * resend). This is DEFENSE-IN-DEPTH ONLY, layered UNDER Supabase Auth
 * (GoTrue), which remains the authoritative rate limiter: our requests go
 * browser→GoTrue directly and we cannot intercept them without proxying, so
 * this module can never stop a determined attacker — anyone scripting
 * requests can bypass localStorage entirely. What it DOES stop is accidental
 * spam (double submits, a stuck form) and casual scripted abuse, keeping
 * those under GoTrue's hard limits instead of burning them.
 *
 * Fail-open is deliberate: every storage access is try/catch'd and any
 * storage failure (private mode, quota, corrupted JSON) yields "allowed".
 * Availability over security — because the hard gate lives in GoTrue, a
 * broken throttle here must never lock a real user out of their own account.
 *
 * Contract: callers run checkAuthAttempt BEFORE dispatching, then call
 * recordAuthResult with the outcome afterwards. The check only counts PAST
 * failures and consumes nothing, so a user can fail four times, get it right,
 * and start fresh — success clears that surface's history entirely.
 */

export type ThrottleSurface = "login" | "signup" | "reset" | "resend";

export interface ThrottleDecision {
  allowed: boolean;
  /** Seconds until the oldest in-window failure ages out. 0 when allowed. */
  retryAfterS: number;
}

const STORAGE_KEY = "k53.auth.throttle.v1";
/** Failed attempts allowed per surface inside one rolling window. */
const MAX_FAILURES_PER_WINDOW = 5;
/** Rolling window length. */
const WINDOW_MS = 15 * 60 * 1000;
// Hard cap on stored timestamps per surface so a caller that records without
// checking cannot grow storage without bound. Far above MAX_FAILURES, it
// never affects the decision logic itself.
const KEEP_PER_SURFACE = 100;

type ThrottleState = Partial<Record<ThrottleSurface, number[]>>;

function emptyState(): ThrottleState {
  return {};
}

function readState(): ThrottleState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as unknown;
    // Defensive shape check: a corrupted or hand-edited blob reads as empty.
    const state: ThrottleState = {};
    if (!parsed || typeof parsed !== "object") return state;
    for (const surface of ["login", "signup", "reset", "resend"] as const) {
      const v = (parsed as Record<string, unknown>)[surface];
      if (Array.isArray(v)) state[surface] = v.filter((t): t is number => typeof t === "number");
    }
    return state;
  } catch {
    return emptyState();
  }
}

function writeState(state: ThrottleState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota — the gate simply won't persist */
  }
}

function inWindow(timestamps: number[] | undefined, now: number): number[] {
  if (!timestamps || timestamps.length === 0) return [];
  const cutoff = now - WINDOW_MS;
  return timestamps.filter((t) => t > cutoff);
}

/**
 * Whether another attempt may go out right now. Counts past failures only —
 * calling this does NOT consume budget.
 */
export function checkAuthAttempt(surface: ThrottleSurface, now = Date.now()): ThrottleDecision {
  const recent = inWindow(readState()[surface], now);
  if (recent.length < MAX_FAILURES_PER_WINDOW) {
    return { allowed: true, retryAfterS: 0 };
  }
  const oldest = Math.min(...recent);
  return {
    allowed: false,
    // At least 1s so the copy never says "wait 0 minutes".
    retryAfterS: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000)),
  };
}

/** Record the outcome of an attempt. Success clears the surface's history. */
export function recordAuthResult(surface: ThrottleSurface, ok: boolean, now = Date.now()): void {
  const state = readState();
  if (ok) {
    if (!state[surface]) return; // already clean — skip the write
    delete state[surface];
    writeState(state);
    return;
  }
  const recent = inWindow(state[surface], now);
  recent.push(now);
  state[surface] = recent.slice(-KEEP_PER_SURFACE);
  writeState(state);
}
