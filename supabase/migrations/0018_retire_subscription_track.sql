-- 0018: retire the paid vehicle track
-- ============================================================================
-- One plan now covers every licence code. The car vs bike+heavy split priced
-- two products off ~13% differing content, bundled motorcycle learners with
-- Code 14 professionals, and made "what am I studying" a billing decision —
-- which is how a subscriber ended up served another vehicle's content.
--
-- `subscriptions.track` (added in 0017) is left in place, not dropped:
--   * migrations here are append-only, and dropping a column is irreversible;
--   * nothing reads it any more, so it is inert;
--   * the rows already written are a useful record of what early subscribers
--     bought, and a future Code 14 / fleet tier would want the column back.
-- It is simply no longer written, and no longer consulted by content gating.
--
-- `profiles.vehicle_code` is now the single source of truth for which vehicle
-- a learner studies. It is theirs: set at onboarding, changeable in account
-- settings, and never rewritten by a payment (the webhook used to overwrite it
-- to match the paid track).

comment on column public.subscriptions.track is
  'RETIRED (0018). One plan covers every licence code; nothing reads this. Kept for history and as a hook for a future fleet/Code 14 tier. The learner''s vehicle lives in profiles.vehicle_code.';
