import { describe, expect, it } from "vitest";
import {
  abilityByCategory,
  interleave,
  withinReach,
  MIN_ATTEMPTS_FOR_ABILITY,
} from "@/lib/learning/ability";
import type { CategoryId, Difficulty, Question, QuestionAttempt } from "@/types";

let seq = 0;
function att(categoryId: CategoryId, correct: boolean): QuestionAttempt {
  seq += 1;
  return {
    id: `a${seq}`,
    questionId: `q${seq}`,
    categoryId,
    correct,
    selectedIndex: 0,
    at: new Date(Date.UTC(2026, 6, 1, 0, 0, seq)).toISOString(),
    context: "practice",
  };
}

function run(categoryId: CategoryId, correct: boolean, n: number): QuestionAttempt[] {
  return Array.from({ length: n }, () => att(categoryId, correct));
}

function q(id: string, categoryId: CategoryId, difficulty: Difficulty): Question {
  return {
    id,
    categoryId,
    prompt: id,
    options: ["a", "b"],
    correctIndex: 0,
    explanation: "",
    difficulty,
    scope: "learners",
  };
}

describe("ability", () => {
  it("holds at medium until there is enough signal to judge", () => {
    const a = abilityByCategory(run("signs", true, MIN_ATTEMPTS_FOR_ABILITY - 1));
    expect(a.signs?.confident).toBe(false);
    expect(a.signs?.ceiling).toBe(2);
  });

  it("promotes to hard once the learner is consistently right", () => {
    const a = abilityByCategory(run("signs", true, 10));
    expect(a.signs?.confident).toBe(true);
    expect(a.signs?.ceiling).toBe(3);
  });

  it("drops to easy when the learner is struggling", () => {
    const a = abilityByCategory(run("signs", false, 10));
    expect(a.signs?.ceiling).toBe(1);
  });

  it("is per-category — being good at signs doesn't unlock hard rules", () => {
    const a = abilityByCategory([...run("signs", true, 10), ...run("rules", false, 10)]);
    expect(a.signs?.ceiling).toBe(3);
    expect(a.rules?.ceiling).toBe(1);
  });

  it("forgets old attempts, so improvement actually registers", () => {
    // 20 wrong a fortnight ago then 20 right today must read as "good now".
    const a = abilityByCategory([...run("signs", false, 20), ...run("signs", true, 20)]);
    expect(a.signs?.accuracy).toBe(1);
    expect(a.signs?.ceiling).toBe(3);
  });
});

describe("withinReach", () => {
  const pool = [q("e", "signs", 1), q("m", "signs", 2), q("h", "signs", 3)];

  it("gives a struggling learner one rung of headroom, not the whole bank", () => {
    const ability = abilityByCategory(run("signs", false, 10));
    expect(withinReach(pool, ability).map((x) => x.id)).toEqual(["e", "m"]);
  });

  it("opens everything once the category is mastered", () => {
    const ability = abilityByCategory(run("signs", true, 10));
    expect(withinReach(pool, ability).map((x) => x.id)).toEqual(["e", "m", "h"]);
  });

  it("never starves the session — an empty filter falls back to the full pool", () => {
    // A thin category where nothing sits at or below the ceiling.
    const hardOnly = [q("h", "signs", 3)];
    const ability = abilityByCategory(run("signs", false, 10)); // ceiling 1, +1 = 2
    expect(withinReach(hardOnly, ability)).toEqual(hardOnly);
  });
});

describe("interleave", () => {
  it("breaks up runs of the same category", () => {
    const questions = [
      q("s1", "signs", 1),
      q("s2", "signs", 1),
      q("s3", "signs", 1),
      q("s4", "signs", 1),
      q("r1", "rules", 1),
      q("r2", "rules", 1),
    ];
    const out = interleave(questions);
    expect(out).toHaveLength(6);
    let run = 1;
    for (let i = 1; i < out.length; i++) {
      run = out[i].categoryId === out[i - 1].categoryId ? run + 1 : 1;
      expect(run).toBeLessThanOrEqual(2);
    }
  });

  it("keeps the mistakes seeded at the front in front", () => {
    const questions = [
      q("mistake", "parking", 1),
      q("s1", "signs", 1),
      q("s2", "signs", 1),
      q("r1", "rules", 1),
    ];
    expect(interleave(questions)[0].id).toBe("mistake");
  });

  it("tolerates a single-category session rather than looping forever", () => {
    const questions = [q("s1", "signs", 1), q("s2", "signs", 1), q("s3", "signs", 1)];
    expect(interleave(questions).map((x) => x.id)).toEqual(["s1", "s2", "s3"]);
  });
});
