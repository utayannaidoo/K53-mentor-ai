/** Centralised env detection so the app degrades gracefully in local demo mode. */

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export const isSupabaseConfigured = Boolean(
  supabaseConfig.url && supabaseConfig.anonKey,
);

/** Server-only — do not read NEXT_PUBLIC here. */
export const isOpenAIConfigured = Boolean(process.env.OPENAI_API_KEY);

export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

export const OPENAI_MODELS = {
  fast: process.env.OPENAI_MODEL_FAST ?? "gpt-4o-mini",
  smart: process.env.OPENAI_MODEL_SMART ?? "gpt-4o",
};
