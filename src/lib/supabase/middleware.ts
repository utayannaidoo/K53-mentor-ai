import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };
import {
  assertSiteUrlConfiguredInProduction,
  assertSupabaseConfiguredInProduction,
  isSupabaseConfigured,
  supabaseConfig,
} from "@/lib/env";
import { safeNextPath } from "@/lib/auth/safe-next";

// A hosted deploy missing Supabase would silently skip every check below.
assertSupabaseConfiguredInProduction();
// Middleware runs on every page request, so this is the broadest place to
// catch a deploy built without a site origin.
assertSiteUrlConfiguredInProduction();

/** App areas that require a signed-in user (prefix match). */
const PROTECTED = ["/dashboard", "/study", "/tutor", "/licence-prep", "/account", "/eye-test"];
/** Auth pages a signed-in user shouldn't see. */
const AUTH_PAGES = ["/login", "/signup"];

/**
 * Refreshes the Supabase auth session and enforces route protection on every
 * request. No-op in demo mode (no Supabase env) so the local-only demo still
 * works; <AppShell> keeps its client-side guard as a second layer.
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(supabaseConfig.url!, supabaseConfig.anonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touch the session so tokens refresh into the response cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(`${p}/`));
  const isAuthPage = AUTH_PAGES.includes(path);

  // Unauthenticated user hitting a protected page → bounce to login (remember where).
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    // Remember the full URL, not just the path — a bounce from a filtered or
    // paginated view (/study/questions?category=signs) that dropped its query
    // sent the learner back to the unfiltered top of the page after login.
    const target = `${path}${request.nextUrl.search}`;
    url.search = ""; // the protected page's own params must not leak onto /login
    url.pathname = "/login";
    url.searchParams.set("next", target);
    return copyCookies(response, NextResponse.redirect(url));
  }

  // Signed-in user hitting an auth page → see signedInAuthPageDest.
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    const dest = signedInAuthPageDest(url.searchParams);
    url.pathname = dest.pathname;
    url.search = dest.search;
    return copyCookies(response, NextResponse.redirect(url));
  }

  return response;
}

/**
 * Where to send an already-signed-in user who landed on /login or /signup.
 *
 * The marketing pricing CTAs point at `/signup?plan=…&cycle=…` because they are
 * statically rendered and can't know who is signed in. Dropping such a user on
 * the dashboard loses the one thing they told us — that they were trying to buy
 * — so carry the intent through to checkout instead.
 *
 * A `?next=` is carried the same way, for the same reason: someone bounced off
 * a protected page who then signs in elsewhere and reloads the bounced URL
 * still asked for that page. It goes via /continue rather than straight there,
 * because this runs on the server and cannot see whether the account has
 * finished onboarding — /continue can, and applies the same gating the password
 * and OAuth paths get. Without that a half-set-up account would land on a deep
 * link it has no context for.
 */
export function signedInAuthPageDest(params: URLSearchParams): {
  pathname: string;
  search: string;
} {
  const plan = params.get("plan");
  if (plan === "premium" || plan === "premium_plus") {
    // A deliberate purchase intent outranks wherever they were bounced from.
    const cycle = params.get("cycle") === "annual" ? "annual" : "monthly";
    return { pathname: "/account/billing", search: `?buy=${plan}&cycle=${cycle}` };
  }
  const next = safeNextPath(params.get("next"));
  if (next) {
    return { pathname: "/continue", search: `?next=${encodeURIComponent(next)}` };
  }
  return { pathname: "/dashboard", search: "" };
}

/** Carry the refreshed auth cookies onto a redirect response. */
function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie));
  return to;
}
