/**
 * Should /login explain that a sign-in didn't reach the server?
 *
 * The named failure this covers: someone signs in (password or OAuth), lands
 * back on the login form, and stays there with no error. Every other failure
 * in this flow already names itself — expired/device links, unconfirmed email,
 * the stranded-callback rescue — but this one was silent:
 *
 *   /login --(signed in)--> /continue --(local profile OK)--> /dashboard
 *   /dashboard --(middleware: no session server-side)--> /login?next=…
 *   /login --(middleware: still no session)--> bare form, no explanation
 *
 * Landing on /login *with* a local session means the middleware already ruled
 * server-side that there is no session — otherwise it would have redirected
 * away (see `signedInAuthPageDest`). The two halves disagree, and the session
 * is the one that travels: the browser holds it (localStorage) but the server
 * never receives it (cookies). That is blocked sign-in cookies — tracking
 * protection, "block all cookies", an in-app browser, an iframe embed — or,
 * transiently, the middleware's 2.5s GoTrue timeout failing open and serving
 * the form to someone it couldn't verify in time.
 *
 * All three inputs are required, each ruling something out:
 *
 * - Supabase configured: in demo mode the local profile IS the session, so
 *   there is no server to disagree with (see `shouldAuthPageSelfRedirect`).
 * - A `?next=`: proof of a bounce rather than a plain visit. Without it this
 *   would nag every signed-in user the middleware failed open for.
 * - A local session: proof this browser just signed in. A genuinely signed-out
 *   bounce (expired session, shared device) must keep showing the plain form.
 */
export function shouldShowSessionDisagreement(opts: {
  /** `isSupabaseConfigured` — false means demo mode, no server session exists. */
  supabaseConfigured: boolean;
  /** Whether the URL carries a `?next=` (i.e. the middleware bounced here). */
  hasNext: boolean;
  /** Whether this browser holds a Supabase session (local read, no network). */
  hasLocalSession: boolean;
}): boolean {
  return opts.supabaseConfigured && opts.hasNext && opts.hasLocalSession;
}
