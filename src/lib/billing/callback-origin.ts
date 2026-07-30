import { SITE_URL } from "@/lib/constants";

/**
 * Where Paystack sends the buyer back after hosted checkout.
 *
 * The goal: a checkout begun on production must land back on production and a
 * preview must return to the preview, so the callback is immune to a stale or
 * preview-pointed `NEXT_PUBLIC_SITE_URL` (which had been bouncing production
 * buyers onto a preview deployment, where the post-payment `verify` ran against
 * the wrong session and 403'd).
 *
 * This used to return the `Origin` header outright. Origin is only
 * browser-controlled when the caller is a browser — any client can send
 * whatever it likes — so an attacker could mint a genuine, correctly-signed
 * Paystack checkout URL that returns the buyer to a domain they own. It never
 * granted anything (entitlement stays webhook-only), but a real payment page
 * redirecting to an attacker's site is a ready-made phishing step.
 *
 * `x-forwarded-host` answers the same "which domain did they check out on"
 * question and is set by the platform's proxy rather than the caller, so it is
 * the trustworthy version of exactly what Origin was standing in for. Origin is
 * honoured only when it agrees with that host — redundant but harmless, and
 * identical in behaviour for real browsers.
 *
 * Lives here rather than in the route because Next only permits known handler
 * exports (GET, POST, runtime, …) from a route module.
 */
export function callbackOrigin(req: Request): string {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const selfOrigin = host ? `${proto}://${host}` : null;

  const origin = req.headers.get("origin");
  if (origin && /^https?:\/\//i.test(origin)) {
    try {
      const originHost = new URL(origin).host;
      // Agrees with the proxy-set host, or with the deployment we are
      // configured as. Anything else is caller-supplied and is discarded.
      if (originHost === host || originHost === new URL(SITE_URL).host) return origin;
    } catch {
      // Unparseable Origin — fall through to the trusted host.
    }
  }

  return selfOrigin ?? SITE_URL;
}
