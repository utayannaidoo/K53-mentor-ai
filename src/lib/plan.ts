import type { CategoryId, Flashcard, StudyFrequency, UserState } from "@/types";
import { FLASHCARDS } from "@/lib/content/flashcards";
import { SCENARIOS } from "@/lib/content/scenarios";
import { forCode } from "@/lib/content/vehicle";
import { isDue } from "@/lib/srs/sm2";
import { getTodayUsage, todayKey } from "@/lib/store/local-store";
import { PLAN_MAP } from "@/lib/billing/plans";
import { categoryName } from "@/lib/content/categories";
import type { ReadinessBreakdown } from "@/lib/diagnostic/scoring";
import { shuffle } from "@/lib/utils";

export type PlanTaskType = "flashcards" | "questions" | "scenario" | "mock";

export interface PlanTask {
  id: string;
  type: PlanTaskType;
  title: string;
  subtitle: string;
  targetCount: number;
  estMinutes: number;
  href: string;
  categoryId?: CategoryId;
  premium?: boolean;
}

export function countDueFlashcards(state: UserState, now = new Date()): number {
  return forCode(FLASHCARDS, state.onboarding?.vehicleCode).filter((f) =>
    isDue(state.cardStates[f.id], now),
  ).length;
}

/**
 * Studied cards that come due by end of tomorrow — the concrete "reason to
 * come back" the coach cites in session recaps. Unseen cards don't count.
 */
export function countDueTomorrow(state: UserState, now = new Date()): number {
  const end = new Date(now);
  end.setDate(end.getDate() + 1);
  end.setHours(23, 59, 59, 999);
  return forCode(FLASHCARDS, state.onboarding?.vehicleCode).filter((f) => {
    const cs = state.cardStates[f.id];
    return cs && (cs.reps > 0 || cs.lapses > 0) && new Date(cs.due) <= end;
  }).length;
}

/**
 * Build the flashcard study queue: due cards first (shuffled each session),
 * then unseen cards, optionally filtered to a category.
 */
export function selectFlashcardQueue(
  state: UserState,
  opts: { categoryId?: CategoryId; limit?: number } = {},
): Flashcard[] {
  const now = new Date();
  let pool = forCode(FLASHCARDS, state.onboarding?.vehicleCode);
  if (opts.categoryId) pool = pool.filter((f) => f.categoryId === opts.categoryId);

  // due cards (shuffled so the review order varies each session), then unseen
  const due = shuffle(
    pool.filter((f) => state.cardStates[f.id] && isDue(state.cardStates[f.id], now)),
  );
  const unseen = shuffle(pool.filter((f) => !state.cardStates[f.id]));

  const queue = [...due, ...unseen];
  return opts.limit ? queue.slice(0, opts.limit) : queue;
}

/**
 * How many full or mini mocks the learner has left: free counts lifetime
 * (the trial never resets), paid plans count today only.
 */
export function mocksRemaining(
  state: UserState,
  kind: "full" | "mini",
  now = new Date(),
): number {
  const limits = PLAN_MAP[state.tier].limits;
  const cap = kind === "full" ? limits.mockExams : limits.miniMocks;
  if (cap === "unlimited") return Infinity;
  const pool = state.mockExams.filter((m) => Boolean(m.mini) === (kind === "mini"));
  const used =
    limits.reset === "trial"
      ? pool.length
      : pool.filter((m) => m.at.slice(0, 10) === todayKey(now)).length;
  return Math.max(0, cap - used);
}

/** Days between mocks before the predictor is considered stale. */
export const RETEST_INTERVAL_DAYS = 7;

/**
 * Whether a mock exam is "due": never taken (once there's enough practice for
 * one to be meaningful), or the last one is old enough that the pass
 * prediction has gone stale. Nothing else in the app tells the learner *when*
 * to re-test — this feeds that nudge into the daily plan.
 */
export function mockRetestStatus(
  state: UserState,
  now = new Date(),
): { due: boolean; daysSince: number | null } {
  const last = state.mockExams[state.mockExams.length - 1];
  if (!last) {
    return { due: state.attempts.length >= 30, daysSince: null };
  }
  const daysSince = Math.floor((now.getTime() - Date.parse(last.at)) / 86_400_000);
  return { due: daysSince >= RETEST_INTERVAL_DAYS, daysSince };
}

/**
 * Which category today's plan should target, and whether that came from real
 * performance data or the learner's self-reported worry (onboarding).
 *
 * With no attempts or flashcard reps recorded yet, every category ties at the
 * same baseline score, so readiness.weakCategories isn't a real signal — fall
 * back to the worry category instead. The moment any real signal exists, it wins.
 */
