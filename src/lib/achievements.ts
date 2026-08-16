import type { CategoryId, UserState } from "@/types";
import { CATEGORIES } from "@/lib/content/categories";
import { QUESTION_DIFFICULTY } from "@/lib/content/meta";
import { MASTERY_STAMP_AT } from "@/lib/engagement";
import { mistakeStats } from "@/lib/learning/mistakes";
import { activeDaysFrom } from "@/lib/dashboard/day-strip";

/**
 * Achievements — the record of what a learner has actually done.
 *
 * Two rules separate this from the rank ladder in `engagement.ts` and from the
 * mastery stamps it sits beside:
 *
 * 1. **Monotonic.** A mastery stamp is derived live from `perCategory`, so it
 *    un-earns itself the moment competence dips. That is right for a map, which
 *    describes the present, and wrong for an achievement, which records the
 *    past. Every tier here is a high-water mark: `evaluateAchievements` never
 *    returns a level below the one already banked.
 * 2. **Tiers, not volume.** Thirteen families with up to four tiers each beats
 *    fifty separate icons — the learner reads one row of pips instead of
 *    scanning a wall, and a half-filled family is a clearer invitation than a
 *    locked stranger.
 *
 * The CP rule from `engagement.ts` carries over: nothing here rewards
 * attendance. `streak` is the one family that counts days, and it counts them
 * because an unbroken run is evidence of retention, not of showing up once.
 */

export type AchievementFamily = "milestone" | "mastery" | "consistency" | "craft";

export interface AchievementTier {
  /** The `measure` value at which this tier is earned. */
  threshold: number;
  name: string;
}

export interface Achievement {
  id: string;
  family: AchievementFamily;
  /** Base name. The earned tier's `name` qualifies it in the UI. */
  name: string;
  /** What earns the next tier — shown while locked, so aspiration is legible. */
  description: string;
  /** Lucide icon name, resolved by the grid. Kept as a string so this module stays renderer-free. */
  icon: string;
  /** Ascending by threshold. */
  tiers: AchievementTier[];
}

/**
 * Everything the measures read, derived once per evaluation.
 *
 * A struct rather than `UserState` directly because several measures are
 * O(attempts) and three of them want the same grouping; building it once keeps
 * a single evaluation linear in the log rather than quadratic.
 */
export interface AchievementInputs {
  /** Full mocks passed (not mini, not drill). */
  fullMocksPassed: number;
  /** Any mock attempt, including mini and drill. */
  mocksTaken: number;
  /** Categories at or above the stamp mark right now. */
  stamped: number;
  longestStreak: number;
  /** Questions actually answered — blanks in a timed mock are not attempts. */
  answered: number;
  /** A mock section answered perfectly. */
  perfectSections: number;
  /** Difficulty-3 questions answered correctly on the first ever attempt. */
  hardFirstTry: number;
  /** Cards recalled at an interval of three weeks or more. */
  longRecall: number;
  /** Distinct days the mistake notebook was emptied. */
  clearSlates: number;
  /** Returns to study after a gap of a week or more. */
  comebacks: number;
  scenariosCorrect: number;
  /** Categories with at least one attempt. */
  categoriesTouched: number;
  /** The real licence — granted, never computed. */
  licensed: number;
}

/** Gap, in days, after which coming back counts as a comeback. */
export const COMEBACK_GAP_DAYS = 7;
/** Interval, in days, at which a recall counts as long-term. */
export const LONG_RECALL_DAYS = 21;
/** Difficulty at which a question counts as hard. */
export const HARD_DIFFICULTY = 3;

