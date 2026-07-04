import type { CardState, SrsRating, UserState } from "@/types";
import { QUESTIONS_BY_ID } from "@/lib/content/questions";

/**
 * Confidence Points (CP) & Driver Rank — the game layer over real competence.
 *
 * Design rule (docs/growth/engagement-research.md): CP rewards correct,
 * difficulty-weighted, retention-proving work. It never rewards attendance,
 * never punishes mistakes (a wrong answer just earns 0), and grinding an
 * already-known item pays a fraction of first-time mastery.
 */

// ── Confidence Points ────────────────────────────────────────

/** CP for a question answer: 2/4/6 by difficulty, doubled on first-ever correct. */
export function questionCp(questionId: string, correct: boolean, firstCorrect: boolean): number {
  if (!correct) return 0;
  const difficulty = QUESTIONS_BY_ID[questionId]?.difficulty ?? 1;
  const base = 2 * difficulty;
  return firstCorrect ? base * 2 : base;
}

/** Whether no prior correct attempt exists for this question. */
export function isFirstCorrect(attempts: { questionId: string; correct: boolean }[], questionId: string): boolean {
  return !attempts.some((a) => a.questionId === questionId && a.correct);
}

/**
 * CP for a flashcard review, scaled by the interval the recall just proved:
 * remembering something scheduled 3 weeks out is worth triple a fresh card.
 */
export function flashcardCp(prev: CardState, rating: SrsRating): number {
  if (rating === "again") return 0;
  if (rating === "hard") return 1;
  if (prev.intervalDays >= 21) return 6;
  if (prev.intervalDays >= 6) return 4;
  return 2;
}

export const SCENARIO_CP = 4;
export const DIAGNOSTIC_CP = 15;
export const MOCK_COMPLETION_CP = 20;
export const MOCK_PASS_BONUS_CP = 30;
export const PLAN_COMPLETE_CP = 15;

/**
 * Retroactive CP for pre-CP saves (endowed progress: existing users open the
 * app to find their past work already banked). Replays question/scenario/mock
 * history through the live rules; flashcards lack review history, so each
 * studied card grants mastery/10 as an approximation.
 */
export function endowCp(
  state: Pick<UserState, "attempts" | "scenarioAttempts" | "mockExams" | "diagnostics" | "cardStates">,
): number {
  let cp = 0;
  const seenCorrect = new Set<string>();
  for (const a of state.attempts) {
    if (!a.correct) continue;
    cp += questionCp(a.questionId, true, !seenCorrect.has(a.questionId));
    seenCorrect.add(a.questionId);
  }
  for (const s of state.scenarioAttempts) if (s.correct) cp += SCENARIO_CP;
  for (const m of state.mockExams) cp += MOCK_COMPLETION_CP + (m.passed ? MOCK_PASS_BONUS_CP : 0);
  cp += state.diagnostics.length * DIAGNOSTIC_CP;
  for (const c of Object.values(state.cardStates)) {
    if (c.reps > 0 || c.lapses > 0) cp += Math.round(c.mastery / 10);
  }
  return cp;
}

// ── Driver Rank — the Road to Licence ────────────────────────

export interface DriverRank {
  id: string;
  name: string;
  /** CP gate. */
  cp: number;
  /** Optional readiness gate (0–100). */
  readiness?: number;
  /** Requires at least one passed mock exam. */
  passedMock?: boolean;
  tagline: string;
}

/**
 * The final rank is reserved for passing the real test — it can't be reached
 * through the gates here (see LICENCE_RANK_INDEX), only granted explicitly.
 */
export const RANKS: DriverRank[] = [
  { id: "garage", name: "Garage", cp: 0, tagline: "Everyone starts here." },
  { id: "learner", name: "Learner Driver", cp: 150, tagline: "The basics are settling in." },
  { id: "confident", name: "Confident Driver", cp: 500, readiness: 45, tagline: "You're reading the road, not guessing." },
  { id: "road_ready", name: "Road Ready", cp: 1200, readiness: 65, tagline: "Most of the paper holds no surprises." },
  { id: "test_ready", name: "Test-Day Ready", cp: 2200, readiness: 80, passedMock: true, tagline: "You'd pass if the test were tomorrow." },
  { id: "licensed", name: "Licence Achieved", cp: Number.MAX_SAFE_INTEGER, tagline: "The real thing. See you on the road." },
];

export const LICENCE_RANK_INDEX = RANKS.length - 1;

export interface RankInputs {
  cp: number;
  readiness: number;
  hasPassedMock: boolean;
}

function qualifies(rank: DriverRank, s: RankInputs): boolean {
  if (s.cp < rank.cp) return false;
  if (rank.readiness != null && s.readiness < rank.readiness) return false;
  if (rank.passedMock && !s.hasPassedMock) return false;
  return true;
}

/** Highest earnable rank index for the current stats (never the licence rank). */
export function computeRankIndex(s: RankInputs): number {
  let idx = 0;
  for (let i = 1; i < LICENCE_RANK_INDEX; i++) {
    if (qualifies(RANKS[i], s)) idx = i;
  }
  return idx;
}

export interface RankProgress {
  current: DriverRank;
  next: DriverRank | null;
  /** 0–1 CP progress from the current gate toward the next. */
  cpPct: number;
  /** Human hints for gates the CP bar can't show (readiness / mock). */
  unmet: string[];
  /** 0–1 position along the whole road (for the car). */
  journeyPct: number;
}

export function rankProgress(achievedIndex: number, s: RankInputs): RankProgress {
  const current = RANKS[Math.min(achievedIndex, LICENCE_RANK_INDEX)];
  const nextIndex = achievedIndex + 1;
  if (nextIndex > LICENCE_RANK_INDEX) {
    return { current, next: null, cpPct: 1, unmet: [], journeyPct: 1 };
  }
  const next = RANKS[nextIndex];

  const span = Math.max(1, next.cp - current.cp);
  const cpPct =
    nextIndex === LICENCE_RANK_INDEX
      ? 1 // the last stretch isn't a CP grind — it's the real test
      : Math.min(1, Math.max(0, (s.cp - current.cp) / span));

  const unmet: string[] = [];
  if (nextIndex === LICENCE_RANK_INDEX) {
    unmet.push("Pass your real learner's test");
  } else {
    if (s.cp < next.cp) unmet.push(`${next.cp - s.cp} CP to go`);
    if (next.readiness != null && s.readiness < next.readiness) {
      unmet.push(`readiness ${s.readiness}% → ${next.readiness}%`);
    }
    if (next.passedMock && !s.hasPassedMock) unmet.push("pass one full mock exam");
  }

  return {
    current,
    next,
    cpPct,
    unmet,
    journeyPct: Math.min(1, (achievedIndex + cpPct) / LICENCE_RANK_INDEX),
  };
}

// ── Mastery stamps ───────────────────────────────────────────

/** Sustained competence needed before a category counts as mastered (stamped). */
export const MASTERY_STAMP_AT = 90;
