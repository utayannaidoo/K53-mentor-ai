/**
 * One host per deployment.
 *
 * The site answers to more than one name — the apex domain, `www.`, and the
 * `*.vercel.app` deploy alias all resolve to the same app — and every one of
 * them used to serve it. Two hosts serving one app is two cookie jars, and the
 * Google sign-in does not survive the split:
 *
 *  1. Someone arrives on `www.k53mentorai.co.za` and clicks "Continue with
 *     Google". The PKCE code verifier is written as a host-only cookie on
 *     `www.`, and Supabase is asked to return them to
 *     `https://www.k53mentorai.co.za/auth/callback`.
 *  2. That URL is not on Supabase's redirect allow list — the allow list names
 *     the apex host, deliberately, see docs/ops/supabase-auth-setup.md — so
 *     GoTrue falls back to the Site URL and drops them on the *apex* host's
 *     marketing page, carrying a `?code=` nothing there can spend.
 *  3. They are now on the apex host. They click Google again, this time the
 *     whole flow runs on one host, and it works.
 *
 * Which is why this was reported as "it sends me back to the home screen and I
 * have to log in twice" rather than as a domain problem. Sending every request
 * to the canonical host first closes it at the source: the flow can no longer
 * start somewhere the callback cannot finish. The session, the canonical link
 * tag and the sitemap also end up agreeing on one origin, which they did not.
 *
 * Deliberately narrow, because a wrong `NEXT_PUBLIC_SITE_URL` here would bounce
 * every request off the site rather than just mislabel it. Enforced only on the
 * live production deployment — where `assertSiteUrlConfiguredInProduction` has
 * already refused to boot on an unset, malformed or `*.vercel.app` value — and
 * the local/deploy-URL hosts are re-checked below anyway. Previews (no
 * `NEXT_PUBLIC_SITE_URL` of their own, legitimately on vercel.app) and local dev
 * are left alone.
 */

/** The origin every request should end up on, or null to enforce nothing. */
export function canonicalOrigin(opts: { siteUrl: string; enforce: boolean }): string | null {
  if (!opts.enforce) return null;

  let url: URL;
  try {
    url = new URL(opts.siteUrl);
  } catch {
    return null;
  }

  // The values the guard in env.ts exists to reject, re-checked here: pointing
  // the live site at localhost or at a deploy URL is far worse than serving an
  // extra hostname.
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]") return null;
  if (hostname === "vercel.app" || hostname.endsWith(".vercel.app")) return null;

  return url.origin;
}

/** Where to send a request that arrived on some other host, or null to serve it. */
export function canonicalRedirect(opts: {
  url: URL;
  /** From the proxy (`x-forwarded-host` / `host`), not from the caller. */
  requestHost: string | null | undefined;
  canonicalOrigin: string | null;
}): URL | null {
  if (!opts.canonicalOrigin) return null;

  const canonical = new URL(opts.canonicalOrigin);
  const from = opts.requestHost?.toLowerCase();
  // No host header to compare against. Every real browser sends one, so rather
  // than guess at a redirect target, serve the request as asked.
  if (!from || from === canonical.host.toLowerCase()) return null;

  const to = new URL(opts.url);
  to.protocol = canonical.protocol;
  to.host = canonical.host;
  return to;
}
