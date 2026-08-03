/**
 * Should /login or /signup bounce this visitor onwards by itself?
 *
 * Only in demo mode. This is not a style preference — acting on the local
 * profile in production is an infinite redirect loop that crashes Safari.
 *
 * `isAuthed` is `Boolean(state.profile)`, and the profile lives in
 * localStorage. The *session* lives in a Supabase cookie, and the two diverge
 * routinely: iOS Safari's ITP evicts the cookie after ~7 days of no
 * interaction while leaving localStorage untouched, so a returning learner
 * opens the app "signed in" locally with no session at all. `hydrate()` in
 * use-study-store deliberately keeps the cached profile when the user comes
 * back null (a transient null must not read as a logout), so nothing ever
 * clears that stale flag on its own.
 *
 * When the auth page trusted it, this happened, entirely client-side:
 *
 *   /login  --(this redirect)-->  /continue  --(local state says onboarded)-->
 *   /dashboard  --(middleware: no session)-->  /login?next=/dashboard  --> …
 *
 * ~180 history.replaceState calls a second. Chrome and Firefox spin on that
 * silently; WebKit throttles history to 100 calls per 10s and *throws*
 * SecurityError past it, which escapes React and drops the user on Next's
 * "Application error: a client-side exception has occurred" screen. Hence a
 * bug that only ever showed up on phones.
 *
 * In production the middleware already owns this decision and makes it
 * server-side, before the page renders: a visitor holding a real session never
 * reaches /login or /signup, they are redirected from the edge (see
 * `signedInAuthPageDest`). So there is nothing left for the client to do, and
 * the only input it has to decide with is the one that lies.
 *
 * Demo mode has no middleware and no cookie — the local profile *is* the
 * session, and nothing can bounce back — so the redirect stays there.
 */
export function shouldAuthPageSelfRedirect(opts: {
  /** Local store has finished reading localStorage. */
  ready: boolean;
  /** `Boolean(state.profile)` — local only, NOT proof of a Supabase session. */
  isAuthed: boolean;
  /** `isSupabaseConfigured` — true means the middleware is guarding routes. */
  supabaseConfigured: boolean;
}): boolean {
  return opts.ready && opts.isAuthed && !opts.supabaseConfigured;
}
