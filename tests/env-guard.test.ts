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

/** Load a fresh copy of the guard under a given environment. */
async function guardUnder(vars: Partial<Record<(typeof ENV_KEYS)[number], string>>) {
  vi.resetModules();
  for (const k of ENV_KEYS) delete env[k];
  for (const [k, v] of Object.entries(vars)) {
    if (v !== undefined) env[k] = v;
  }
  const { assertSupabaseConfiguredInProduction } = await import("@/lib/env");
  return assertSupabaseConfiguredInProduction;
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