export const ACHIEVEMENTS: Achievement[] = [
  // ── Milestones ─────────────────────────────────────────────
  {
    id: "first_mock",
    family: "milestone",
    name: "Sat the paper",
    description: "Finish a mock exam of any length.",
    icon: "FileText",
    tiers: [{ threshold: 1, name: "Earned" }],
  },
  {
    id: "mock_pass",
    family: "milestone",
    name: "Passed the mock",
    description: "Pass a full 64-question mock exam.",
    icon: "Award",
    tiers: [
      { threshold: 1, name: "Once" },
      { threshold: 3, name: "Three times" },
      { threshold: 10, name: "Ten times" },
    ],
  },
  {
    id: "road_scholar",
    family: "milestone",
    name: "Every category",
    description: "Answer at least one question in every category.",
    icon: "Map",
    tiers: [{ threshold: CATEGORIES.length, name: "Earned" }],
  },
  {
    id: "licensed",
    family: "milestone",
    name: "Licence achieved",
    description: "Pass the real learner's test. This one is not ours to give.",
    icon: "BadgeCheck",
    tiers: [{ threshold: 1, name: "Earned" }],
  },

  // ── Mastery ────────────────────────────────────────────────
  {
    id: "stamps",
    family: "mastery",
    name: "Stamped",
    description: `Hold a category at ${MASTERY_STAMP_AT}% or better.`,
    icon: "Stamp",
    tiers: [
      { threshold: 1, name: "One category" },
      { threshold: 3, name: "Three" },
      { threshold: 6, name: "Six" },
      { threshold: CATEGORIES.length, name: "The full passport" },
    ],
  },
  {
    id: "volume",
    family: "mastery",
    name: "Distance covered",
    description: "Answer questions. Any questions.",
    icon: "Route",
    tiers: [
      { threshold: 100, name: "100 answered" },
      { threshold: 500, name: "500 answered" },
      { threshold: 1000, name: "1 000 answered" },
      { threshold: 2500, name: "2 500 answered" },
    ],
  },
  {
    id: "long_recall",
    family: "mastery",
    name: "Long memory",
    description: `Recall a card scheduled ${LONG_RECALL_DAYS} days out or more.`,
    icon: "Brain",
    tiers: [
      { threshold: 10, name: "10 cards" },
      { threshold: 50, name: "50 cards" },
    ],
  },

  // ── Consistency ────────────────────────────────────────────
  {
    id: "streak",
    family: "consistency",
    name: "Kept the run",
    description: "Study on consecutive days.",
    icon: "Flame",
    tiers: [
      { threshold: 3, name: "3 days" },
      { threshold: 7, name: "A week" },
      { threshold: 14, name: "A fortnight" },
      { threshold: 30, name: "A month" },
    ],
  },
  {
    id: "comeback",
    family: "consistency",
    name: "Came back",
    description: `Return to studying after ${COMEBACK_GAP_DAYS} days away.`,
    icon: "Undo2",
    tiers: [
      { threshold: 1, name: "Once" },
      { threshold: 3, name: "Three times" },
    ],
  },
  {
    id: "clean_slate",
    family: "consistency",
    name: "Clean slate",
    description: "Empty the mistake notebook — every wrong answer re-earned.",
    icon: "Eraser",
    tiers: [
      { threshold: 1, name: "Once" },
      { threshold: 3, name: "Three times" },
    ],
  },

  // ── Craft ──────────────────────────────────────────────────
  {
    id: "sharp",
    family: "craft",
    name: "Sharp eye",
    description: "Answer the hardest questions correctly on the first attempt.",
    icon: "Crosshair",
    tiers: [
      { threshold: 10, name: "10 first-try" },
      { threshold: 50, name: "50 first-try" },
      { threshold: 150, name: "150 first-try" },
    ],
  },
  {
    id: "clean_sheet",
    family: "craft",
    name: "Clean sheet",
    description: "Answer every question in one mock section correctly.",
    icon: "CheckCheck",
    tiers: [
      { threshold: 1, name: "Once" },
      { threshold: 5, name: "Five times" },
    ],
  },
  {
    id: "judgement",
    family: "craft",
    name: "Road sense",
    description: "Call the right move in observation scenarios.",
    icon: "Eye",
    tiers: [
      { threshold: 10, name: "10 correct" },
      { threshold: 50, name: "50 correct" },
    ],
  },
];

export const ACHIEVEMENT_BY_ID: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);

/** Highest tier index earned at this measure, or -1 for none. */
export function tierFor(achievement: Achievement, value: number): number {
  let earned = -1;
  for (let i = 0; i < achievement.tiers.length; i++) {
    if (value >= achievement.tiers[i].threshold) earned = i;
  }
  return earned;
}

/**
 * Every measure, in one pass over each log.
 *
 * `perCategory` is passed in rather than recomputed: the only caller already
 * holds a `computeReadiness` breakdown, and readiness walks the whole attempt
 * log. `licensed` is passed for a different reason — the final rank is reserved
 * for the real test and cannot be reached inside the app (see
 * LICENCE_RANK_INDEX), so the achievement mirroring it is granted, never earned.
 */
