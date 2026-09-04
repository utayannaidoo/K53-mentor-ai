-- 0028: persist the learner's decision to defer the diagnostic.
-- ============================================================================
-- `diagnosticSkippedAt` previously lived only in localStorage. It made the
-- same-browser flow work, but a later sign-in on another device had no way to
-- distinguish "I chose to do this later" from "I have never seen this step",
-- so /continue forced the diagnostic again.

alter table public.profiles
  add column if not exists diagnostic_skipped_at timestamptz;

-- 0020 replaced table-wide client writes with explicit column allow-lists.
-- This is learner-owned onboarding state, still scoped to the caller's own
-- profile by the existing `own_profile` RLS policy.
grant update (diagnostic_skipped_at)
  on public.profiles to anon, authenticated;

grant insert (diagnostic_skipped_at)
  on public.profiles to anon, authenticated;
