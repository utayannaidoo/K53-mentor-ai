import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { canonicalOrigin, canonicalRedirect } from "@/lib/auth/canonical-host";
import { strandedAuthRedirect } from "@/lib/auth/stranded-callback";
import { isProductionDeployment } from "@/lib/env";
import { SITE_URL } from "@/lib/constants";

// Module scope: this runs on every page request, and neither input can change
// without a new instance. (Both are `process.env` reads that survive into the
// middleware bundle — Next only inlines NEXT_PUBLIC_* on the client — so the
// value comes from the runtime environment, resolved once per cold start.)
const CANONICAL_ORIGIN = canonicalOrigin({
  siteUrl: SITE_URL,
  enforce: isProductionDeployment(),
});

export async function middleware(request: NextRequest) {
  // A plain URL rather than NextURL, so the two helpers below stay pure and
  // unit-testable without importing anything from Next.
  const url = new URL(request.nextUrl.toString());

  // Wrong host — send them to the canonical one before touching the session.
  // The cookies `updateSession` would refresh here belong to a host they are
  // about to leave, and a sign-in started on the wrong one cannot finish
  // (see canonical-host.ts). 308 keeps the method and body intact.
  const elsewhere = canonicalRedirect({
    url,
    // The proxy's view of the host, not the caller's — same reasoning as
    // `callbackOrigin`: a request can claim any Origin it likes.
    requestHost: request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
    canonicalOrigin: CANONICAL_ORIGIN,
  });
  if (elsewhere) return NextResponse.redirect(elsewhere, 308);

  // An auth redirect Supabase bounced to the Site URL instead of our callback.
  const stranded = strandedAuthRedirect(url);
  if (stranded) return NextResponse.redirect(stranded);

  return updateSession(request);
}

export const config = {
  matcher: [
    /**
     * Page navigations only.
     *
     * `updateSession` exists to (a) refresh the session cookie and (b) redirect
     * unauthenticated users away from protected pages. Neither applies to an
     * API call: every route handler already authenticates itself —
     * `resolveEntitlement` or `createClient().auth.getUser()` — and the two
     * that don't are deliberate (`/api/log` is public and rate-limited,
     * `/api/paystack/webhook` is HMAC-verified, and neither has a session).
     * Running here as well meant `auth.getUser()` — a network round-trip to
     * GoTrue, not a local JWT verify — fired twice for every single API
     * request, doubling the auth traffic that is the app's first hard scaling
     * limit. Route handlers can write cookies through `@/lib/supabase/server`,
     * so they still refresh their own session.
     *
     * The public endpoints below (service worker, manifest, robots, sitemap,
     * OG image) have no session either, and each was costing an auth call.
     */
    "/((?!api/|_next/static|_next/image|favicon.svg|sw\\.js|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
