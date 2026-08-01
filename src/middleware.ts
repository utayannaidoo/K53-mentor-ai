import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
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
