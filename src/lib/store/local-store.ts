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
        hasPassedMock: merged.mockExams.some((m) => m.passed),
      });
      merged.pendingRankUp = null;
      merged.version = STATE_VERSION;
    }
    return merged;
  } catch {
    return defaultUserState();
  }
}

export function saveState(state: UserState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
