import { safeNextPath } from "@/lib/auth/safe-next";

/**
 * Rescue an auth redirect that landed on the marketing page.
 *
 * Supabase falls back to the project's Site URL whenever the `redirectTo` it
 * was handed is not on the redirect allow list — and it still appends the auth
 * params. Our Site URL is the site root, so the failure mode is a learner
 * dropped on the marketing page holding a `?code=` that nothing there can
 * spend: no session, no error, no explanation. The landing page mounts no
 * Supabase client (the study store is deliberately not in the root layout), so
 * the code sits in the address bar until it expires.
 *
 * [canonicalOrigin] removes the cause we know about — a flow started on `www.`
 * — but the allow list is dashboard state, and it can drift again the next time
 * a domain is added or an email template is edited. Every one of those mistakes
 * lands here, in exactly this shape. Forwarding the params to /auth/callback
 * turns a silent dead end into either a session or a named reason on /login.
 */

/** Params that only ever arrive from a Supabase auth redirect. */
const AUTH_PARAMS = ["code", "token_hash", "error_code", "error_description"];

export function strandedAuthRedirect(url: URL): URL | null {
  // Only the site root: that is where the Site URL fallback lands. Anywhere
  // else with a `code` is a page that means something else by it.
  if (url.pathname !== "/") return null;
  if (!AUTH_PARAMS.some((p) => url.searchParams.has(p))) return null;

  const to = new URL(url);
  to.pathname = "/auth/callback";
  // The fallback discarded whatever `next` the flow asked for. /continue is the
  // right thing to restore: it is the one destination that re-checks onboarding
  // and the diagnostic before routing, and a rescued sign-in may well be a
  // brand new account that still owes both. Re-validated rather than trusted —
  // this URL is reachable by anyone, and /auth/callback acts on `next`.
  if (!safeNextPath(to.searchParams.get("next"))) to.searchParams.set("next", "/continue");
  return to;
}
