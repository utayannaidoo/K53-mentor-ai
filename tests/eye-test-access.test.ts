import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SubscriptionTier } from "@/types";

/**
 * Who reaches the eye-test screener, and what they see when it isn't open yet.
 *
 * Two rules, and the tests exist because each was once broken the other way.
 *
 * 1. The screener is FREE on every tier. It is a DLTC admin step, not study
 *    content, so no plan gates it. It used to require `licencePrep`, which
 *    made it a Premium Plus perk in the pricing copy — if a tier check ever
 *    comes back here, that copy silently becomes a lie again.
 * 2. Signing in is the whole entitlement. The release flag decides what a
 *    signed-in learner sees, never whether they exist to us — but a signed-out
 *    caller must still get nothing, or the URL advertises an unreleased
 *    feature to the open web.
 */

const ENV = { ...process.env };

const SUPABASE_ON = {
  NODE_ENV: "production",
  VERCEL: "1",
  VERCEL_ENV: "production",
  NEXT_PHASE: undefined,
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
};

/** Who the mocked Supabase session and tier lookup answer with. */
let sessionEmail: string | null = null;
let tier: SubscriptionTier = "free";

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: sessionEmail ? { email: sessionEmail } : null } }) },
  }),
}));

/**
 * The gate no longer calls `resolveTier` — signing in is the whole
 * entitlement, and `getUser()` has already answered that. This mock stays as
 * the tripwire for rule 1: if a tier check is ever reintroduced here, it will
 * read `tier` from this mock, and the free-tier cases below start failing
 * instead of the pricing copy quietly becoming wrong.
 */
vi.mock("@/lib/billing/entitlements.server", () => ({
  resolveTier: async () => ({ userId: "user-1", tier }),
}));

async function access(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [k, v] of Object.entries({ ...SUPABASE_ON, ...env })) {
    if (v === undefined) delete (process.env as Record<string, string | undefined>)[k];
    else (process.env as Record<string, string | undefined>)[k] = v;
  }
  const mod = await import("@/lib/billing/preview-access.server");
  return mod.resolveEyeTestAccess();
}

beforeEach(() => {
  vi.resetModules();
  sessionEmail = null;
  tier = "free";
});
afterEach(() => {
  for (const k of Object.keys(process.env)) if (!(k in ENV)) delete process.env[k];
  Object.assign(process.env, ENV);
  vi.resetModules();
});

describe("before release", () => {
  const DARK = { EYE_TEST_RELEASED: undefined, EYE_TEST_ALLOWLIST: undefined };

  it("tells a signed-in learner it is coming, rather than 404ing them", async () => {
    sessionEmail = "learner@example.com";
    for (const t of ["free", "premium", "premium_plus"] as const) {
      tier = t;
      await expect(access(DARK)).resolves.toBe("coming-soon");
    }
  });

  it("still hides it from a signed-out caller", async () => {
    sessionEmail = null;
    await expect(access(DARK)).resolves.toBe("denied");
  });

  it("lets an allowlisted address preview the real thing", async () => {
    sessionEmail = "Owner@Example.com"; // matched case-insensitively
    tier = "free";
    await expect(
      access({ ...DARK, EYE_TEST_ALLOWLIST: "owner@example.com, support@example.com" }),
    ).resolves.toBe("owner");
  });
});

describe("after release", () => {
  const LIVE = { EYE_TEST_RELEASED: "1", EYE_TEST_ALLOWLIST: undefined };

  it("serves the screener to every tier, free included", async () => {
    sessionEmail = "learner@example.com";
    for (const t of ["free", "premium", "premium_plus"] as const) {
      tier = t;
      await expect(access(LIVE)).resolves.toBe("entitled");
    }
  });

  it("still refuses a signed-out caller", async () => {
    sessionEmail = null;
    await expect(access(LIVE)).resolves.toBe("denied");
  });

  it("keeps the allowlist working, for support access", async () => {
    sessionEmail = "support@example.com";
    tier = "free";
    await expect(
      access({ ...LIVE, EYE_TEST_ALLOWLIST: "support@example.com" }),
    ).resolves.toBe("owner");
  });
});
