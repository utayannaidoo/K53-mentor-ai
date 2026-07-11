import type { UserState } from "@/types";
import { totalUsage } from "@/lib/store/local-store";
import { PLAN_MAP } from "@/lib/billing/plans";

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

/** How many of a free pool remain (lifetime — free never resets). */
export function poolRemaining(state: UserState, pool: TrialPool): number {
  return Math.max(0, POOL_CAP[pool] - totalUsage(state)[pool]);
}

/**
 * Whether the free once-off trial is FULLY used up — every metered pool
 * spent. A single empty pool is not "trial done"; the others still work.
 */
export function trialExhausted(state: UserState): boolean {
  if (state.tier !== "free") return false;
  return (["questions", "flashcards", "tutor"] as TrialPool[]).every(
    (p) => poolRemaining(state, p) <= 0,
  );
}
