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
  if (progress) next = mergeProgress(next, progress);
  return next;
}
