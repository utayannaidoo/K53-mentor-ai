import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/safe-next";

export const runtime = "nodejs";

/** OTP link types Supabase can send us; anything else is rejected. */
const OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

/**
 * Lands every Supabase auth redirect — email confirmation, password recovery,
 * magic link, OAuth — and forwards the user on with a session.
 *
 * Two link shapes arrive here and BOTH must work:
 *
 *  - `?code=…`        PKCE. Only works in the browser that started the flow,
 *                     because the code verifier lives in that browser's
 *                     cookies. Signing up on a laptop and opening the email on
 *                     a phone lands here with a code we cannot exchange.
 *  - `?token_hash=…&type=…`  A one-time token verified server-side, so it works
 *                     from any device. Confirmation emails should use this
 *                     (see docs/ops/supabase-auth-setup.md for the template).
 *
 * Supabase can also bounce back with `?error=…` (expired or already-used link).
 * Every failure carries a reason to /login so the user is told what happened
 * instead of silently landing on an empty form.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  // Same-site relative paths only — see safeNextPath for what that rejects and
  // why. Shared with the auth form and /continue so there is one rule, not
  // three copies of a regex to keep in step.
  const safeNext = safeNextPath(searchParams.get("next")) ?? "/dashboard";

  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/login?error=${reason}`);

  // Supabase rejected the link before it ever reached us (expired, already
  // used, cancelled at the provider).
  const providerError = searchParams.get("error_code") ?? searchParams.get("error");
  if (providerError) {
    return fail(/expired|otp/i.test(providerError) ? "expired" : "auth");
  }

  const supabase = await createClient();
  if (!supabase) return fail("auth");

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && type && OTP_TYPES.has(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
    return fail(/expired|invalid/i.test(error.message) ? "expired" : "auth");
  }

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
    // The verifier cookie is missing — the link was opened somewhere other than
    // the browser that requested it. Worth its own message: the account is
    // fine, the user just has to finish where they started.
    if (/verifier/i.test(error.message)) return fail("device");
    return fail(/expired|invalid/i.test(error.message) ? "expired" : "auth");
  }

  return fail("auth");
}
