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
  "PAYSTACK_ALLOW_TEST_KEY",
  "VERCEL_ENV",
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

  it("throws on a production deployment with no site URL", async () => {
    const guard = await siteUrl({
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_ENV: "production",
    });
    expect(guard).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("stays quiet once the site URL is set", async () => {
    const guard = await siteUrl({
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://k53mentorai.co.za",
    });
    expect(guard).not.toThrow();
  });

  it("does not break a preview deployment that has no site URL of its own", async () => {
    // Regression: an earlier version keyed off NODE_ENV + VERCEL alone, which
    // are both set on previews too, so it 500'd every preview deployment on the
    // first request — the Preview scope carries no NEXT_PUBLIC_SITE_URL. A
    // preview with a localhost canonical is cosmetic; a dead preview is not.
    const guard = await siteUrl({
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_ENV: "preview",
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

  it("rejects the deploy URL on a production deployment", async () => {
    // A vercel.app origin is valid, serves fine, and quietly publishes
    // canonicals pointing away from the custom domain. Nothing else catches it.
    const guard = await siteUrl({
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://k53-mentor-ai.vercel.app",
    });
    expect(guard).toThrow(/deploy URL/);
  });

  it("allows the deploy URL on a preview deployment, which genuinely lives there", async () => {
    // Previews run with NODE_ENV=production and VERCEL=1 too, so gating this on
    // the broader hosted-production check would break every preview build.
    const guard = await siteUrl({
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_ENV: "preview",
      NEXT_PUBLIC_SITE_URL: "https://k53-mentor-ai-git-branch.vercel.app",
    });
    expect(guard).not.toThrow();
  });

  it("does not mistake a lookalike host for the deploy URL", async () => {
    const guard = await siteUrl({
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://notvercel.app.k53mentorai.co.za",
    });
    expect(guard).not.toThrow();
  });

  it("rejects a value missing its scheme, which would break every URL built from it", async () => {
    const guard = await siteUrl({
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "k53mentorai.co.za",
    });
    expect(guard).toThrow(/valid absolute URL/);
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
      VERCEL_ENV: "production",
      PAYSTACK_SECRET_KEY: "sk_test_abc123",
    });
    expect(guard).toThrow(/sk_live_/);
  });

  it("stays quiet on a live key", async () => {
    const guard = await paystack({
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_ENV: "production",
      PAYSTACK_SECRET_KEY: "sk_live_abc123",
    });
    expect(guard).not.toThrow();
  });

  it("stays quiet when Paystack is unconfigured — billing is optional", async () => {
    const guard = await paystack({
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_ENV: "production",
    });
    expect(guard).not.toThrow();
  });

  it("stays quiet in local development, where a test key is the point", async () => {
    const guard = await paystack({
      NODE_ENV: "development",
      PAYSTACK_SECRET_KEY: "sk_test_abc123",
    });
    expect(guard).not.toThrow();
  });

  it("allows a test key in production when explicitly opted in", async () => {
    // Real window: before merchant activation there is no live key to hold, and
    // throwing there takes checkout, cancellation and the webhook down for a
    // state the operator cannot yet fix. Opt-in, never a default.
    const guard = await paystack({
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_ENV: "production",
      PAYSTACK_SECRET_KEY: "sk_test_abc123",
      PAYSTACK_ALLOW_TEST_KEY: "1",
    });
    expect(guard).not.toThrow();
  });

  it("only accepts an exact opt-in value, so a stray truthy string is not enough", async () => {
    for (const value of ["true", "yes", "0", ""]) {
      const guard = await paystack({
        NODE_ENV: "production",
        VERCEL: "1",
        VERCEL_ENV: "production",
        PAYSTACK_SECRET_KEY: "sk_test_abc123",
        PAYSTACK_ALLOW_TEST_KEY: value,
      });
      expect(guard, `PAYSTACK_ALLOW_TEST_KEY=${value} must not disable the guard`).toThrow(
        /sk_live_/,
      );
    }
  });

  it("names the escape hatch in the error, so the reader knows the options", async () => {
    const guard = await paystack({
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_ENV: "production",
      PAYSTACK_SECRET_KEY: "sk_test_abc123",
    });
    expect(guard).toThrow(/PAYSTACK_ALLOW_TEST_KEY/);
  });

  it("allows a test key on a preview deployment — that is the merchant-review setup", async () => {
    // Regression: keyed off NODE_ENV + VERCEL alone, this threw at module scope
    // in paystack/client.ts and 500'd every route importing it on every
    // preview — checkout, verify, the webhook and the reconciliation cron —
    // while the site itself stayed up, so nothing surfaced it until a billing
    // route was actually called.
    const guard = await paystack({
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_ENV: "preview",
      PAYSTACK_SECRET_KEY: "sk_test_abc123",
    });
    expect(guard).not.toThrow();
  });
});
