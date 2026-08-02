import { isAuthSessionMissingError } from "@supabase/supabase-js";
import type { AuthChangeEvent } from "@supabase/supabase-js";

/**
 * Should a null user clear the cached local profile?
 *
 * There are two very different nulls here, and telling them apart is the whole
 * job. `isAuthed` is `Boolean(state.profile)` and the profile lives in
 * localStorage; the session lives in a Supabase cookie. Getting this wrong in
 * either direction has already cost us a bug:
 *
 * - Clear too eagerly and a plan change looks like a sign-out. Coming back from
 *   the Paystack redirect, the middleware and this client race for the same
 *   single-use refresh token; the loser's `getUser()` comes back with no user
 *   even though the session is perfectly alive.
 * - Clear too reluctantly — what we did before — and the profile outlives the
 *   cookie. iOS Safari's tracking prevention evicts the cookie after ~7 days of
 *   no interaction and leaves localStorage alone, so the app claims to be
 *   signed in with no session behind it. That is what let /login redirect into
 *   a loop and crash Safari (see [shouldAuthPageSelfRedirect]).
 *
 * `AuthSessionMissingError` is the unambiguous half. supabase-js returns it
 * from `getUser()` in exactly two situations — there is no stored access token
 * at all, or the server reports the JWT's session_id has no active session —
 * and in both it calls `_removeSession()` itself. So it is not our inference
 * that the user is signed out; the auth client has already concluded that and
 * dropped the session. Aligning the cached profile with it just stops the two
 * from disagreeing.
 *
 * Every other failure stays ambiguous and keeps the profile: a spent refresh
 * token is an `AuthApiError`, a dead network is an `AuthRetryableFetchError`,
 * and neither means signed out. That asymmetry is deliberate — the fallback is
 * the old behaviour, so a signal we fail to recognise can only ever leave us
 * where we already were, never resurrect the Paystack regression.
 */
export function shouldClearCachedProfile(opts: {
  /** The auth event this observation came from. */
  event: AuthChangeEvent;
  /** Whether `getUser()` / the event handed us a user. */
  hasUser: boolean;
  /** The error `getUser()` returned, if this came from that call. */
  error?: unknown;
}): boolean {
  if (opts.hasUser) return false;
  // An explicit sign-out is definitive on its own — there is no error to read.
  if (opts.event === "SIGNED_OUT") return true;
  return isAuthSessionMissingError(opts.error);
}
