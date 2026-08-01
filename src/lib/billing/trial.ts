import type { UserState } from "@/types";
import { getTodayUsage } from "@/lib/store/local-store";
import { PLAN_MAP, FREE_TRIAL_DAYS } from "@/lib/billing/plans";

export type TrialPool = "questions" | "flashcards" | "tutor";

const POOL_CAP: Record<TrialPool, number> = {
  questions:
    typeof PLAN_MAP.free.limits.questions === "number" ? PLAN_MAP.free.limits.questions : Infinity,
  flashcards:
    typeof PLAN_MAP.free.limits.flashcards === "number" ? PLAN_MAP.free.limits.flashcards : Infinity,
  tutor:
    typeof PLAN_MAP.free.limits.tutorMessages === "number"
      ? PLAN_MAP.free.limits.tutorMessages
      : Infinity,
};

export const POOL_NOUN: Record<TrialPool, string> = {
  questions: "practice questions",
  flashcards: "flashcards",
  tutor: "tutor messages",
};

export const POOL_HREF: Record<TrialPool, string> = {
  questions: "/study/questions",
  flashcards: "/study/flashcards",
  tutor: "/tutor",
};

const DAY_MS = 86_400_000;

/**
 * When the free week started. Onboarding is the moment the learner actually
 * began, so it beats account creation (a Google sign-in can predate the wizard).
 * Falls back through the first thing that proves they were here.
 */
function trialStartedAt(state: UserState): number | null {
  const candidates = [
    state.onboarding?.completedAt,
    state.diagnostics[0]?.at,
    state.profile?.createdAt,
  ].filter((v): v is string => typeof v === "string" && v.length > 0);

  const times = candidates.map((c) => Date.parse(c)).filter((t) => Number.isFinite(t));
  return times.length ? Math.min(...times) : null;
}

/**
 * Whole days left in the free week — `FREE_TRIAL_DAYS` on day one, 0 once it has
 * run out. Paid tiers are never on a clock.
 */
export function trialDaysRemaining(state: UserState, now = Date.now()): number {
  if (state.tier !== "free") return Infinity;
  const days = PLAN_MAP.free.limits.trialDays ?? FREE_TRIAL_DAYS;
  const started = trialStartedAt(state);
  // Nothing to anchor on yet (fresh device, wizard not finished) — treat the
  // week as untouched rather than expired. Never wall someone by accident.
  if (started === null) return days;
  const elapsed = Math.floor((now - started) / DAY_MS);
  return Math.max(0, days - elapsed);
}

/**
 * The free week is over. This is what "trial done" now means — not "you spent a
 * lifetime pool", but "your seven days of daily practice have run out".
 */
export function trialExhausted(state: UserState, now = Date.now()): boolean {
  if (state.tier !== "free") return false;
  return trialDaysRemaining(state, now) <= 0;
}

/**
 * How many of a free pool remain *today*. Zero once the week is up, otherwise
 * the daily cap minus today's usage — so a learner who stops at their limit
 * comes back tomorrow to a full allowance, which is the entire point.
 */
export function poolRemaining(state: UserState, pool: TrialPool, now = Date.now()): number {
  if (trialExhausted(state, now)) return 0;
  return Math.max(0, POOL_CAP[pool] - getTodayUsage(state)[pool]);
}
