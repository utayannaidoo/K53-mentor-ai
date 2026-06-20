import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };
import { isSupabaseConfigured, supabaseConfig } from "@/lib/env";

/**
 * Refreshes the Supabase auth session on every request. No-op in demo mode.
 * Route protection itself is handled client-side in <AppShell> so the demo
 * works without a configured backend.
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
  await supabase.auth.getUser();
  return response;
}
