/** Centralised env detection so the app degrades gracefully in local demo mode. */

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export const isSupabaseConfigured = Boolean(
  supabaseConfig.url && supabaseConfig.anonKey,
);

/**
 * A hosted production runtime — the only context where missing env is a real
 * incident rather than the supported local demo mode.
 *
 * The build-phase exclusion matters: `next build` prerenders pages without
 * runtime env, so throwing there would break the build instead of surfacing
 * the misconfiguration. Note this also gates on VERCEL, so the guards below
 * are inert on any other host.
 */
function isHostedProduction() {
  return (
    process.env.NODE_ENV === "production" &&
    Boolean(process.env.VERCEL) &&
    process.env.NEXT_PHASE !== "phase-production-build"
  );
}

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
 * the Upstash guard in `src/lib/ai/rate-limit.ts`.
 *
 * Exported as a function (not a module-scope throw) because this module is
 * also pulled into the client bundle by `supabase/client.ts`; only the
 * server-side entry points call it.
 */
export function assertSupabaseConfiguredInProduction() {
  if (isHostedProduction() && !isSupabaseConfigured) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in production — " +
        "without them route protection is disabled and every AI route serves unauthenticated callers as premium_plus.",
    );
  }
}

/**
 * Guard against deploying with the wrong site origin.
 *
 * `SITE_URL` feeds `metadataBase`, every canonical, all of `sitemap.xml`, the
 * sitemap line in `robots.txt`, both JSON-LD blocks, and the link in every
 * transactional email we send. Getting it wrong is silent in a way that is
 * worse than a crash: the site keeps serving, and only weeks later does it
 * surface as "why is nothing indexed and why do the receipt links go somewhere
 * else".
 *
 * Two distinct failures, because they have different blast radii:
 *
 * 1. **Unset** — falls back to `http://localhost:3000`. Broken on any hosted
 *    deploy, preview included, so this is checked on all of them.
 *
 * 2. **Pointed at the deploy URL** — `https://<project>.vercel.app` is a
 *    perfectly valid origin, which is exactly what makes it dangerous: nothing
 *    errors, and production quietly publishes canonicals telling Google the
 *    real site lives on a hostname you intend to abandon. That is only wrong
 *    on *production* — a preview deployment genuinely does live on vercel.app
 *    and must keep working — so this half gates on `VERCEL_ENV` rather than
 *    the broader hosted-production check.
 *
 * `NEXT_PUBLIC_*` is inlined at build time, so this reads the value baked in
 * during `next build`, not the one sitting in the dashboard now. That is the
 * right check: it catches the case where the var was fixed in Vercel but the
 * app was never rebuilt.
 */
export function assertSiteUrlConfiguredInProduction() {
  if (!isHostedProduction()) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be set in production — without it every canonical, " +
        "sitemap entry, robots.txt sitemap line and transactional email link points at " +
        "http://localhost:3000. Set it in Vercel and redeploy (NEXT_PUBLIC_* is inlined at build time).",
    );
  }

  if (process.env.VERCEL_ENV !== "production") return;

  let host: string;
  try {
    host = new URL(siteUrl).host;
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL is not a valid absolute URL (got "${siteUrl}") — ` +
        "it needs the scheme too, e.g. https://k53mentorai.co.za.",
    );
  }

  if (host === "vercel.app" || host.endsWith(".vercel.app")) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL points at the deploy URL (${host}) on a production deployment. ` +
        "Every canonical, sitemap entry and email link would tell search engines and customers " +
        "that the site lives there rather than on the custom domain. Set it to the custom " +
        "domain and redeploy.",
    );
  }
}

/**
 * Guard against taking real money with test credentials.
 *
 * A production deploy carrying `sk_test_` accepts Paystack's test cards and
 * the webhook grants a real Premium tier for them — the product is silently
 * free to anyone who knows the test card numbers.
 *
 * Deliberately scoped to the billing module rather than a global boot guard:
 * a test-key deploy should break checkout loudly, not take the study app down
 * with it. Unset stays legal — billing is an optional integration.
 */
export function assertLivePaystackKeyInProduction() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (isHostedProduction() && key && !key.startsWith("sk_live_")) {
    throw new Error(
      "PAYSTACK_SECRET_KEY must be a live key (sk_live_…) in production — " +
        "a test key accepts Paystack test cards and grants real paid tiers for them.",
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
