import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };
import { isSupabaseConfigured, supabaseConfig } from "@/lib/env";

/** App areas that require a signed-in user (prefix match). */
const PROTECTED = ["/dashboard", "/study", "/tutor", "/licence-prep", "/account"];
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
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return copyCookies(response, NextResponse.redirect(url));
  }

  // Signed-in user hitting an auth page → send to the dashboard.
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return copyCookies(response, NextResponse.redirect(url));
  }

  return response;
}

/** Carry the refreshed auth cookies onto a redirect response. */
function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie));
  return to;
}
