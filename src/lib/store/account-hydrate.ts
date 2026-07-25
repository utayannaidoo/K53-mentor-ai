import type { UserState } from "@/types";
import { defaultUserState } from "@/lib/store/local-store";
import { mergeProgress, type RemoteProgress } from "@/lib/supabase/progress";

export type AccountFields = Partial<
  Pick<UserState, "profile" | "onboarding" | "tier" | "streak" | "cp">
>;

/**
 * Fold a signed-in user's account rows + server progress into local state.
 * If this browser's data belongs to a DIFFERENT account (by email), reset to
 * a clean slate first — the merge is a union, so without this one learner's
 * progress bleeds into the next. Pure so it can be unit-tested.
 */
export function hydrateAccountState(
  current: UserState,
  account: AccountFields,
  progress: RemoteProgress | null,
  userEmail: string | null,
): UserState {
  const prevOwner = current.ownerEmail?.toLowerCase() ?? null;
  const incomingOwner = userEmail?.toLowerCase() ?? null;
  const differentAccount =
    prevOwner !== null && incomingOwner !== null && prevOwner !== incomingOwner;
  const base = differentAccount ? defaultUserState() : current;

  let next: UserState = { ...base, ...account, ownerEmail: userEmail ?? base.ownerEmail };
  // CP only grows for the SAME account; a different account takes its own.
  if (account.cp != null) next.cp = differentAccount ? account.cp : Math.max(base.cp, account.cp);

  // The server's onboarding answers — including the licence code — are the
  // source of truth for this account, so signing in on any device lands on the
  // same code every time. But a server that has NO onboarding yet must not
  // wipe the answers this browser holds: that is the visitor who completed the
  // wizard before signing up, and blanking their code here would send them
  // back through onboarding and silently reset them to Code 8. Keep what we
  // have and let the next sync push it up.
  next.onboarding = account.onboarding ?? base.onboarding;

  if (progress) next = mergeProgress(next, progress);
  return next;
}
