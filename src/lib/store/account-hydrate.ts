import type { UserState } from "@/types";
import { defaultUserState } from "@/lib/store/local-store";
import { mergeProgress, type RemoteProgress } from "@/lib/supabase/progress";
import { classAllowsCode, defaultCodeForClass } from "@/lib/billing/plans";

export type AccountFields = Partial<
  Pick<UserState, "profile" | "onboarding" | "tier" | "vehicleClass" | "streak" | "cp">
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

  // The paid track is server truth (subscriptions.track, webhook-only). A null
  // from the server means "no paid track on record" — either a free learner or
  // a subscription bought before 0017 — so the local value stands in rather
  // than being wiped, which would widen content back to every code.
  next.vehicleClass = account.vehicleClass ?? base.vehicleClass;

  // Repair a licence code that contradicts the paid track. Content gating
  // already clamps at read time (studyCodeOf), so this is about the *stored*
  // value: a code left behind by another account on this device, or written
  // into the profile by an older build, would otherwise keep re-appearing in
  // the account page and the profile editor.
  if (next.tier !== "free" && next.vehicleClass && next.onboarding) {
    if (!classAllowsCode(next.vehicleClass, next.onboarding.vehicleCode)) {
      next = {
        ...next,
        onboarding: {
          ...next.onboarding,
          vehicleCode: defaultCodeForClass(next.vehicleClass),
        },
      };
    }
  }

  if (progress) next = mergeProgress(next, progress);
  return next;
}
