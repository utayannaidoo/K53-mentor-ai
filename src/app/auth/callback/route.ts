import { NextResponse } from "next/server";
import type { EmailOtpType, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/safe-next";
import { sendWelcomeOnce } from "@/lib/notify/welcome";

export const runtime = "nodejs";

/** An account confirmed within this window of creation counts as brand new. */
const NEW_ACCOUNT_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Send the welcome email if this callback just finished a signup.
 *
 * The OAuth path gives no signal that an account is new, so age is the proxy: a
 * `created_at` inside the last day. It is a heuristic, and it does not need to
 * be better than one — `sendWelcomeOnce` is idempotent through the
 * `notifications` ledger, so guessing "new" for a returning user costs a lookup
 * and nothing else. Awaited rather than fired and forgotten, because a
 * serverless function can be frozen the moment it returns the redirect; it
 * never throws, so a mail problem cannot block someone reaching their account.
 */
async function welcomeIfNew(user: User): Promise<void> {
  const created = user.created_at ? Date.parse(user.created_at) : NaN;
  if (Number.isFinite(created) && Date.now() - created > NEW_ACCOUNT_WINDOW_MS) return;
  await sendWelcomeOnce(user.id);
}

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
  //
  // The DEFAULT is /continue, not a destination: /continue is the post-auth
  // router that sends an un-onboarded account through onboarding and the
  // diagnostic before anything else. Every caller above passes an explicit
  // `next`, so this only fires when one was stripped or never set (a template
  // edit, or Supabase's Site-URL fallback) — exactly the arrivals most likely
  // to be brand-new accounts, which /dashboard would drop past both gates.
  const safeNext = safeNextPath(searchParams.get("next")) ?? "/continue";

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
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      // Confirming a signup is the one moment we know an account is new.
      // Recovery and email_change land here too and must not trigger it.
      if (type === "signup" && data.user) await welcomeIfNew(data.user);
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    return fail(/expired|invalid/i.test(error.message) ? "expired" : "auth");
  }

  const code = searchParams.get("code");
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // OAuth signups never carry `type=signup`, so without this every Google
      // account would silently miss the welcome. `welcomeIfNew` decides from
      // the account's age, and the ledger makes a wrong guess harmless.
      if (data.user) await welcomeIfNew(data.user);
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    // The verifier cookie is missing — the link was opened somewhere other than
    // the browser that requested it. Worth its own message: the account is
    // fine, the user just has to finish where they started.
    if (/verifier/i.test(error.message)) return fail("device");
    return fail(/expired|invalid/i.test(error.message) ? "expired" : "auth");
  }

  return fail("auth");
}
