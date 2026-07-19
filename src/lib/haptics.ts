/**
 * Tiny haptic feedback helpers.
 *
 * Study is a tap-driven experience — answering a question, flipping a card,
 * rating recall. A short buzz on those moments makes the app feel like it
 * acknowledged you, which no amount of visual polish quite replaces.
 *
 * Notes:
 * - `navigator.vibrate` is Android/Chrome only. iOS Safari has no web haptics
 *   API at all, so these are silent no-ops there rather than a fallback.
 * - Honours `prefers-reduced-motion`, which the vibration spec doesn't cover
 *   but which is the closest signal we have for "don't add physical noise".
 * - Every call is wrapped: some browsers throw if vibrate is called before a
 *   user gesture, and a failed buzz must never break a study session.
 */

type Pattern = number | number[];

function reducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function buzz(pattern: Pattern): void {
  if (typeof window === "undefined") return;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  if (reducedMotion()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Vibration is decoration — never let it surface as an error.
  }
}

/** A regular tap: selecting an option, flipping a card, toggling a control. */
export function tap(): void {
  buzz(10);
}

/** A correct answer or a completed step — short, light double pulse. */
export function success(): void {
  buzz([14, 40, 14]);
}

/** A wrong answer. One softer buzz; this should read as "noted", not "punished". */
export function error(): void {
  buzz(32);
}

/** A milestone: session finished, rank up, exam submitted. */
export function celebrate(): void {
  buzz([12, 30, 12, 30, 26]);
}

export const haptics = { tap, success, error, celebrate };
