import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { clientIp, limitAuthResend } from "@/lib/ai/rate-limit";
import { buildAuthCaptchaOptions } from "@/lib/auth/captcha";

export const runtime = "nodejs";

/**
 * Signup-confirmation resends, proxied server-side.
 *
 * "Send it again" used to call GoTrue straight from the browser, so one IP
 * could mint unlimited confirmation emails at whatever address it typed —
 * a ready-made email bomb. This route caps that per IP per day before any
 * email is triggered.
 *
 * Unlike the reset flow this uses the token_hash template (no PKCE verifier),
 * but it still goes through the SSR client so cookie semantics and the redirect
 * handling stay identical to every other auth path.
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
  const rl = await limitAuthResend(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  if (!isSupabaseConfigured) {
    // Demo mode has no accounts to confirm — mirror /api/account/delete.
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
  // Same shape check as redirectTo; verification itself is GoTrue's job (its
  // dashboard secret), we only relay what the widget produced.
  const captchaToken =
    typeof body.captchaToken === "string" && body.captchaToken.length > 0 && body.captchaToken.length <= 2048
      ? body.captchaToken
      : null;
  if (captchaToken === null && body.captchaToken !== undefined) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) return Response.json({ ok: true, demo: true });

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      ...(redirectTo !== null && { emailRedirectTo: redirectTo }),
      ...buildAuthCaptchaOptions(captchaToken),
    },
  });
  if (error) {
    // Unlike recover, resend CAN error on an unknown address — which would
    // otherwise be a free account-existence oracle. Swallow everything except
    // rate limiting (which fails whatever the address, so naming it leaks
    // nothing about accounts).
    if (error.status === 429 || /rate|too many/i.test(error.message)) {
      return Response.json(
        { error: "rate_limited", retryAfter: GOTRUE_RATE_LIMITED_RETRY_AFTER_S },
        { status: 429, headers: { "Retry-After": String(GOTRUE_RATE_LIMITED_RETRY_AFTER_S) } },
      );
    }
    console.error("auth/resend-confirmation failed", error.message);
  }

  // Enumeration safety: identical success either way.
  return Response.json({ ok: true });
}
