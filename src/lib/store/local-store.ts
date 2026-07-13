import type { DailyUsage, Streak, UserState } from "@/types";
import { computeRankIndex, endowCp } from "@/lib/engagement";
import { computeReadiness } from "@/lib/diagnostic/scoring";

export const STORAGE_KEY = "k53mentor.state.v1";
export const STATE_VERSION = 2;

export function todayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** ISO week key like "2026-W25" — used to refresh the weekly streak freeze. */
export function isoWeekKey(now = new Date()): string {
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function defaultUserState(): UserState {
  return {
    version: STATE_VERSION,
    profile: null,
    ownerEmail: null,
    onboarding: null,
    tier: "free",
    vehicleClass: null,
    diagnostics: [],
    cardStates: {},
    attempts: [],
    scenarioAttempts: [],
    mockExams: [],
    sessions: [],
    streak: {
      current: 0,
      longest: 0,
      lastStudyDate: null,
      freezesRemaining: 1,
      freezeRefreshedWeek: null,
    },
    driverProgress: {},
    tutorThreads: [],
    dailyUsage: {},
    readinessHistory: [],
    cp: 0,
    rankAchieved: 0,
    pendingRankUp: null,
    guidedDone: false,
    planBonusDate: null,
    lastSeen: null,
    pendingComeback: null,
  };
}

export function loadState(): UserState {
  if (typeof window === "undefined") return defaultUserState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultUserState();
    const parsed = JSON.parse(raw) as UserState;
    // Shallow-merge against defaults so new fields don't break old saves.
    const merged = { ...defaultUserState(), ...parsed };
    // v1 → v2: grant Confidence Points for everything already done (endowed
    // progress — an existing user's first sight of CP is their banked work).
    if ((parsed.version ?? 1) < 2) {
      merged.cp = endowCp(merged);
      merged.rankAchieved = computeRankIndex({
        cp: merged.cp,
        readiness: computeReadiness(merged).readiness,
        hasPassedMock: merged.mockExams.some((m) => m.passed && !m.mini && !m.drill),
      });
      merged.pendingRankUp = null;
      merged.version = STATE_VERSION;
    }
    return merged;
  } catch {
    return defaultUserState();
  }
}

/**
 * History caps for the persisted blob. Without them the state grows without
 * bound (every answer, tutor message and readiness point forever), and since
 * the whole blob is JSON-stringified on each save, writes get slower the
 * longer someone studies. Caps are generous — months of heavy use — and all
 * analytics (readiness, insights, endowment) work on recent windows anyway.
 */
const KEEP = {
  attempts: 4000,
  scenarioAttempts: 1000,
  sessions: 1000,
  mockExams: 200,
  readinessHistory: 400,
  tutorThreads: 30,
  tutorMessagesPerThread: 100,
  dailyUsageDays: 60,
} as const;

function pruneState(state: UserState): UserState {
  const usageKeys = Object.keys(state.dailyUsage);
  const withinCaps =
    state.attempts.length <= KEEP.attempts &&
    state.scenarioAttempts.length <= KEEP.scenarioAttempts &&
    state.sessions.length <= KEEP.sessions &&
    state.mockExams.length <= KEEP.mockExams &&
    state.readinessHistory.length <= KEEP.readinessHistory &&
    state.tutorThreads.length <= KEEP.tutorThreads &&
    state.tutorThreads.every((t) => t.messages.length <= KEEP.tutorMessagesPerThread) &&
    usageKeys.length <= KEEP.dailyUsageDays;
  if (withinCaps) return state;

  const recentUsage = usageKeys.sort().slice(-KEEP.dailyUsageDays);
  return {
    ...state,
    attempts: state.attempts.slice(-KEEP.attempts),
    scenarioAttempts: state.scenarioAttempts.slice(-KEEP.scenarioAttempts),
    sessions: state.sessions.slice(-KEEP.sessions),
    mockExams: state.mockExams.slice(-KEEP.mockExams),
    readinessHistory: state.readinessHistory.slice(-KEEP.readinessHistory),
    // Threads are newest-first; messages are oldest-first within a thread.
    tutorThreads: state.tutorThreads
      .slice(0, KEEP.tutorThreads)
      .map((t) =>
        t.messages.length > KEEP.tutorMessagesPerThread
          ? { ...t, messages: t.messages.slice(-KEEP.tutorMessagesPerThread) }
          : t,
      ),
    dailyUsage: Object.fromEntries(recentUsage.map((k) => [k, state.dailyUsage[k]])),
  };
}

// Last JSON this tab wrote. Skipping identical writes keeps two tabs from
// ping-ponging storage events at each other after one adopts the other's
// state (the storage event only fires in OTHER tabs, and only on change).
let lastWritten: string | null = null;

export function saveState(state: UserState) {
  if (typeof window === "undefined") return;
  try {
    const json = JSON.stringify(pruneState(state));
    if (json === lastWritten) return;
    window.localStorage.setItem(STORAGE_KEY, json);
    lastWritten = json;
  } catch {
    /* quota / private mode — ignore */
  }
}

/** Whole days between two yyyy-mm-dd keys (b - a). */
export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / 86400000);
}

/**
 * Streak update with a Headspace-style forgiveness mechanic:
 * a missed day can be bridged once a week using a "freeze".
 */
export function touchStreak(streak: Streak, now = new Date()): Streak {
  const today = todayKey(now);
  const week = isoWeekKey(now);

  // Refresh the weekly freeze allowance.
  let freezesRemaining = streak.freezesRemaining;
  let freezeRefreshedWeek = streak.freezeRefreshedWeek;
  if (freezeRefreshedWeek !== week) {
    freezesRemaining = 1;
    freezeRefreshedWeek = week;
  }

  if (!streak.lastStudyDate) {
    return { ...streak, current: 1, longest: Math.max(1, streak.longest), lastStudyDate: today, freezesRemaining, freezeRefreshedWeek };
  }

  const gap = daysBetween(streak.lastStudyDate, today);
  let current = streak.current;

  if (gap === 0) {
    // already counted today
  } else if (gap === 1) {
    current += 1;
  } else if (gap === 2 && freezesRemaining > 0) {
    // bridge the single missed day with a freeze
    current += 1;
    freezesRemaining -= 1;
  } else {
    current = 1;
  }

  return {
    current,
    longest: Math.max(streak.longest, current),
    lastStudyDate: today,
    freezesRemaining,
    freezeRefreshedWeek,
  };
}

/**
 * Lifetime usage across every recorded day. The free plan is a once-off
 * trial (`reset: "trial"` in plans.ts), so its caps count against this, not
 * against a single day.
 */
export function totalUsage(state: UserState): Omit<DailyUsage, "date"> {
  const sum = { flashcards: 0, questions: 0, tutor: 0, scenarios: 0 };
  for (const day of Object.values(state.dailyUsage)) {
    sum.flashcards += day.flashcards;
    sum.questions += day.questions;
    sum.tutor += day.tutor;
    sum.scenarios += day.scenarios;
  }
  return sum;
}

export function getTodayUsage(state: UserState, now = new Date()): DailyUsage {
  const key = todayKey(now);
  return (
    state.dailyUsage[key] ?? {
      date: key,
      flashcards: 0,
      questions: 0,
      tutor: 0,
      scenarios: 0,
    }
  );
}
