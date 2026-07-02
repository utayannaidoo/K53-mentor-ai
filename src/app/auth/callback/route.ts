import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Exchanges the `?code=` from a Supabase auth redirect (email confirmation,
 * password recovery, magic link, OAuth) for a session, then forwards the user
 * on. Falls back to /login when something is missing or fails.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  // Only allow same-site relative redirects: a single leading slash, so
  // protocol-relative ("//host") and scheme-ish ("/\") values are rejected.
  const safeNext = /^\/(?![/\\])/.test(next) ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
