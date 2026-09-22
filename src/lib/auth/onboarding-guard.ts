/**
 * Should /onboarding send this visitor to their dashboard instead of running
 * first-run setup again?
 *
 * Every marketing CTA points at /onboarding, so a learner with an account
 * reaches the wizard just by tapping "Start free assessment" on the home page.
 * Re-running it did two things it had no business doing: `completeOnboarding`
 * re-arms Navi's first-run tour (`firstRunTourDone: false`, the only writer of
 * that flag anywhere), and the next background sync upserts goal, vehicle code,
 * test dates, confidence, worries, knowledge level, study frequency and prior
 * attempts over the profile that was already there. A learner two months in was
 * given the new-user tour and had their study profile silently rewritten —
 * `vehicle_code` included, which decides which content they are served.
 *
 * Both readiness flags are required first. Before `accountHydrated` flips,
 * `hasOnboarded` describes an empty local store rather than the account, so
 * deciding early would wave the wizard through on any device the learner had
 * not used before — precisely the case this exists for.
 *
 * `isAuthed` as well as `hasOnboarded`, because a signed-out visitor cannot
 * open /dashboard — the app shell bounces them to /login — and turning the
 * site's main call to action into a login wall is the very bug the 404 page
 * already carries a comment about. A demo guest counts as authed here
 * (`isAuthed` is `Boolean(state.profile)`) and /dashboard is somewhere they can
 * genuinely go, so they are covered too.
 *
 * On the stale-profile case, which [shouldAuthPageSelfRedirect] documents at
 * length: `isAuthed` reads localStorage, the session lives in a cookie, and iOS
 * Safari's ITP evicts the cookie after ~7 days while leaving localStorage
 * alone. Such a visitor is redirected /onboarding → /dashboard → (middleware,
 * no session) → /login?next=/dashboard and stops there, because in production
 * the login page does not self-redirect. So this cannot build the history loop
 * that crashed WebKit — it costs one extra hop, and it lands a returning
 * learner on the sign-in page, which is where someone holding no session needs
 * to be anyway.
 */
export function shouldSkipOnboarding(opts: {
  /** Local store has finished reading localStorage. */
  ready: boolean;
  /** The signed-in account's server state has been folded in. */
  accountHydrated: boolean;
  /** `Boolean(state.profile)` — local only, NOT proof of a Supabase session. */
  isAuthed: boolean;
  /** `Boolean(state.onboarding)` — setup has been completed before. */
  hasOnboarded: boolean;
}): boolean {
  return opts.ready && opts.accountHydrated && opts.isAuthed && opts.hasOnboarded;
}

/**
 * Is anyone signed in on this browser, judged from the raw study-state blob?
 *
 * The marketing pages need this to label their call to action, and they cannot
 * ask the study store: StudyStoreProvider reaches the question bank, and
 * mounting it outside the app put ~645KB into the landing chunk. `profile` is
 * what both sign-in paths write — Supabase and demo guest — so it is the same
 * thing `isAuthed` means inside the app, read without the dependency.
 *
 * Takes the raw string rather than touching localStorage so it stays pure. A
 * missing, unparseable or non-object blob reads as signed out: a stranger's
 * label in front of a returning learner is a far smaller problem than a crash
 * on the home page, and the /onboarding guard fixes the destination regardless
 * of what the label says.
 */
export function signedInFromStateBlob(raw: string | null | undefined): boolean {
  if (!raw) return false;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Boolean(
      parsed && typeof parsed === "object" && (parsed as { profile?: unknown }).profile,
    );
  } catch {
    return false;
  }
}
