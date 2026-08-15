import { describe, expect, it } from "vitest";
import {
  PER_LEVEL,
  REQUIRED,
  initialLadder,
  ladderReducer,
  type LadderAction,
  type LadderState,
} from "@/lib/vision/ladder";
import { ACUITY_LEVELS, EYE_STAGES, type EDirection } from "@/lib/vision/acuity";

/**
 * The reported bug: "the number of letters changes every time, and the totals
 * for left, right and both are all different."
 *
 * Two causes, both of which this file locks down. The eyes disagreed because
 * the start rung was chosen before the chart had been measured, so the first
 * eye opened at 6/60 and the two after it opened wherever the now-measured
 * chart allowed. The count drifted within an eye because two answers arriving
 * in one frame both read the same stale `asked`, so one was swallowed.
 */

const run = (state: LadderState, actions: LadderAction[]) =>
  actions.reduce(ladderReducer, state);

/** Answer every letter correctly until the ladder stops asking. */
function playPerfect(state: LadderState, cap = 500): LadderState {
  let s = state;
  for (let i = 0; i < cap && s.trial; i++) {
    s = ladderReducer(s, { type: "answer", dir: s.trial.direction });
  }
  return s;
}

/** Answer every letter wrongly. */
function playBlind(state: LadderState, cap = 500): LadderState {
  let s = state;
  for (let i = 0; i < cap && s.trial; i++) {
    const wrong = (["up", "right", "down", "left"] as EDirection[]).find(
      (d) => d !== s.trial!.direction,
    )!;
    s = ladderReducer(s, { type: "answer", dir: wrong });
  }
  return s;
}

const started = (startIndex: number, maxIndex: number, seed = 42) =>
  ladderReducer(initialLadder(seed), { type: "start-stage", startIndex, maxIndex });

describe("a level always asks exactly PER_LEVEL letters", () => {
  it("counts every answer, even when several land in the same frame", () => {
    // The swallowed-answer bug: two dispatches in one frame used to collapse
    // into one. A reducer applies the second to the result of the first.
    let s = started(4, 7);
    const first = s.trial!.levelIndex;
    s = run(s, [
      { type: "answer", dir: "up" },
      { type: "answer", dir: "up" },
    ]);
    expect(s.asked).toBe(2);
    expect(s.levelIndex).toBe(first);
  });

  it("banks a level after exactly PER_LEVEL letters, never fewer", () => {
    const finished = playPerfect(started(6, 7));
    for (const outcome of finished.stageOutcomes.left ?? []) {
      expect(outcome.asked, `level ${outcome.index} asked ${outcome.asked}`).toBe(PER_LEVEL);
    }
  });

  it("ignores input once the eye is banked", () => {
    // Trailing key-repeat after the last letter must not reopen the ladder.
    const done = playBlind(started(5, 7));
    const after = run(done, [{ type: "answer", dir: "up" }, { type: "answer", dir: "left" }]);
    expect(after).toBe(done);
  });
});

describe("all three eyes are asked the same questions", () => {
  it("runs an identical ladder for left, right and both", () => {
    // The headline bug. Every stage gets the same bounds, so a reader who
    // performs identically must produce three identical transcripts.
    let s = initialLadder(7);
    for (let i = 0; i < EYE_STAGES.length; i++) {
      s = ladderReducer(s, { type: "start-stage", startIndex: 3, maxIndex: 7 });
      s = playPerfect(s);
    }

    expect(s.status).toBe("done");
    const shape = (stage: (typeof EYE_STAGES)[number]) =>
      (s.stageOutcomes[stage] ?? []).map((o) => `${o.index}:${o.correct}/${o.asked}`);

    expect(shape("left")).toEqual(shape("right"));
    expect(shape("right")).toEqual(shape("both"));
    expect(shape("left").length).toBeGreaterThan(0);
  });

  it("gives eyes 2 and 3 the first eye's ladder, even if the chart remeasures", () => {
    // The exact reported shape: the chart measures late, so the first eye is
    // seeded from one set of bounds and the next two from another. Bounds are
    // per-attempt, so the later ones are ignored.
    let s = ladderReducer(initialLadder(11), { type: "start-stage", startIndex: 0, maxIndex: 7 });
    s = playPerfect(s);
    // A quite different measurement arrives before the second eye.
    s = ladderReducer(s, { type: "start-stage", startIndex: 4, maxIndex: 5 });
    expect(s.startIndex).toBe(0);
    expect(s.maxIndex).toBe(7);
    s = playPerfect(s);

    expect((s.stageOutcomes.right ?? []).map((o) => o.index)).toEqual(
      (s.stageOutcomes.left ?? []).map((o) => o.index),
    );
  });

  it("takes fresh bounds only after a reset", () => {
    let s = ladderReducer(initialLadder(11), { type: "start-stage", startIndex: 0, maxIndex: 7 });
    s = ladderReducer(s, { type: "reset", seed: 12 });
    s = ladderReducer(s, { type: "start-stage", startIndex: 3, maxIndex: 6 });
    expect([s.startIndex, s.maxIndex]).toEqual([3, 6]);
  });

  it("holds the bounds it started with, even if the screen is remeasured", () => {
    // A resize, a rotation, or mobile browser chrome collapsing mid-ladder used
    // to move the floor under the reader. start-stage is the only writer.
    const s = playPerfect(started(2, 5));
    const levels = (s.stageOutcomes.left ?? []).map((o) => o.index);
    expect(levels[0]).toBe(2);
    expect(Math.max(...levels)).toBe(5);
  });

  it("never opens below the deepest rung the screen can render", () => {
    // A tiny phone can leave startIndex past maxIndex; clamping keeps the
    // ladder to one legible rung rather than presenting nothing.
    const s = started(7, 4);
    expect(s.levelIndex).toBe(4);
    expect(s.trial?.levelIndex).toBe(4);
  });
});

describe("the ladder stops where optometric practice says it should", () => {
  it("goes deeper only when REQUIRED of PER_LEVEL were right", () => {
    const s = playPerfect(started(0, ACUITY_LEVELS.length - 1));
    expect(s.stageOutcomes.left?.map((o) => o.index)).toEqual(
      ACUITY_LEVELS.map((_, i) => i),
    );
  });

  it("stops at the first rung a reader cannot clear", () => {
    const s = playBlind(started(2, 7));
    const outcomes = s.stageOutcomes.left ?? [];
    expect(outcomes).toHaveLength(1);
    expect(outcomes[0].index).toBe(2);
    expect(outcomes[0].correct).toBeLessThan(REQUIRED);
  });

  it("advances through the eyes in the DLTC's order and then finishes", () => {
    let s = initialLadder(3);
    const seen: string[] = [];
    for (let i = 0; i < EYE_STAGES.length; i++) {
      s = ladderReducer(s, { type: "start-stage", startIndex: 6, maxIndex: 7 });
      seen.push(EYE_STAGES[s.stageIndex]);
      s = playBlind(s);
    }
    expect(seen).toEqual(["left", "right", "both"]);
    expect(s.status).toBe("done");
    expect(Object.keys(s.stageOutcomes).sort()).toEqual(["both", "left", "right"]);
  });
});
