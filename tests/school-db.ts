import { readFileSync } from "node:fs";
import { freshPglite, type TestDb } from "./partner-db";

export { hasPartnerDb } from "./partner-db";

/**
 * An in-process Postgres with the school workspace migrations applied.
 *
 * Reuses the partner programme's PGlite runtime (installed outside the app,
 * required in CI), so these tests run on every push and never touch a real
 * database. The stub below reproduces the production conditions that matter
 * for tenant isolation — not a general Supabase emulation:
 *
 *   - `anon` / `authenticated` without BYPASSRLS, `service_role` with it;
 *   - `auth.uid()` defined exactly as Supabase defines it, reading
 *     request.jwt.claims, so impersonation works the way PostgREST does it;
 *   - **Supabase's default privileges**, which grant every privilege on every
 *     new public table (TRUNCATE included) and EXECUTE on every new function
 *     to anon and authenticated. A migration that forgets to revoke those
 *     passes against a vanilla Postgres and leaks in production — so the stub
 *     recreates them, and the isolation checks fail if 0035 stops revoking.
 */
export async function schoolDb(): Promise<TestDb> {
  const db = await freshPglite(["btree_gist"]);
  await db.exec(`
    -- Supabase installs extensions into their own schema; 0036 relies on it.
    create schema extensions;

    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;

    create schema auth;
    grant usage on schema auth to anon, authenticated, service_role;
    create table auth.users (
      id uuid primary key, email text, aud text, role text, raw_user_meta_data jsonb
    );
    create function auth.uid() returns uuid language sql stable as $$
      select coalesce(
        nullif(current_setting('request.jwt.claim.sub', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
      )::uuid
    $$;
    grant execute on function auth.uid() to anon, authenticated, service_role;

    -- The learner tables 0033 and 0035 touch, with only the columns they use.
    create table public.profiles (
      id uuid primary key references auth.users on delete cascade, full_name text, email text,
      referral_code text, referred_by uuid
    );
    create table public.streaks (user_id uuid primary key, cp int);
    create table public.subscriptions (
      user_id uuid primary key, tier text default 'free', paid_at timestamptz,
      last_charge_reference text, refunded_at timestamptz, disputed_at timestamptz
    );

    -- Mirrors production's handle_new_user closely enough that a new auth user
    -- gets a profile with a name, as the membership RPCs expect.
    create function public.handle_new_user() returns trigger language plpgsql
      security definer set search_path = public as $$
    begin
      insert into public.profiles (id, full_name, email)
        values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email)
        on conflict (id) do nothing;
      insert into public.streaks (user_id) values (new.id) on conflict do nothing;
      insert into public.subscriptions (user_id) values (new.id) on conflict do nothing;
      return new;
    end $$;
    create trigger on_auth_user_created after insert on auth.users
      for each row execute function public.handle_new_user();

    -- The hazard, reproduced. See the header comment.
    alter default privileges in schema public
      grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public
      grant execute on functions to anon, authenticated, service_role;
  `);

  // Every migration the school tables depend on, in order.
  for (const file of [
    "0033_driving_school_partners.sql",
    "0034_partner_payout_offset.sql",
    "0035_school_workspaces.sql",
    "0036_school_diary.sql",
    "0037_school_lesson_record.sql",
    "0038_school_money.sql",
    "0039_school_enquiries_tests.sql",
    "0040_school_billing_periods.sql",
    "0041_school_account_deletion.sql",
    "0042_school_commission_credit.sql",
  ]) {
    await db.exec(readFileSync(`supabase/migrations/${file}`, "utf8"));
  }
  return db;
}

/**
 * Runs one of the `supabase/tests/*.sql` check scripts and returns its verdict.
 *
 * Each script always ends in an exception — that is how it guarantees nothing
 * it created survives, even when run against production — so the verdict
 * arrives as the error message rather than a result.
 */
export async function runIsolationScript(
  db: TestDb,
  file = "supabase/tests/school_isolation.sql",
): Promise<string> {
  const script = readFileSync(file, "utf8");
  try {
    await db.exec(script);
    return "NO VERDICT: the script finished without raising, so nothing was rolled back";
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}
