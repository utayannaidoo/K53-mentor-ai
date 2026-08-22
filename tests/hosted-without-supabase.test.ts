import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * A hosted deploy with no Supabase must be **inert**, not generous.
 *
 * It used to be prevented rather than handled: `assertSupabaseConfiguredInProduction`
 * threw at module scope, so the deployment simply refused to start. That is the
 * right answer for production and the wrong one for previews, which legitimately
 * run without Supabase — every preview URL returned a blank
 * MIDDLEWARE_INVOCATION_FAILED, behind a green CI run, so no PR could be looked
 * at before merging.
 *
 * Narrowing the guard to production means "hosted without Supabase" is now a
 * state that really occurs, and every demo-mode shortcut that assumed it could
 * not has to hold its own. These pin the three that matter.
 */

const ENV = { ...process.env };

/** Reload the modules under test with a fresh view of process.env. */
async function load(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete (process.env as Record<string, string | undefined>)[k];
    else (process.env as Record<string, string | undefined>)[k] = v;
  }
  return {
    entitlements: await import("@/lib/billing/entitlements.server"),
    previewAccess: await import("@/lib/billing/preview-access.server"),
    env: await import("@/lib/env"),
  };
}

const HOSTED_NO_SUPABASE = {
  NODE_ENV: "production",
  VERCEL: "1",
  VERCEL_ENV: "preview",
  NEXT_PHASE: undefined,
  NEXT_PUBLIC_SUPABASE_URL: undefined,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
};

const LOCAL_NO_SUPABASE = {
  NODE_ENV: "development",
  VERCEL: undefined,
  VERCEL_ENV: undefined,
  NEXT_PHASE: undefined,
  NEXT_PUBLIC_SUPABASE_URL: undefined,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
};

/**
 * A production build on a host OTHER than Vercel (Docker, Railway, Fly…).
 * The fail-closed branches used to key on the VERCEL env var alone, so this
 * runtime fell through to the local-demo branch and served premium content,
 * AI spend and unreleased features to anonymous callers.
 */
const NON_VERCEL_PROD_NO_SUPABASE = {
  NODE_ENV: "production",
  VERCEL: undefined,
  VERCEL_ENV: undefined,
  NEXT_PHASE: undefined,
  NEXT_PUBLIC_SUPABASE_URL: undefined,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
};

beforeEach(() => vi.resetModules());
afterEach(() => {
  for (const k of Object.keys(process.env)) if (!(k in ENV)) delete process.env[k];
  Object.assign(process.env, ENV);
  vi.resetModules();
});

describe("a preview without Supabase boots", () => {
  it("does not throw at import time", async () => {
    // The whole bug: this throw ran at module scope in the middleware, so it
    // was not a loud failure — it was a 500 on every request.
    await expect(load(HOSTED_NO_SUPABASE)).resolves.toBeTruthy();
  });

  it("still refuses to let production ship without Supabase", async () => {
    // Importing entitlements.server would trip the guard at module scope before
    // returning — which IS the production behaviour under test, so load env
    // alone and call it directly.
    vi.resetModules();
    Object.assign(process.env, { ...HOSTED_NO_SUPABASE, VERCEL_ENV: "production" });
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const env = await import("@/lib/env");
    expect(() => env.assertSupabaseConfiguredInProduction()).toThrow(/must be set in production/i);
  });

  it("brings the whole deployment down at import, not quietly at runtime", async () => {
    // The server modules assert at module scope on purpose: a production deploy
    // missing Supabase must not start at all.
    vi.resetModules();
    Object.assign(process.env, { ...HOSTED_NO_SUPABASE, VERCEL_ENV: "production" });
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    await expect(import("@/lib/billing/entitlements.server")).rejects.toThrow(
      /must be set in production/i,
    );
  });

  it("lets production boot once Supabase is configured", async () => {
    const { env } = await load({
      ...HOSTED_NO_SUPABASE,
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    });
    expect(() => env.assertSupabaseConfiguredInProduction()).not.toThrow();
  });
});

describe("nothing paid is served to callers who cannot be identified", () => {
  it("fails the tier closed to free on a hosted runtime", async () => {
    // This branch used to answer premium_plus with a null user id, on a public
    // URL. That is what the boot guard was really protecting.
    const { entitlements } = await load(HOSTED_NO_SUPABASE);
    const tier = await entitlements.resolveTier();
    expect(tier).toEqual({ userId: null, tier: "free" });
  });

  it("refuses to spend on AI at all", async () => {
    const { entitlements } = await load(HOSTED_NO_SUPABASE);
    for (const surface of ["tutor", "coach", "vision"] as const) {
      const res = await entitlements.resolveEntitlement(surface);
      expect(res, surface).toBeInstanceOf(Response);
      expect((res as Response).status, surface).toBe(503);
    }
  });

  it("keeps unreleased features hidden", async () => {
    // resolveEyeTestAccess used to return "owner" here, on the stated grounds
    // that the branch was unreachable on a hosted deploy. It no longer is.
    const { previewAccess } = await load(HOSTED_NO_SUPABASE);
    await expect(previewAccess.resolveEyeTestAccess()).resolves.toBe("denied");
  });
});

describe("a production runtime on any host fails closed without Supabase", () => {
  it("resolves the tier to free, not the demo premium_plus", async () => {
    const { entitlements } = await load(NON_VERCEL_PROD_NO_SUPABASE);
    await expect(entitlements.resolveTier()).resolves.toEqual({
      userId: null,
      tier: "free",
    });
  });

  it("refuses AI spend entirely", async () => {
    const { entitlements } = await load(NON_VERCEL_PROD_NO_SUPABASE);
    for (const surface of ["tutor", "coach", "vision"] as const) {
      const res = await entitlements.resolveEntitlement(surface);
      expect(res, surface).toBeInstanceOf(Response);
      expect((res as Response).status, surface).toBe(503);
    }
  });

  it("keeps unreleased features hidden", async () => {
    const { previewAccess } = await load(NON_VERCEL_PROD_NO_SUPABASE);
    await expect(previewAccess.resolveEyeTestAccess()).resolves.toBe("denied");
  });
});

describe("local demo mode is untouched", () => {
  it("still serves the open tier so the zero-config demo works", async () => {
    const { entitlements } = await load(LOCAL_NO_SUPABASE);
    await expect(entitlements.resolveTier()).resolves.toEqual({
      userId: null,
      tier: "premium_plus",
    });
  });

  it("still opens the AI surfaces and the unreleased pages", async () => {
    const { entitlements, previewAccess } = await load(LOCAL_NO_SUPABASE);
    const res = await entitlements.resolveEntitlement("tutor");
    expect(res).not.toBeInstanceOf(Response);
    await expect(previewAccess.resolveEyeTestAccess()).resolves.toBe("owner");
  });
});
