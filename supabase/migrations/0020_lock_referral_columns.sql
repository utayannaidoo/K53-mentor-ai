-- 0020: referral columns are server-owned
-- ============================================================================
-- 0009 added `referral_code` (unique) and `referred_by` to public.profiles —
-- a table whose RLS policy is `own_profile ... for all`, so a signed-in user
-- can UPDATE their own row directly and bypass `claim_referral` entirely.
--
-- `claim_referral` is security definer with execute revoked from client roles
-- (0009, 0010), and it guards self-referral and one-claim-per-account. None of
-- that helps when the client never calls it: a plain
--
--     update profiles set referred_by = '<any uuid>' where id = auth.uid()
--
-- inflates the referral count `GET /api/referral` reports for that uuid, and
--
--     update profiles set referral_code = 'something-nice'
--
-- lets a user rewrite their own code or squat a string another account would
-- later be assigned (the column is UNIQUE). No money is exposed — the CP reward
-- only flows through the RPC — but these are server-owned values and the
-- database should say so.
--
-- Note on mechanism: a column-level REVOKE does NOT override a table-level
-- grant. Supabase grants `authenticated`/`anon` table-wide privileges, so the
-- only way to restrict columns is to drop the table-level grant and re-grant
-- the allowed columns explicitly. That is what this does; miss the first step
-- and the migration looks right while changing nothing.
--
-- Every column the client legitimately writes is re-granted below. The two
-- omissions are deliberate. Verified against the only client-side writer,
-- `syncAccount` in src/lib/supabase/account.ts, which touches neither.

-- ── UPDATE ──────────────────────────────────────────────────────────────────
revoke update on public.profiles from anon, authenticated;

grant update (
  id, full_name, email, vehicle_code, goal, test_date, prior_attempts,
  confidence, knowledge_level, study_frequency, onboarded_at, created_at,
  last_active_at, drivers_test_date, worry_categories, email_notifications
) on public.profiles to anon, authenticated;

-- ── INSERT ──────────────────────────────────────────────────────────────────
-- The client upsert inserts on first sync, and `own_profile` is FOR ALL, so a
-- user can also DELETE their row and re-INSERT it. Without this, that is a
-- second route to choosing your own referral_code.
--
-- Omitting the two columns here is safe: `handle_new_user` and the
-- `set_referral_code` BEFORE INSERT trigger both run as their definer, and
-- column privileges are checked against the columns the *statement* names, not
-- what a trigger assigns to NEW.
revoke insert on public.profiles from anon, authenticated;

grant insert (
  id, full_name, email, vehicle_code, goal, test_date, prior_attempts,
  confidence, knowledge_level, study_frequency, onboarded_at, created_at,
  last_active_at, drivers_test_date, worry_categories, email_notifications
) on public.profiles to anon, authenticated;

-- SELECT and DELETE are unchanged: RLS already scopes both to the caller's own
-- row, and reading your own referral code is what the referral page does.
