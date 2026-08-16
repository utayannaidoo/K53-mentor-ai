export type ScoreTone = "primary" | "success" | "warning" | "danger";

/** Maps a 0–100 readiness/competence value to a semantic tone. */
export function scoreTone(value: number): ScoreTone {
  if (value < 45) return "danger";
  if (value < 70) return "warning";
  return "success";
}

/**
 * Tone for a bar that has a real pass mark — a mock exam section, not a general
 * competence score.
 *
 * The 45/70 bands above are wrong wherever a threshold exists: Road signs needs
 * 23 of 28 (82%) to pass, so `scoreTone` paints a failing 80% green. On a screen
 * a learner uses to decide whether to book the test, that is the one direction
 * the colour must never be wrong in.
 */
export function thresholdTone(value: number, threshold: number): ScoreTone {
  return value >= threshold ? "success" : "warning";
}
