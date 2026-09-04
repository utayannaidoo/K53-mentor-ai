export interface FirstRunRouteState {
  hasOnboarded: boolean;
  hasDiagnostic: boolean;
  diagnosticSkippedAt: string | null;
  guidedDone: boolean;
  nonDiagnosticSessions: number;
  /** Already validated by safeNextPath at the route boundary. */
  next: string | null;
}

/**
 * One explicit routing policy for the post-auth first-run funnel.
 *
 * A completed starting check is already the learner's activation moment, so it
 * goes directly to their intended page or Today. Only learners who deliberately
 * chose "study first" receive the one-question introduction.
 */
export function postAuthFirstRunDestination(state: FirstRunRouteState): string {
  if (!state.hasOnboarded) return "/onboarding";
  if (!state.hasDiagnostic && !state.diagnosticSkippedAt) return "/diagnostic";
  if (state.hasDiagnostic) return state.next ?? "/dashboard";
  if (!state.guidedDone && state.nonDiagnosticSessions === 0) return "/welcome";
  return state.next ?? "/dashboard";
}
