import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateDeletionCode, storeDeletionCode, verifyDeletionCode } from "@/lib/account/deletion-code";

const sha = (c: string) => createHash("sha256").update(c).digest("hex");

/**
 * In-memory stand-in for the single-row account_deletion_codes table, shaped to
 * the exact call chains the helper uses: upsert / select+eq+maybeSingle /
 * update+eq / delete+eq.
 */
function fakeAdmin() {
  const store = new Map<string, { code_hash: string; expires_at: string; attempts: number }>();
  const admin = {
    from: () => ({
      upsert: (row: { user_id: string; code_hash: string; expires_at: string; attempts: number }) => {
        store.set(row.user_id, { code_hash: row.code_hash, expires_at: row.expires_at, attempts: row.attempts });
        return Promise.resolve({ error: null });
      },
      select: () => ({
        eq: (_c: string, id: string) => ({
          maybeSingle: () => Promise.resolve({ data: store.get(id) ?? null, error: null }),
        }),
      }),
      update: (patch: { attempts: number }) => ({
        eq: (_c: string, id: string) => {
          const row = store.get(id);
          if (row) store.set(id, { ...row, attempts: patch.attempts });
          return Promise.resolve({ error: null });
        },
      }),
      delete: () => ({
        eq: (_c: string, id: string) => {
          store.delete(id);
          return Promise.resolve({ error: null });
        },
      }),
    }),
  } as unknown as SupabaseClient;
  return { admin, store };
}

beforeEach(() => vi.restoreAllMocks());

describe("generateDeletionCode", () => {
  it("is always six digits", () => {
    for (let i = 0; i < 200; i++) expect(generateDeletionCode()).toMatch(/^\d{6}$/);
  });
});

describe("verifyDeletionCode", () => {
  it("accepts the right code once, then it's consumed", async () => {
    const { admin, store } = fakeAdmin();
    await storeDeletionCode(admin, "user-1", "123456");

    expect(await verifyDeletionCode(admin, "user-1", "123456")).toBe(true);
    // Burned on success — a replay fails.
    expect(store.has("user-1")).toBe(false);
    expect(await verifyDeletionCode(admin, "user-1", "123456")).toBe(false);
  });

  it("rejects a wrong code and counts the attempt", async () => {
    const { admin, store } = fakeAdmin();
    await storeDeletionCode(admin, "user-1", "123456");

    expect(await verifyDeletionCode(admin, "user-1", "000000")).toBe(false);
    expect(store.get("user-1")?.attempts).toBe(1);
    // The real code still works while attempts remain.
    expect(await verifyDeletionCode(admin, "user-1", "123456")).toBe(true);
  });

  it("burns the code after too many wrong guesses", async () => {
    const { admin, store } = fakeAdmin();
    await storeDeletionCode(admin, "user-1", "123456");
    for (let i = 0; i < 5; i++) await verifyDeletionCode(admin, "user-1", "999999");
    expect(store.has("user-1")).toBe(false);
    // Even the correct code can't be used once it's been burned.
    expect(await verifyDeletionCode(admin, "user-1", "123456")).toBe(false);
  });

  it("rejects and clears an expired code", async () => {
    const { admin, store } = fakeAdmin();
    // Seed a row that's already expired.
    store.set("user-1", { code_hash: sha("123456"), expires_at: new Date(Date.now() - 1000).toISOString(), attempts: 0 });
    expect(await verifyDeletionCode(admin, "user-1", "123456")).toBe(false);
    expect(store.has("user-1")).toBe(false);
  });

  it("returns false when no code was ever issued", async () => {
    const { admin } = fakeAdmin();
    expect(await verifyDeletionCode(admin, "user-1", "123456")).toBe(false);
  });
});
