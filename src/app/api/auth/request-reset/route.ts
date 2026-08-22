import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { clientIp, limitAuthReset } from "@/lib/ai/rate-limit";
import { buildAuthCaptchaOptions } from "@/lib/auth/captcha";

export const runtime = "nodejs";

/**
 * Password-reset email requests, proxied server-side.
 *
 * The reset page used to call GoTrue directly from the browser, so the only
 * bound on how many reset emails one IP could trigger was GoTrue's own limiter
 * — a script could email-bomb any inbox all day. This route applies a real
 * per-IP daily cap BEFORE anything touches Supabase.
 *
 * PKCE: this MUST go through the SSR client (`createClient` from
 * "@/lib/supabase/server"), never a hand-rolled fetch. The reset link is a
 * PKCE flow — supabase-js stores a code_verifier for it, and with the SSR
 * client that verifier lands in the request's cookies and rides back to the
 * browser via Set-Cookie, exactly where /auth/callback later reads it. A raw
 * fetch would mint a link no browser could complete.
 */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// GoTrue's limiter answers with prose, not numbers — we can only offer a
// conservative "try again in a minute or two".
const GOTRUE_RATE_LIMITED_RETRY_AFTER_S = 60;

/** Loose shape check on a caller-supplied redirect target; null if unusable. */
function safeRedirectTo(v: unknown): string | null {
  if (typeof v !== "string" || v.length === 0 || v.length > 2048) return null;
  try {
    const u = new URL(v);
    // Absolute http(s) only. GoTrue still enforces its own redirect allowlist
    // on top of this — this is defense in depth, not the real gate.
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  // Per-IP cap first — an over-limit flood must never reach Supabase at all.
  const rl = await limitAuthReset(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  if (!isSupabaseConfigured) {
    // Demo mode has no accounts to reset — mirror /api/account/delete.
    return Response.json({ ok: true, demo: true });
  }

  let body: { email?: unknown; redirectTo?: unknown; captchaToken?: unknown } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    // Handled by the validation below.
  }
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || email.length > 320 || !EMAIL_RE.test(email)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const redirectTo = safeRedirectTo(body.redirectTo);
  if (redirectTo === null && body.redirectTo !== undefined) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  // Same shape check as redirectTo: present-but-garbage is a 400, absent is
  // normal (captcha off, or a client that predates the widget). We do NOT
  // verify the token — GoTrue owns verification via its dashboard secret.
  const captchaToken =
    typeof body.captchaToken === "string" && body.captchaToken.length > 0 && body.captchaToken.length <= 2048
      ? body.captchaToken
      : null;
  if (captchaToken === null && body.captchaToken !== undefined) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) return Response.json({ ok: true, demo: true });

  const { error } = await supabase.auth.resetPasswordForEmail(
    email,
    redirectTo !== null || captchaToken !== null
      ? { ...(redirectTo !== null && { redirectTo }), ...buildAuthCaptchaOptions(captchaToken) }
      : undefined,
  );
  if (error) {
    // GoTrue's recover endpoint returns 200 whether or not the account exists;
    // the errors it does raise are about transport/limits, not enumeration.
    // Rate limiting is surfaced honestly (it fails whatever the address, so
    // naming it leaks nothing); every other failure is swallowed as ok:true so
    // the response never reveals whether an account exists.
    if (error.status === 429 || /rate|too many/i.test(error.message)) {
      return Response.json(
        { error: "rate_limited", retryAfter: GOTRUE_RATE_LIMITED_RETRY_AFTER_S },
        { status: 429, headers: { "Retry-After": String(GOTRUE_RATE_LIMITED_RETRY_AFTER_S) } },
      );
    }
    console.error("auth/request-reset failed", error.message);
  }

  // Enumeration safety: identical success either way.
  return Response.json({ ok: true });
}
