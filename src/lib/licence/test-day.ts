import { todayKey } from "@/lib/store/local-store";
import type { OnboardingData, TestKind, UserState } from "@/types";

/**
 * When to ask a learner how a real test went.
 *
 * The Driver Rank ladder stops one rung short on purpose: the last rank belongs
 * to an actual licence and no in-app number can reach it (see
 * `LICENCE_RANK_INDEX`). Until now nothing granted it either, so the final rank,
 * the passport's gold variant and the "full passport" achievement were all
 * unreachable — the product's biggest moment had no way in. This is the way in,
 * and the only one: the learner's own answer.
 *
 * Pure, so the conditions can be tested without a browser or a clock.
 */

export type TestDayState = Pick<
  UserState,
  "onboarding" | "licence" | "licenceDeferredOn"
>;

export interface BookedTest {
  kind: TestKind;
  /** yyyy-mm-dd. */
  testDate: string;
}

/** How each test is named to the learner. */
export const TEST_LABEL: Record<TestKind, string> = {
  learners: "learner's test",
  drivers: "driver's test",
};

/** The licence each test hands over, for the moment it is won. */
export const LICENCE_LABEL: Record<TestKind, string> = {
  learners: "learner's licence",
  drivers: "driver's licence",
};

/**
 * The tests this learner actually has booked, resolved from their goal.
 *
 * `OnboardingData` stores these asymmetrically and it is a genuine trap:
 * `testDate` is *the only test date whenever the goal isn't "both"*, so for a
 * learner working toward their driver's licence it holds the **driver's** test,
 * not the learner's, and `driversTestDate` is null. Reading `testDate` as
 * "the learner's test" — which is the obvious reading — would ask the wrong
 * question of every driver's-licence learner in the product. Every caller goes
 * through here so that asymmetry is resolved exactly once.
 */
export function bookedTests(onboarding: OnboardingData | null): BookedTest[] {
  if (!onboarding) return [];
  const { goal, testDate, driversTestDate } = onboarding;

  if (goal === "drivers") {
    return testDate ? [{ kind: "drivers", testDate }] : [];
  }

  const tests: BookedTest[] = [];
  if (testDate) tests.push({ kind: "learners", testDate });
  // Only "both" carries a second date; for "learners" this field is unused.
  if (goal === "both" && driversTestDate) {
    tests.push({ kind: "drivers", testDate: driversTestDate });
  }
  return tests;
}

/**
 * The test-day question owed right now, or null.
 *
 * Four gates per test, each closing a way the prompt could become a nuisance:
 *
 * 1. **The booked date has arrived.** Local day boundaries via `todayKey`, the
 *    same basis the streak uses, so both agree on when a day turns over.
 * 2. **That licence is not already held.** Per test, not per account: passing
 *    your learner's must not silence the question about your driver's, which a
 *    single "are they licensed" check would do for everyone chasing both.
 * 3. **This booking has not been answered.** Keyed to the date, not a boolean:
 *    a learner who failed in March and re-books for June is asked again in
 *    June, which a flag could never express.
 * 4. **They did not put it off today.** "I haven't written it yet" is the
 *    honest answer when a test is postponed on the day, and it must not mean
 *    being asked again on the next page load.
 *
 * Where both are owed the learner's comes first — it is the one that must be
 * passed before the other can even be sat.
 */
export function testOutcomeDue(state: TestDayState, now = new Date()): BookedTest | null {
  const today = todayKey(now);
  for (const test of bookedTests(state.onboarding)) {
    if (test.testDate > today) continue;
    const answered = state.licence?.[test.kind];
    if (answered?.result === "passed") continue;
    if (answered?.testDate === test.testDate) continue;
    if (state.licenceDeferredOn?.[test.kind] === today) continue;
    return test;
  }
  return null;
}

/** The booked date being asked about, formatted for the prompt. */
export function formatTestDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parsed);
}

/** True when the booked date is today rather than some day already past. */
export function isTestToday(date: string, now = new Date()): boolean {
  return date === todayKey(now);
}

/**
 * The licence they hold, if any — the driver's outranking the learner's.
 *
 * Someone studying for both ends up with two passes recorded, and the card has
 * room to name one. A driver's licence supersedes the learner's it was built
 * on, so that is the one worth printing.
 */
export function licenceHeld(licence: UserState["licence"]): TestKind | null {
  if (licence?.drivers?.result === "passed") return "drivers";
  if (licence?.learners?.result === "passed") return "learners";
  return null;
}
