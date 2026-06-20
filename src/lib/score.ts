export type ScoreTone = "primary" | "success" | "warning" | "danger";

/** Maps a 0–100 readiness/competence value to a semantic tone. */
export function scoreTone(value: number): ScoreTone {
  if (value < 45) return "danger";
  if (value < 70) return "warning";
  return "success";
}
