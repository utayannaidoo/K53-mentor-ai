import {
  ACUITY_LEVELS,
  E_DIRECTIONS,
  EYE_STAGES,
  type EDirection,
  type EyeStage,
  type LevelOutcome,
} from "@/lib/vision/acuity";

/**
 * The tumbling-E ladder as one state machine.
 *
 * This was six `useState`s in the component, advanced together inside a
 * callback that read all of them from its render closure. Both defects that
 * produced "the number of letters changes every time, and the three eyes
 * disagree" came out of that shape:
 *
 *  - **A swallowed answer.** Arrow keys and the on-screen buttons both called
 *    the same handler, and key auto-repeat fires it many times per frame. Two
 *    calls in one render each computed `asked + 1` from the *same* stale value,
 *    so the second overwrote the first and a letter vanished from the count.
 *    A reducer applies each action to the state the previous one produced, so
 *    the level always asks exactly PER_LEVEL letters however fast you answer.
 *
 *  - **A drifting start rung.** The component measured the chart only while it
 *    was on screen, but picked the starting acuity *before* showing it — so the
 *    first eye began at 6/60 with an unmeasured stage while the second and
 *    third began wherever the now-measured stage allowed. The bounds are
 *    therefore taken once, in `start-stage`, and held for that eye: they cannot
 *    be re-derived mid-ladder by a resize, a rotation, or mobile browser chrome
 *    collapsing on scroll.
 *
 * Pure and free of React, so the invariant that matters — every eye is asked
 * the same questions under the same rules — is a unit test rather than a thing
 * you check by running the test three times and squinting.
 */

/** Letters shown per acuity level, and how many must be right to go deeper. */
export const PER_LEVEL = 4;
export const REQUIRED = 3;

export interface Trial {
  levelIndex: number;
  direction: EDirection;
  /** Degrees around the orbit centre — this is the "rotates around a point" part. */
  orbitAngle: number;
}

export type LadderStatus = "idle" | "running" | "stage-done" | "done";

export interface LadderState {
  status: LadderStatus;
  /** Index into EYE_STAGES — which of left / right / both is being read. */
  stageIndex: number;
  /**
   * Bounds for the whole attempt, locked by the first `start-stage` after a
   * reset and reused by the two eyes that follow. Per-attempt rather than
   * per-stage on purpose: it is what makes "all three eyes were asked the same
   * questions" true by construction rather than by luck of when the chart
   * happened to be measured.
   */
  startIndex: number;
  maxIndex: number;
  boundsLocked: boolean;
  levelIndex: number;
  correct: number;
  asked: number;
  /** Monotonic across the whole stage, so the orbit sweep never repeats. */
  trialNo: number;
  trial: Trial | null;
  /** The current eye's transcript. */
  outcomes: LevelOutcome[];
  /** Banked transcripts, for the results table. */
  stageOutcomes: Partial<Record<EyeStage, LevelOutcome[]>>;
  seed: number;
}

export type LadderAction =
  | { type: "reset"; seed: number }
  | { type: "start-stage"; startIndex: number; maxIndex: number }
  | { type: "answer"; dir: EDirection };

export function initialLadder(seed = 1): LadderState {
  return {
    status: "idle",
    stageIndex: 0,
    startIndex: 0,
    maxIndex: ACUITY_LEVELS.length - 1,
    boundsLocked: false,
    levelIndex: 0,
    correct: 0,
    asked: 0,
    trialNo: 0,
    trial: null,
    outcomes: [],
    stageOutcomes: {},
    seed,
  };
}

/**
 * A tiny LCG (Numerical Recipes constants).
 *
 * `Math.random()` would do the job — nothing here is adversarial, the reader
 * just must not be able to predict the next E. It lives in state instead so the
 * whole ladder is reproducible from its seed, which is what lets the tests
 * assert an exact transcript rather than a statistical one.
 */
function nextSeed(seed: number): number {
  return (seed * 1664525 + 1013904223) >>> 0;
}

function makeTrial(levelIndex: number, trialNo: number, seed: number): Trial {
  return {
    levelIndex,
    direction: E_DIRECTIONS[seed % E_DIRECTIONS.length],
    // Deterministic sweep so consecutive letters land in different places
    // without ever overlapping the previous one.
    orbitAngle: (trialNo * 137.5) % 360,
  };
}

export function ladderReducer(state: LadderState, action: LadderAction): LadderState {
  switch (action.type) {
    case "reset":
      return initialLadder(action.seed);

    case "start-stage": {
      // The first eye of an attempt fixes the ladder; the other two inherit it,
      // so a chart measured late (or remeasured differently) can never hand one
      // eye a different set of rungs than another.
      const maxIndex = state.boundsLocked ? state.maxIndex : action.maxIndex;
      // Never start below the deepest rung the screen can actually render.
      const startIndex = state.boundsLocked
        ? state.startIndex
        : Math.min(action.startIndex, action.maxIndex);
      const seed = nextSeed(state.seed);
      return {
        ...state,
        status: "running",
        startIndex,
        maxIndex,
        boundsLocked: true,
        levelIndex: startIndex,
        correct: 0,
        asked: 0,
        trialNo: 0,
        trial: makeTrial(startIndex, 0, seed),
        outcomes: [],
        seed,
      };
    }

    case "answer": {
      // The guard that makes a double-tap harmless: once a stage has been
      // banked, further input cannot reopen it.
      if (state.status !== "running" || !state.trial) return state;

      const correct = state.correct + (action.dir === state.trial.direction ? 1 : 0);
      const asked = state.asked + 1;
      const trialNo = state.trialNo + 1;
      const seed = nextSeed(state.seed);

      // Mid-level: same rung, next letter.
      if (asked < PER_LEVEL) {
        return {
          ...state,
          correct,
          asked,
          trialNo,
          trial: makeTrial(state.levelIndex, trialNo, seed),
          seed,
        };
      }

      const outcomes = [...state.outcomes, { index: state.levelIndex, correct, asked }];
      const nextIndex = state.levelIndex + 1;

      // Failed this rung, or there is no smaller one this screen can show:
      // bank the eye and move on.
      if (correct < REQUIRED || nextIndex > state.maxIndex) {
        const stage = EYE_STAGES[state.stageIndex];
        const lastStage = state.stageIndex + 1 >= EYE_STAGES.length;
        return {
          ...state,
          status: lastStage ? "done" : "stage-done",
          stageIndex: lastStage ? state.stageIndex : state.stageIndex + 1,
          correct,
          asked,
          trialNo,
          trial: null,
          outcomes,
          stageOutcomes: { ...state.stageOutcomes, [stage]: outcomes },
          seed,
        };
      }

      return {
        ...state,
        levelIndex: nextIndex,
        correct: 0,
        asked: 0,
        trialNo,
        trial: makeTrial(nextIndex, trialNo, seed),
        outcomes,
        seed,
      };
    }
  }
}
