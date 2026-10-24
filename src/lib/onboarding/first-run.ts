import { isSchoolWorkspacePath } from "@/lib/auth/safe-next";

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
 * There is no starting check any more: onboarding asks what the learner finds
 * hard and the first thing they do is study. A brand-new learner gets the
 * one-question introduction at /welcome; anyone with a session behind them, or
 * a baseline from the old check, goes to their intended page or Today.
 *
 * `diagnosticSkippedAt` is still accepted because accounts carry it, but it no
 * longer decides anything — there is nothing left to skip.
 */
export function postAuthFirstRunDestination(state: FirstRunRouteState): string {
  // A driving school signing up to run its workspace skips the learner funnel
  // entirely — see isSchoolWorkspacePath.
  if (isSchoolWorkspacePath(state.next)) return state.next!;
  if (!state.hasOnboarded) return "/onboarding";
  if (state.hasDiagnostic) return state.next ?? "/dashboard";
  if (!state.guidedDone && state.nonDiagnosticSessions === 0) return "/welcome";
  return state.next ?? "/dashboard";
}
