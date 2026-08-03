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

/** The parts of a Supabase session user this file needs. */
export interface SessionUser {
  id: string;
  email: string | null;
  /** `user_metadata.full_name`, set at password signup. */
  fullName: string | null;
}

/**
 * Identity when the account rows can't be read.
 *
 * `loadAccount` rejecting used to leave the local cache alone, which sounds
 * conservative and is actually a redirect loop. The session is fine — `user`
 * came back from `getUser()` — but if this browser has no cached profile,
 * `isAuthed` stays false while `accountHydrated` flips true, and the two halves
 * of the app disagree about the same person:
 *
 *   /dashboard  --(AppShell: not authed)-->  /login
 *   /login      --(middleware: authed)---->  /dashboard  --> …
 *
 * Which is the WebKit history throttle again, and another crash on a phone.
 *
 * The disagreement is not real. A failed read of `profiles` says nothing about
 * whether someone is signed in — the session already answered that, and the
 * user id and email are right there in it. So identity comes from the session
 * and only the *account data* degrades: tier and streak stay at whatever the
 * cache held, and the next successful sync corrects them. Server-side
 * entitlement is unaffected either way — it never trusts this copy.
 *
 * Cross-account safety is the same rule [hydrateAccountState] uses: a cache
 * belonging to a different email is dropped rather than adopted, so a failed
 * read can't hand one learner another's progress.
 */
export function hydrateSessionOnly(current: UserState, user: SessionUser): UserState {
  const prevOwner = current.ownerEmail?.toLowerCase() ?? null;
  const incomingOwner = user.email?.toLowerCase() ?? null;
  const differentAccount =
    prevOwner !== null && incomingOwner !== null && prevOwner !== incomingOwner;
  const base = differentAccount ? defaultUserState() : current;

  // A cached profile already carrying this user's id is the real thing — it
  // came from a successful load earlier — so keep it untouched.
  const cached = base.profile?.id === user.id ? base.profile : null;

  return {
    ...base,
    profile: cached ?? {
      id: user.id,
      // Salvage what the cache knows before falling back to the session.
      name: base.profile?.name || user.fullName || "Learner",
      email: user.email ?? base.profile?.email ?? "",
      createdAt: base.profile?.createdAt ?? new Date().toISOString(),
    },
    ownerEmail: user.email ?? base.ownerEmail,
  };
}
