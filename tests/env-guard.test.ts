import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Demo mode (no Supabase env) is supported and must keep working — but only
 * locally. On a hosted deploy the same missing env silently disables route
 * protection and makes `resolveEntitlement` return premium_plus with no user,
 * so the AI routes answer anonymous callers. The guard has to fire there and
 * stay quiet everywhere else.
 *
 * `isSupabaseConfigured` is computed at module scope, so every case resets the
 * module registry and re-imports with the env it wants.
 */

const ENV_KEYS = [
  "NODE_ENV",
  "VERCEL",
  "NEXT_PHASE",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "PAYSTACK_SECRET_KEY",
] as const;

// NODE_ENV is typed readonly on ProcessEnv; tests legitimately need to move it.
const env = process.env as Record<string, string | undefined>;

const original = Object.fromEntries(ENV_KEYS.map((k) => [k, env[k]]));

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (original[k] === undefined) delete env[k];
    else env[k] = original[k];
  }
  vi.resetModules();
});

type EnvVars = Partial<Record<(typeof ENV_KEYS)[number], string>>;

/** Load a fresh copy of the env module under a given environment. */
async function envUnder(vars: EnvVars) {
  vi.resetModules();
  for (const k of ENV_KEYS) delete env[k];
  for (const [k, v] of Object.entries(vars)) {
    if (v !== undefined) env[k] = v;
  }
  return import("@/lib/env");
}

/** Load a fresh copy of the guard under a given environment. */
async function guardUnder(vars: EnvVars) {
  return (await envUnder(vars)).assertSupabaseConfiguredInProduction;
}

const SUPABASE_SET = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
};

describe("assertSupabaseConfiguredInProduction", () => {
  it("throws on a hosted production deploy with no Supabase env", async () => {
    const guard = await guardUnder({ NODE_ENV: "production", VERCEL: "1" });
    expect(guard).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("stays quiet when Supabase is configured in production", async () => {
    const guard = await guardUnder({ NODE_ENV: "production", VERCEL: "1", ...SUPABASE_SET });
    expect(guard).not.toThrow();
  });

  it("stays quiet during the production build (prerender has no runtime env)", async () => {
    const guard = await guardUnder({
      NODE_ENV: "production",
      VERCEL: "1",
      NEXT_PHASE: "phase-production-build",
    });
    expect(guard).not.toThrow();
  });

  it("stays quiet off Vercel — a local production build is still demo mode", async () => {
    const guard = await guardUnder({ NODE_ENV: "production" });
    expect(guard).not.toThrow();
  });

  it("stays quiet in development, so zero-config demo mode keeps working", async () => {
    const guard = await guardUnder({ NODE_ENV: "development" });
    expect(guard).not.toThrow();
  });

  it("treats a half-configured deploy (url but no anon key) as unconfigured", async () => {
    const guard = await guardUnder({
      NODE_ENV: "production",
      VERCEL: "1",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    });
    expect(guard).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });
});

/**
 * SITE_URL's fallback is http://localhost:3000, and it feeds metadataBase,
 * every canonical, the whole sitemap, robots.txt and every transactional email
 * link. Shipping without it is silent, so the guard is the only thing that
 * turns "nothing is indexed and the receipt links are dead" into a boot error.
 */
describe("assertSiteUrlConfiguredInProduction", () => {
  const siteUrl = async (vars: EnvVars) =>
    (await envUnder(vars)).assertSiteUrlConfiguredInProduction;

  it("throws on a hosted production deploy with no site URL", async () => {
    expect(await siteUrl({ NODE_ENV: "production", VERCEL: "1" })).toThrow(
      /NEXT_PUBLIC_SITE_URL/,
    );
  });

  it("stays quiet once the site URL is set", async () => {
    const guard = await siteUrl({
      NODE_ENV: "production",
      VERCEL: "1",
      NEXT_PUBLIC_SITE_URL: "https://k53mentor.co.za",
    });
    expect(guard).not.toThrow();
  });

  it("stays quiet during the production build", async () => {
    const guard = await siteUrl({
      NODE_ENV: "production",
      VERCEL: "1",
      NEXT_PHASE: "phase-production-build",
    });
    expect(guard).not.toThrow();
  });

  it("stays quiet in local development", async () => {
    expect(await siteUrl({ NODE_ENV: "development" })).not.toThrow();
  });
});

/**
 * A production deploy carrying sk_test_ accepts Paystack's test cards, and the
 * webhook grants a real paid tier for them — the product is quietly free to
 * anyone who knows the test card numbers.
 */
describe("assertLivePaystackKeyInProduction", () => {
  const paystack = async (vars: EnvVars) =>
    (await envUnder(vars)).assertLivePaystackKeyInProduction;

  it("throws when production carries a test key", async () => {
    const guard = await paystack({
      NODE_ENV: "production",
      VERCEL: "1",
      PAYSTACK_SECRET_KEY: "sk_test_abc123",
    });
    expect(guard).toThrow(/sk_live_/);
  });

  it("stays quiet on a live key", async () => {
    const guard = await paystack({
      NODE_ENV: "production",
      VERCEL: "1",
      PAYSTACK_SECRET_KEY: "sk_live_abc123",
    });
    expect(guard).not.toThrow();
  });

  it("stays quiet when Paystack is unconfigured — billing is optional", async () => {
    expect(await paystack({ NODE_ENV: "production", VERCEL: "1" })).not.toThrow();
  });

  it("stays quiet in local development, where a test key is the point", async () => {
    const guard = await paystack({
      NODE_ENV: "development",
      PAYSTACK_SECRET_KEY: "sk_test_abc123",
    });
    expect(guard).not.toThrow();
  });
});
