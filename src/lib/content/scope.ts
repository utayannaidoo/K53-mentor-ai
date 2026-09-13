import type { UserState } from "@/types";

/**
 * Does this learner want the driver's-licence material?
 *
 * The learner's test is the computerised theory paper. Yard- and road-test
 * content — the examiner's score sheet, manoeuvre attempts, the pre-trip
 * inspection — belongs to the practical, and showing it to someone studying for
 * the theory paper teaches them something they will never be asked.
 *
 * One definition, because it was previously inlined in the question practice
 * screen only, and the flashcard deck went on serving yard cards to everybody.
 */
export function showsDriversContent(state: UserState): boolean {
  const goal = state.onboarding?.goal;
  return goal === "drivers" || goal === "both";
}