export function planFocus(
  state: UserState,
  readiness: ReadinessBreakdown,
): { categoryId: CategoryId | null; fromWorry: boolean } {
  const hasSignal =
    state.attempts.length > 0 || Object.values(state.cardStates).some((c) => c.reps > 0);
  if (hasSignal) return { categoryId: readiness.weakCategories[0] ?? null, fromWorry: false };
  const worried = state.onboarding?.worryCategories?.[0] ?? null;
  return { categoryId: worried, fromWorry: Boolean(worried) };
}

/**
 * Generate today's personalised plan. Anchored to a "10 minutes a day" feel:
 * due flashcards, targeted practice on the weakest category, and a scenario.
 */
/**
 * Session sizing per self-reported study rhythm (onboarding step 6). "Casual"
 * keeps sessions genuinely short; "intense" fills the tank. Exported for tests.
 */
export const SIZE_BY_FREQUENCY: Record<
  StudyFrequency,
  { flashMin: number; flashMax: number; questions: number }
> = {
  casual: { flashMin: 4, flashMax: 10, questions: 6 },
  steady: { flashMin: 6, flashMax: 15, questions: 8 },
  intense: { flashMin: 8, flashMax: 20, questions: 12 },
};

export function generateTodayPlan(
  state: UserState,
  readiness: ReadinessBreakdown,
  now = new Date(),
): PlanTask[] {
  const tasks: PlanTask[] = [];
  const size = SIZE_BY_FREQUENCY[state.onboarding?.studyFrequency ?? "steady"];

  const due = countDueFlashcards(state, now);
  const flashTarget = Math.min(Math.max(due, size.flashMin), size.flashMax);
  tasks.push({
    id: "task-flashcards",
    type: "flashcards",
    title: `${flashTarget} flashcards due`,
    subtitle: due > 0 ? "Spaced repetition keeps these fresh" : "Build your first review deck",
    targetCount: flashTarget,
    estMinutes: 4,
    href: "/study/flashcards",
  });

  const focus = planFocus(state, readiness);
  const weakest = focus.categoryId;
  const hasSignal = !focus.fromWorry && weakest !== null;
  if (weakest) {
    tasks.push({
      id: "task-questions",
      type: "questions",
      title: `Practice: ${categoryName(weakest)}`,
      subtitle: hasSignal
        ? `Your weakest area at ${readiness.perCategory[weakest]}% — let's close the gap`
        : "You told us this one worries you most — let's start here",
      targetCount: size.questions,
      estMinutes: 5,
      href: `/study/questions?category=${weakest}`,
      categoryId: weakest,
    });
  } else {
    tasks.push({
      id: "task-questions",
      type: "questions",
      title: "Practice questions",
      subtitle: "Mixed practice across all categories",
      targetCount: size.questions,
      estMinutes: 5,
      href: "/study/questions",
    });
  }

  const scenarioPool = forCode(SCENARIOS, state.onboarding?.vehicleCode);
  const scenario = scenarioPool.find((s) => !weakest || s.categoryId === weakest) ?? scenarioPool[0];
  tasks.push({
    id: "task-scenario",
    type: "scenario",
    title: "1 scenario challenge",
    subtitle: scenario ? scenario.title : "Situational judgement practice",
    targetCount: 1,
    estMinutes: 3,
    href: "/study/scenarios",
    categoryId: scenario?.categoryId,
    premium: true,
  });

  const retest = mockRetestStatus(state, now);
  if (retest.due) {
    tasks.push({
      id: "task-mock",
      type: "mock",
      title:
        retest.daysSince === null
          ? "Your first mock exam"
          : `Mock retest — it's been ${retest.daysSince} days`,
      subtitle: "Recalibrates your pass prediction. Short on time? A mini mock counts.",
      targetCount: 1,
      estMinutes: 15,
      href: "/study/mock-exam",
    });
  }

  return tasks;
}

/** Whether a plan task is satisfied by today's recorded usage. */
export function isTaskDone(task: PlanTask, state: UserState, now = new Date()): boolean {
  const usage = getTodayUsage(state, now);
  switch (task.type) {
    case "flashcards":
      return usage.flashcards >= task.targetCount;
    case "questions":
      return usage.questions >= task.targetCount;
    case "scenario":
      return usage.scenarios >= task.targetCount;
    case "mock": {
      // A full mock records an exam entry; a mini mock records only
      // mock-context attempts — either counts as re-testing today.
      const today = todayKey(now);
      return (
        state.mockExams.some((m) => m.at.slice(0, 10) === today) ||
        state.attempts.some((a) => a.context === "mock" && a.at.slice(0, 10) === today)
      );
    }
    default:
      return false;
  }
}
