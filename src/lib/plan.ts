import type { CategoryId, Flashcard, UserState } from "@/types";
import { FLASHCARDS } from "@/lib/content/flashcards";
import { SCENARIOS } from "@/lib/content/scenarios";
import { isDue } from "@/lib/srs/sm2";
import { getTodayUsage } from "@/lib/store/local-store";
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
  return FLASHCARDS.filter((f) => isDue(state.cardStates[f.id], now)).length;
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
  let pool = FLASHCARDS;
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
 * Generate today's personalised plan. Anchored to a "10 minutes a day" feel:
 * due flashcards, targeted practice on the weakest category, and a scenario.
 */
export function generateTodayPlan(
  state: UserState,
  readiness: ReadinessBreakdown,
  now = new Date(),
): PlanTask[] {
  const tasks: PlanTask[] = [];

  const due = countDueFlashcards(state, now);
  const flashTarget = Math.min(Math.max(due, 6), 15);
  tasks.push({
    id: "task-flashcards",
    type: "flashcards",
    title: `${flashTarget} flashcards due`,
    subtitle: due > 0 ? "Spaced repetition keeps these fresh" : "Build your first review deck",
    targetCount: flashTarget,
    estMinutes: 4,
    href: "/study/flashcards",
  });

  const weakest = readiness.weakCategories[0];
  if (weakest) {
    tasks.push({
      id: "task-questions",
      type: "questions",
      title: `Practice: ${categoryName(weakest)}`,
      subtitle: `Your weakest area at ${readiness.perCategory[weakest]}% — let's close the gap`,
      targetCount: 8,
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
      targetCount: 8,
      estMinutes: 5,
      href: "/study/questions",
    });
  }

  const scenario = SCENARIOS.find((s) => !weakest || s.categoryId === weakest) ?? SCENARIOS[0];
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
    default:
      return false;
  }
}
