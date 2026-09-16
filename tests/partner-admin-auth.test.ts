import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * /admin is the only screen that can move partner money, and its entire gate is
 * an env-var allowlist. The case that matters most is the empty one: a deploy
 * that forgets ADMIN_EMAILS must lock everyone out, never let everyone in.
 */
const ORIGINAL = { ...process.env };

let currentEmail: string | null = null;

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: currentEmail ? { email: currentEmail } : null } }),
    },
  }),
}));

async function load() {
  vi.resetModules();
  return import("@/lib/partners/admin-auth");
}

beforeEach(() => {
  currentEmail = "owner@example.com";
  process.env.ADMIN_EMAILS = "owner@example.com";
});

afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.resetModules();
});

describe("partner admin allowlist", () => {
  it("admits an allowlisted signed-in user", async () => {
    const { adminEmail, isAdmin } = await load();
    expect(await adminEmail()).toBe("owner@example.com");
    expect(await isAdmin()).toBe(true);
  });

  it("fails closed when ADMIN_EMAILS is unset", async () => {
    delete process.env.ADMIN_EMAILS;
    const { isAdmin } = await load();
    expect(await isAdmin()).toBe(false);
  });

  it("fails closed when ADMIN_EMAILS is empty or only separators", async () => {
    for (const value of ["", "   ", ",", " , ,"]) {
      process.env.ADMIN_EMAILS = value;
      const { isAdmin } = await load();
      expect(await isAdmin()).toBe(false);
    }
  });

  it("refuses a signed-in learner who is not on the list", async () => {
    currentEmail = "learner@example.com";
    const { isAdmin } = await load();
    expect(await isAdmin()).toBe(false);
  });

  it("refuses a signed-out visitor", async () => {
    currentEmail = null;
    const { isAdmin } = await load();
    expect(await isAdmin()).toBe(false);
  });

  it("ignores case and surrounding spaces in both the list and the session", async () => {
    process.env.ADMIN_EMAILS = " Owner@Example.com , second@example.com ";
    currentEmail = "OWNER@EXAMPLE.COM";
    const { isAdmin } = await load();
    expect(await isAdmin()).toBe(true);
  });

  it("supports more than one admin", async () => {
    process.env.ADMIN_EMAILS = "owner@example.com,second@example.com";
    currentEmail = "second@example.com";
    const { isAdmin } = await load();
    expect(await isAdmin()).toBe(true);
  });

  it("does not treat a substring match as membership", async () => {
    process.env.ADMIN_EMAILS = "owner@example.com";
    currentEmail = "notowner@example.com";
    const { isAdmin } = await load();
    expect(await isAdmin()).toBe(false);
  });
});
