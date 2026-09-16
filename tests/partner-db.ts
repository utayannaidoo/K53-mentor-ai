import { readFileSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Test-only PostgreSQL WASM runtime, installed outside the app. CI sets
// PARTNER_SQL_RUNTIME to its module path; no production dependency is added.
const runtime = process.env.PARTNER_SQL_RUNTIME ?? join(tmpdir(), "k53-partner-sql/node_modules/@electric-sql/pglite/dist/index.js");
export const hasPartnerDb = existsSync(runtime);

/**
 * Every test of the commission rules is `describe.skipIf(!hasPartnerDb)`, which
 * means a missing runtime does not fail the suite — it makes the money tests
 * *vacuously pass*. The default path is under the OS temp directory, which is
 * cleared routinely, so "the suite is green" and "R20 is provably correct" can
 * quietly stop being the same statement, on a developer machine and in CI alike.
 *
 * So CI sets PARTNER_SQL_REQUIRED=1 and this throws instead. A workflow that
 * fails to install the runtime now goes red at import, rather than reporting a
 * clean run in which nothing about the payout path was ever executed.
 */
if (process.env.PARTNER_SQL_REQUIRED === "1" && !hasPartnerDb) {
  throw new Error(
    `PARTNER_SQL_REQUIRED=1 but no Postgres runtime exists at ${runtime}. ` +
      "The partner money tests would have skipped silently. Install the runtime " +
      "(see the 'partner SQL runtime' step in .github/workflows/ci.yml) or unset the variable.",
  );
}
export interface TestDb {
  exec(sql: string): Promise<unknown>;
  query<T = Record<string, unknown>>(sql: string, args?: unknown[]): Promise<{ rows: T[] }>;
  close(): Promise<void>;
}
export async function partnerDb(): Promise<TestDb> {
  const { PGlite } = await import(/* @vite-ignore */ pathToFileURL(runtime).href);
  const db: TestDb = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key,email text);
    create table public.profiles(id uuid primary key references auth.users, referral_code text, referred_by uuid);
    create table public.streaks(user_id uuid primary key,cp int);
    create table public.subscriptions(user_id uuid primary key,tier text default 'free',paid_at timestamptz,
      last_charge_reference text,refunded_at timestamptz,disputed_at timestamptz);
    grant select on public.profiles to authenticated;
    grant insert(id),update(id) on public.profiles to authenticated;
  `);
  // Every partner migration, in order — a test that only loads 0033 would
  // verify rules that production no longer runs.
  for (const file of ["0033_driving_school_partners.sql", "0034_partner_payout_offset.sql"]) {
    await db.exec(readFileSync(`supabase/migrations/${file}`, "utf8"));
  }
  return db;
}
export const school = "10000000-0000-0000-0000-000000000001";
export function user(n: number) { return `20000000-0000-0000-0000-${String(n).padStart(12,"0")}`; }
export async function seed(db: TestDb, count = 1) {
  await db.query(`insert into partner_schools(id,name,contact_name,contact_email,status) values($1,'Kasi Driving School','Owner','owner@example.com','active')`,[school]);
  await db.query(`insert into partner_school_codes(school_id,code) values($1,'kasi-school')`,[school]);
  for(let i=1;i<=count;i++) {
    await db.query(`insert into auth.users values($1,$2)`,[user(i),`learner${i}@example.com`]);
    await db.query(`insert into profiles(id) values($1)`,[user(i)]);
    await db.query(`insert into subscriptions(user_id) values($1)`,[user(i)]);
  }
}
export async function claim(db: TestDb,n=1) {
  return (await db.query(`select claim_school_referral($1,'kasi-school') as value`,[user(n)])).rows[0].value;
}
export async function earn(db: TestDb,n=1,plan="premium",cycle="monthly") {
  await db.query(`update subscriptions set tier=$2,paid_at=now(),last_charge_reference=$3 where user_id=$1`,[user(n),plan,`charge-${n}`]);
  return (await db.query(`select record_school_commission($1,$2,$3,$4,8) as value`,[user(n),`charge-${n}`,plan,cycle])).rows[0].value;
}
