/**
 * Validate a `?next=` destination before redirecting to it.
 *
 * `next` is attacker-controllable — it arrives in a URL anyone can craft and
 * mail around — so every use of it is a potential open redirect. One rule,
 * defined once, applied at every hop that acts on it.
 *
 * A single leading slash and nothing else: that rejects absolute URLs
 * ("https://evil.com"), protocol-relative ones ("//evil.com", which browsers
 * resolve against the current scheme and happily send off-site), and the
 * backslash variant ("/\evil.com") that some browsers normalise into the same
 * thing.
 *
 * Auth pages are refused too. They are never a legitimate post-auth
 * destination, and pointing there sends a freshly signed-in user to a form the
 * middleware immediately redirects them away from.
 *
 * Returns null rather than a fallback so each caller picks its own default —
 * "/dashboard" for a confirmed email link, plain "/continue" for a login that
 * still has to route through onboarding.
 */

const RELATIVE_PATH = /^\/(?![/\\])/;
const AUTH_PATHS = ["/login", "/signup"];

export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || !RELATIVE_PATH.test(value)) return null;
  const path = value.split(/[?#]/)[0];
  if (AUTH_PATHS.includes(path)) return null;
  return value;
}

/**
 * True for the driving-school workspace (`/schools` and everything under it).
 *
 * Every post-auth hop that would otherwise route through the LEARNER funnel —
 * /continue, onboarding, the starting diagnostic — must let these straight
 * through. A school owner signing up to run their diary has no reason to pick
 * a licence code or sit a learner's quiz first; the workspace has its own
 * membership gate. Checks the path only, so a query string cannot smuggle a
 * different destination past it, and `/schoolsfoo` is not a match.
 */
export function isSchoolWorkspacePath(value: string | null | undefined): boolean {
  if (!value) return false;
  const path = value.split(/[?#]/)[0];
  return path === "/schools" || path.startsWith("/schools/");
}
