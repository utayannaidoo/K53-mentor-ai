import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { touchLastActive } from "@/lib/supabase/account";

/**
 * "When was this learner last here?" has to survive the silent login.
 *
 * `auth.users.last_sign_in_at` moves only on a real credential grant, and
 * after the first login almost nobody performs another — the refresh token
 * restores the session on every later visit. The dashboard figure therefore
 * freezes on signup day while the learner keeps studying, which is how an
 * active account reads as dormant. `profiles.last_active_at` is the column
 * that answers it, and before this the only writer was the debounced study
 * sync: a visit that wrote no progress left no trace at all.
 */

interface Update {
  table: string;
  row: Record<string, unknown>;
  eq: [string, string] | null;
}

/** Minimal Supabase double: records the update and how it was scoped. */
function fakeSupabase() {
  const writes: Update[] = [];
  const client = {
    from: (table: string) => ({
      update: (row: Record<string, unknown>) => {
        const write: Update = { table, row, eq: null };
        writes.push(write);
        return {
          eq: async (column: string, value: string) => {
            write.eq = [column, value];
            return { error: null };
          },
        };
      },
    }),
  } as unknown as SupabaseClient;
  return { client, writes };
}

describe("touchLastActive", () => {
  it("stamps last_active_at on the caller's own row", async () => {
    const { client, writes } = fakeSupabase();
    const before = Date.now();
    await touchLastActive(client, "user-1");

    expect(writes).toHaveLength(1);
    expect(writes[0].table).toBe("profiles");
    expect(writes[0].eq).toEqual(["id", "user-1"]);

    const stamped = Date.parse(writes[0].row.last_active_at as string);
    expect(Number.isNaN(stamped)).toBe(false);
    expect(stamped).toBeGreaterThanOrEqual(before - 1000);
    expect(stamped).toBeLessThanOrEqual(Date.now() + 1000);
  });

  it("writes the timestamp and nothing else", async () => {
    // 0020 re-granted UPDATE column by column, and a stray key here would be
    // a silent profile edit riding along with a presence ping.
    const { client, writes } = fakeSupabase();
    await touchLastActive(client, "user-1");

    expect(Object.keys(writes[0].row)).toEqual(["last_active_at"]);
  });

  it("scopes by id, so a wrong id can never widen into every row", async () => {
    const { client, writes } = fakeSupabase();
    await touchLastActive(client, "someone-else");

    expect(writes[0].eq).toEqual(["id", "someone-else"]);
  });
});
