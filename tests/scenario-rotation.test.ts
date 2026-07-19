import { describe, expect, it } from "vitest";
import { orderScenariosByFreshness } from "@/lib/diagnostic/select";
import { SCENARIOS } from "@/lib/content/scenarios";
import { forCode } from "@/lib/content/vehicle";
import { STUDY_SESSION_SIZE } from "@/lib/billing/plans";
import type { ScenarioAttempt } from "@/types";

/**
 * Scenarios used to be served as the whole pool, freshly shuffled — so every
 * session replayed every scenario. Rotation and a session-sized slice fix that
 * together; these tests pin both halves, because either alone is useless.
 */

/** One session: take a slice, then record having seen it. */
function runSession(attempts: ScenarioAttempt[], code: "8", t: number): string[] {
  const served = orderScenariosByFreshness(forCode(SCENARIOS, code), attempts).slice(
    0,
    STUDY_SESSION_SIZE,
  );
  served.forEach((s, n) => {
    attempts.push({
      id: `a${attempts.length}`,
      scenarioId: s.id,
      categoryId: s.categoryId,
      choiceId: s.choices[0].id,
      correct: true,
      at: new Date(t + n * 30_000).toISOString(),
    });
  });
  return served.map((s) => s.id);
}

describe("scenario rotation", () => {
  it("serves a session-sized slice, not the whole pool", () => {
    const pool = forCode(SCENARIOS, "8");
    expect(pool.length).toBeGreaterThan(STUDY_SESSION_SIZE);
    const served = orderScenariosByFreshness(pool, []).slice(0, STUDY_SESSION_SIZE);
    expect(served).toHaveLength(STUDY_SESSION_SIZE);
  });

  it("does not repeat a scenario until the pool has been worked through", () => {
    // Randomised ordering, so repeat the whole arc rather than trusting one run.
    for (let run = 0; run < 20; run++) {
      const attempts: ScenarioAttempt[] = [];
      const pool = forCode(SCENARIOS, "8");
      const sessions = Math.floor(pool.length / STUDY_SESSION_SIZE);
      const seen: string[] = [];
      let t = Date.parse("2026-07-18T08:00:00Z");
      for (let s = 0; s < sessions; s++) {
        seen.push(...runSession(attempts, "8", t));
        t += 3_600_000;
      }
      expect(new Set(seen).size, "a scenario repeated before the pool was exhausted").toBe(
        seen.length,
      );
    }
  });

  it("comes back around once everything has been seen", () => {
    const attempts: ScenarioAttempt[] = [];
    const pool = forCode(SCENARIOS, "8");
    let t = Date.parse("2026-07-18T08:00:00Z");
    // Exhaust the pool, then one more session must still return a full slice.
    const sessions = Math.ceil(pool.length / STUDY_SESSION_SIZE) + 1;
    let last: string[] = [];
    for (let s = 0; s < sessions; s++) {
      last = runSession(attempts, "8", t);
      t += 3_600_000;
    }
    expect(last).toHaveLength(STUDY_SESSION_SIZE);
  });

  it("puts genuinely unseen scenarios ahead of ones already answered", () => {
    const pool = forCode(SCENARIOS, "8");
    const [first, ...rest] = pool;
    const attempts: ScenarioAttempt[] = [
      {
        id: "a1",
        scenarioId: first.id,
        categoryId: first.categoryId,
        choiceId: first.choices[0].id,
        correct: true,
        at: new Date().toISOString(),
      },
    ];
    // The one just answered must sort behind every unseen scenario.
    const ordered = orderScenariosByFreshness(pool, attempts);
    expect(ordered[ordered.length - 1].id).toBe(first.id);
    expect(ordered.slice(0, rest.length).map((s) => s.id)).not.toContain(first.id);
  });
});
