/** Centralised env detection so the app degrades gracefully in local demo mode. */

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export const isSupabaseConfigured = Boolean(
  supabaseConfig.url && supabaseConfig.anonKey,
);

/**
 * Guard a real deployment against shipping without Supabase.
 *
 * Demo mode (no Supabase env) is a deliberate, supported mode — but it is only
 * safe *locally*. On a hosted deploy the same missing env silently turns the
 * product into an open one: `updateSession` stops protecting every route, and
 * `resolveEntitlement` hands out `premium_plus` with a null user id, so the AI
 * routes answer unauthenticated callers and bill the provider for it.
 *
 * That must fail loudly at boot rather than quietly at runtime. Same shape as
 * the Upstash guard in `src/lib/ai/rate-limit.ts`, including the build-phase
 * exclusion — `next build` prerenders pages without runtime env, so throwing
 * there would break the build instead of the misconfiguration.
 *
 * Exported as a function (not a module-scope throw) because this module is
 * also pulled into the client bundle by `supabase/client.ts`; only the
 * server-side entry points call it.
 */
export function assertSupabaseConfiguredInProduction() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.VERCEL &&
    process.env.NEXT_PHASE !== "phase-production-build" &&
    !isSupabaseConfigured
  ) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in production — " +
        "without them route protection is disabled and every AI route serves unauthenticated callers as premium_plus.",
    );
  }
}

/** Server-only — do not read NEXT_PUBLIC here. */
export const isOpenAIConfigured = Boolean(process.env.OPENAI_API_KEY);

export const isPaystackConfigured = Boolean(process.env.PAYSTACK_SECRET_KEY);

export const OPENAI_MODELS = {
  fast: process.env.OPENAI_MODEL_FAST ?? "gpt-4o-mini",
  smart: process.env.OPENAI_MODEL_SMART ?? "gpt-4o",
};
