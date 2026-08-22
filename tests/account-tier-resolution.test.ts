import { describe, expect, it } from "vitest";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { loadAccount } from "@/lib/supabase/account";

/**
 * The store's display tier must expire exactly when the server gates say it
 * does. loadAccount used to read the raw `subscriptions.tier` column, so a
 * cancelled-and-expired subscription kept every screen outside /account/billing
 * claiming Premium long after entitlements had dropped it.
 */

const NOW = Date.parse("2026-08-21T12:00:00Z");
const iso = (ms: number) => new Date(ms).toISOString();

function supabaseWithRow(row: Record<string, unknown> | null): SupabaseClient {
  const chain = (data: unknown) => {
    const c = {
      select: () => c,
      eq: () => c,
      maybeSingle: async () => ({ data }),
    };
    return c;
  };
  return {
    from: (table: string) =>
      chain(table === "subscriptions" ? row : null),
  } as unknown as SupabaseClient;
}

const user = { id: "u1", email: "u@example.com" } as unknown as User;

const activeRow = (over: Record<string, unknown> = {}) => ({
  tier: "premium_plus",
  status: "active",
  cancel_at_period_end: false,
  current_period_end: iso(NOW + 10 * 86_400_000),
  ...over,
});

describe("loadAccount resolves the display tier through the shared rule", () => {
  it("keeps an actively-renewing subscription at its paid tier", async () => {
    const account = await loadAccount(supabaseWithRow(activeRow()), user);
    expect(account.tier).toBe("premium_plus");
  });

  it("expires a row whose period ended beyond the grace window", async () => {
    // THE bug: raw-column read kept this Premium everywhere in the UI while
    // every server gate had already resolved it to free.
    const account = await loadAccount(
      supabaseWithRow(activeRow({ current_period_end: iso(NOW - 10 * 86_400_000) })),
      user,
    );
    expect(account.tier).toBe("free");
  });

  it("still honours the retry grace window on an unflagged row", async () => {
    const account = await loadAccount(
      supabaseWithRow(activeRow({ current_period_end: iso(NOW - 1 * 86_400_000) })),
      user,
    );
    expect(account.tier).toBe("premium_plus");
  });

  it("expires a cancelled row the moment its period ends", async () => {
    const account = await loadAccount(
      supabaseWithRow(
        activeRow({ cancel_at_period_end: true, current_period_end: iso(NOW - 60_000) }),
      ),
      user,
    );
    expect(account.tier).toBe("free");
  });

  it("resolves a missing row to free", async () => {
    const account = await loadAccount(supabaseWithRow(null), user);
    expect(account.tier).toBe("free");
  });
});
