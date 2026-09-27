import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { freshPglite, hasPartnerDb, type TestDb } from "./partner-db";

/**
 * 0045 against real Postgres: the manual-settlement columns land on top of the
 * 0028 queue, re-running the file is harmless (prod migrations are applied by
 * hand in the SQL editor), and a manual EFT reference can only sit on a row
 * that is actually refunded.
 */
const USER = "20000000-0000-0000-0000-000000000001";
/** Each case boots its own Postgres, which takes seconds under full-suite load. */
const BOOT = 60_000;

describe.skipIf(!hasPartnerDb)("pending_refunds manual settlement SQL", () => {
  let db: TestDb | null = null;
  afterEach(async () => {
    await db?.close();
    db = null;
  });

  async function queue(): Promise<TestDb> {
    const fresh = await freshPglite();
    await fresh.exec(`
      create schema auth;
      create table auth.users(id uuid primary key);
      insert into auth.users values ('${USER}');
    `);
    for (const file of ["0028_pending_refunds.sql", "0045_pending_refunds_manual.sql"]) {
      await fresh.exec(readFileSync(`supabase/migrations/${file}`, "utf8"));
    }
    db = fresh;
    return fresh;
  }

  it("applies twice without error", async () => {
    const sql = await queue();
    await sql.exec(readFileSync("supabase/migrations/0045_pending_refunds_manual.sql", "utf8"));
    const { rows } = await sql.query<{ column_name: string }>(
      `select column_name from information_schema.columns
        where table_name = 'pending_refunds' and column_name like 'manual_%' order by 1`,
    );
    expect(rows.map((row) => row.column_name)).toEqual(["manual_recorded_by", "manual_reference"]);
  }, BOOT);

  it("refuses an EFT reference on a row that is still owed", async () => {
    const sql = await queue();
    await sql.query(
      `insert into pending_refunds(user_id, transaction_reference, status) values ($1, 'ref_1', 'failed')`,
      [USER],
    );
    await expect(
      sql.query(`update pending_refunds set manual_reference = 'FNB 1' where transaction_reference = 'ref_1'`),
    ).rejects.toThrow(/pending_refunds_manual_settled/);
  }, BOOT);

  it("records an EFT reference in the same write that settles the row", async () => {
    const sql = await queue();
    await sql.query(
      `insert into pending_refunds(user_id, transaction_reference, status) values ($1, 'ref_1', 'failed')`,
      [USER],
    );
    const { rows } = await sql.query<{ status: string; manual_reference: string }>(
      `update pending_refunds
          set status = 'refunded', refunded_at = now(), manual_reference = 'FNB 1',
              manual_recorded_by = 'owner@example.com'
        where transaction_reference = 'ref_1' and status = 'failed'
        returning status, manual_reference`,
    );
    expect(rows).toEqual([{ status: "refunded", manual_reference: "FNB 1" }]);
  }, BOOT);
});
