/**
 * Which single thing the dashboard interrupts you about.
 *
 * Five banners used to render as independent siblings — the test countdown, the
 * comeback summary, the cram warning, the trial-ended card and the "take your
 * diagnostic" prompt — each deciding on its own whether it applied. Nothing
 * stopped four of them being true at once, and on that day the learner scrolled
 * past four boxes before reaching a single thing they could actually do.
 *
 * They are also not equal. "Your test is tomorrow, drill your mistakes" and
 * "you have not taken the diagnostic yet" are advice for two different people;
 * showing both says neither. So this ranks them and the page renders one.
 *
 * Pure, because "the most urgent thing wins" is the sort of rule that rots
 * silently the moment a sixth banner is added by someone reading only the JSX.
 */

/** Highest priority first — the order is the rule. */
export const ALERT_PRIORITY = [
  /** Test is days away and mistakes are still open: nothing else matters now. */
  "cram",
  /** The free week is over; every study surface is capped until they choose. */
  "trial-ended",
  /** No diagnostic yet, so the plan and readiness are both guesses. */
  "diagnostic",
  /** Back after a gap — orient them before they start. */
  "comeback",
] as const;

export type DashboardAlert = (typeof ALERT_PRIORITY)[number];

export function topAlert(applicable: Partial<Record<DashboardAlert, boolean>>): DashboardAlert | null {
  return ALERT_PRIORITY.find((a) => applicable[a]) ?? null;
}
