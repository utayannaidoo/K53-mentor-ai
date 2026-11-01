import type { NotificationType } from "@/lib/notify/templates";

/**
 * Which study nudge the daily cron sends, and how often. Pure, so the cadence
 * can be tested by replaying a month of cron runs (tests/nudge-cap.test.ts)
 * rather than trusted from a comment.
 */

/**
 * Weekly, for someone who has been away 7+ days. Just under seven days rather
 * than exactly: the cron runs once a day, last week's ledger row is stamped
 * after last week's run started, and cron start times drift by minutes — so a
 * full 168h gap is often just short at this week's run and slips to day 8.
 * Anything over six days still rules out a second send in the same week.
 */
export const WEEKLY_HOURS = 7 * 24 - 12;

/** Per-type minimum gap between sends to the same user, in hours. */
export const COOLDOWN_HOURS: Record<NotificationType, number> = {
  streak_risk: 20,
  due_review: 48,
  dormant_3d: 7 * 24,
  dormant_7d: WEEKLY_HOURS,
};

/**
 * Days away after which nobody gets a study nudge at all.
 *
 * The weekly email used to repeat for as long as the account existed, so people
 * who left in August were still getting it every week in October, along with
 * the QA and review accounts. Someone a month gone has had their answer; more
 * mail after that is what spam filters learn from, and the cost lands on the
 * learners who are still studying. Coming back resets it, because
 * `last_active_at` moves.
 *
 * Why 25: the weekly sends land around days 7, 14 and 21 away, and a fourth
 * would land around day 28. Each can move a day either way with the time of day
 * they were last seen and where in its hour the cron fires, so the third can
 * come as late as day 22 and a fourth as early as day 27. 25 sits between
 * them, so that drift can neither drop the third send nor let a fourth through.
 */
export const DORMANT_STOP_DAYS = 25;

export interface NudgeState {
  /** Whole days since `profiles.last_active_at`. */
  inactiveDays: number;
  /** SAST date key (YYYY-MM-DD) of the last study day, if any. */
  lastStudy: string | null;
  streak: number;
  /** Flashcards are past due right now. */
  dueNow: boolean;
  /** SAST date keys for this run. */
  today: string;
  yesterday: string;
}

/**
 * At most one nudge per user per run, by priority:
 *   1. streak_risk  — studied yesterday but not today, streak >= 2
 *   2. dormant_7d   — away 7–24 days, once a week: three sends, then nothing
 *   3. dormant_3d   — away 3–6 days
 *   4. due_review   — active recently, but has flashcards past due today
 *
 * Past DORMANT_STOP_DAYS it is null rather than falling through to
 * due_review, which would otherwise take over every other day once the weekly
 * email stopped.
 */
export function pickNudge(state: NudgeState): NotificationType | null {
  const { inactiveDays, lastStudy, streak, dueNow, today, yesterday } = state;
  if (lastStudy === yesterday && streak >= 2) return "streak_risk";
  if (inactiveDays >= DORMANT_STOP_DAYS) return null;
  if (inactiveDays >= 7) return "dormant_7d";
  if (inactiveDays >= 3) return "dormant_3d";
  if (lastStudy !== today && dueNow) return "due_review";
  return null;
}
