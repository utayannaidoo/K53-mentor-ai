/**
 * Cloudflare Turnstile support, in its GoTrue-native shape: Supabase owns
 * captcha *verification* — the secret key lives in the Supabase dashboard and
 * GoTrue rejects calls without a valid token once an operator enables it
 * there. Our job is only to render a widget when configured, collect its
 * token, and pass it through as `captchaToken`; everything below is pure,
 * DOM-free decision logic so vitest's node environment can pin every rule.
 * The DOM half (script loading, rendering) lives in components/auth/turnstile.tsx.
 */

/** Exact script URL the widget loader injects; pinned here so tests can assert the contract. */
export const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Whether the operator turned Turnstile on for auth. NEXT_PUBLIC_* is inlined
 * at build time by Next.js, so this is stable within a deployment — flipping
 * it requires a rebuild/redeploy, which is also true of the matching secret
 * in the Supabase dashboard (the pair must go live together or GoTrue rejects
 * every signup). Unset/empty means fully off: no script loads, nothing blocks,
 * demo mode never notices.
 */
export function isCaptchaConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export type CaptchaBlockReason = "missing_token" | "unavailable" | null;

/**
 * The submit gate. Deliberately strict when enabled: quietly submitting
 * without a token would just earn a GoTrue rejection after the round-trip,
 * and a widget that error-callback'd cannot produce a valid solve at all —
 * so both stop here with an inline message instead. Disabled never blocks.
 */
export function shouldBlockSubmit(state: {
  enabled: boolean;
  token: string | null;
  failed: boolean;
}): { block: boolean; reason: CaptchaBlockReason } {
  if (!state.enabled) return { block: false, reason: null };
  if (state.failed) return { block: true, reason: "unavailable" };
  if (!state.token) return { block: true, reason: "missing_token" };
  return { block: false, reason: null };
}

/**
 * Options fragment carrying the token into supabase-js auth calls. Returns
 * `{}` when there is no token so spreading adds no key at all — an explicit
 * `captchaToken: undefined` would be noise, and an empty string could read as
 * "captcha attempted, failed". Callers spread this into signUp /
 * signInWithPassword options, and the email-proxy routes merge it into the
 * resetPasswordForEmail / resend option objects.
 */
export function buildAuthCaptchaOptions(token?: string | null): { captchaToken?: string } {
  return token ? { captchaToken: token } : {};
}