export function achievementInputs(
  state: UserState,
  perCategory: Record<CategoryId, number>,
  licensed = false,
): AchievementInputs {
  const attempted = state.attempts.filter((a) => a.selectedIndex >= 0);

  // First-ever attempt per question, in chronological order — `hardFirstTry`
  // must not credit a question drilled until it stuck.
  const seen = new Set<string>();
  let hardFirstTry = 0;
  const touched = new Set<CategoryId>();
  for (const a of [...attempted].sort((x, y) => x.at.localeCompare(y.at))) {
    touched.add(a.categoryId);
    if (seen.has(a.questionId)) continue;
    seen.add(a.questionId);
    if (a.correct && (QUESTION_DIFFICULTY[a.questionId] ?? 1) >= HARD_DIFFICULTY) {
      hardFirstTry += 1;
    }
  }

  let perfectSections = 0;
  for (const m of state.mockExams) {
    for (const score of Object.values(m.perCategory)) {
      if (score && score.total > 0 && score.correct === score.total) perfectSections += 1;
    }
  }

  const longRecall = Object.values(state.cardStates).filter(
    (c) => c.reps > 0 && c.intervalDays >= LONG_RECALL_DAYS,
  ).length;

  // A comeback is a gap in the study-day sequence, not `pendingComeback` — that
  // field is cleared on dismissal, so counting it would lose every earlier one.
  const days = [...activeDaysFrom([state.sessions, attempted])].sort();
  let comebacks = 0;
  for (let i = 1; i < days.length; i++) {
    const gap = Math.round(
      (Date.parse(`${days[i]}T00:00:00Z`) - Date.parse(`${days[i - 1]}T00:00:00Z`)) / 86_400_000,
    );
    if (gap >= COMEBACK_GAP_DAYS) comebacks += 1;
  }

  // The notebook is clean when something has been missed and nothing is open.
  // A standing state rather than a history: the attempt log can prove the
  // notebook is empty now, but not how many times it has been emptied before —
  // and the banked tier makes the distinction moot, since it never un-earns.
  const mistakes = mistakeStats(state);
  const clearSlates = mistakes.everMissed > 0 && mistakes.open === 0 ? 1 : 0;

  return {
    fullMocksPassed: state.mockExams.filter((m) => m.passed && !m.mini && !m.drill).length,
    mocksTaken: state.mockExams.length,
    stamped: CATEGORIES.filter((c) => (perCategory[c.id] ?? 0) >= MASTERY_STAMP_AT).length,
    longestStreak: state.streak.longest,
    answered: attempted.length,
    perfectSections,
    hardFirstTry,
    longRecall,
    clearSlates,
    comebacks,
    scenariosCorrect: state.scenarioAttempts.filter((s) => s.correct).length,
    categoriesTouched: touched.size,
    licensed: licensed ? 1 : 0,
  };
}

/** The measure each achievement reads. Kept beside the list so a new family needs one edit. */
const MEASURE: Record<string, (i: AchievementInputs) => number> = {
  first_mock: (i) => i.mocksTaken,
  mock_pass: (i) => i.fullMocksPassed,
  road_scholar: (i) => i.categoriesTouched,
  licensed: (i) => i.licensed,
  stamps: (i) => i.stamped,
  volume: (i) => i.answered,
  long_recall: (i) => i.longRecall,
  streak: (i) => i.longestStreak,
  comeback: (i) => i.comebacks,
  clean_slate: (i) => i.clearSlates,
  sharp: (i) => i.hardFirstTry,
  clean_sheet: (i) => i.perfectSections,
  judgement: (i) => i.scenariosCorrect,
};

export interface AchievementUnlock {
  id: string;
  tier: number;
}

/**
 * Fold the current measures into the banked high-water map.
 *
 * Returns the same object identity for `next` when nothing changed, so callers
 * can skip a state write — this runs after every answered question.
 */
export function evaluateAchievements(
  inputs: AchievementInputs,
  earned: Record<string, number>,
): { next: Record<string, number>; newly: AchievementUnlock[] } {
  const newly: AchievementUnlock[] = [];
  let next = earned;

  for (const achievement of ACHIEVEMENTS) {
    const measure = MEASURE[achievement.id];
    if (!measure) continue;
    const tier = tierFor(achievement, measure(inputs));
    if (tier < 0) continue;
    const banked = earned[achievement.id] ?? -1;
    if (tier <= banked) continue; // monotonic — a dip never revokes
    if (next === earned) next = { ...earned };
    next[achievement.id] = tier;
    newly.push({ id: achievement.id, tier });
  }

  return { next, newly };
}

export interface AchievementView {
  achievement: Achievement;
  /** Highest tier earned, or -1 if locked. */
  tier: number;
  /** Current raw measure. */
  value: number;
  /** The tier being worked toward, or null when maxed. */
  nextTier: AchievementTier | null;
  /** 0–1 toward `nextTier`. */
  progress: number;
  earned: boolean;
  maxed: boolean;
}

/**
 * Every achievement with its banked tier and its progress toward the next —
 * the shape the grid renders and the "next up" band picks its subject from.
 */
export function achievementViews(
  inputs: AchievementInputs,
  earned: Record<string, number>,
): AchievementView[] {
  return ACHIEVEMENTS.map((achievement) => {
    const value = MEASURE[achievement.id]?.(inputs) ?? 0;
    const tier = earned[achievement.id] ?? -1;
    const nextIndex = tier + 1;
    const nextTier = achievement.tiers[nextIndex] ?? null;
    const floor = tier >= 0 ? achievement.tiers[tier].threshold : 0;
    const span = nextTier ? Math.max(1, nextTier.threshold - floor) : 1;
    return {
      achievement,
      tier,
      value,
      nextTier,
      progress: nextTier ? Math.min(1, Math.max(0, (value - floor) / span)) : 1,
      earned: tier >= 0,
      maxed: !nextTier,
    };
  });
}

/**
 * The one achievement worth naming above the grid: closest to its next tier,
 * among those actually started. Ties break toward the shorter remaining gap so
 * the band never suggests a 2 500-question haul over a two-day streak.
 */
export function nextUpAchievement(views: AchievementView[]): AchievementView | null {
  const candidates = views.filter((v) => !v.maxed && v.value > 0);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, v) => (v.progress > best.progress ? v : best));
}
