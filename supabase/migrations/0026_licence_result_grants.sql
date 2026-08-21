-- 0026: grant the client write access to the licence-result columns.
-- ============================================================================
-- 0024 added six columns to public.profiles (licence_result,
-- licence_result_at, licence_result_test_date and the drivers_* trio) but did
-- not extend the column-level grants, because 0020 had — deliberately —
-- revoked the table-wide UPDATE/INSERT from anon/authenticated and re-granted
-- an explicit allow-list. Any profile upsert that names one of the new columns
-- therefore fails with 42501 (permission denied for column), and PostgREST
-- fails the WHOLE statement: the learner's name, vehicle code and test date go
-- down with the licence result. This is exactly the deploy-order hazard 0024's
-- own header warns about, missed on the privilege half.
--
-- Fix mirrors 0020's shape: extend both allow-lists with the six columns. RLS
-- is unchanged — `own_profile` (0001) still scopes every write to auth.uid(),
-- so a learner can record only their own results.

-- ── UPDATE ──────────────────────────────────────────────────────────────────
grant update (
  licence_result, licence_result_at, licence_result_test_date,
  drivers_result, drivers_result_at, drivers_result_test_date
) on public.profiles to anon, authenticated;

-- ── INSERT ──────────────────────────────────────────────────────────────────
grant insert (
  licence_result, licence_result_at, licence_result_test_date,
  drivers_result, drivers_result_at, drivers_result_test_date
) on public.profiles to anon, authenticated;
