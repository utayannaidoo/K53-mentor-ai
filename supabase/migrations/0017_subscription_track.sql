-- 0017: record the paid subscription TRACK on the server
-- ============================================================================
-- A plan covers exactly one vehicle track (car = Code 8, or bike+heavy =
-- A/A1/10/14) and that track decides which study content the learner is
-- served. Until now the track lived ONLY in the browser's localStorage, and
-- the only server-side signal was `profiles.vehicle_code` — a client-writable
-- column. So a stale or cross-account cached code could serve a car
-- subscriber motorcycle content, and then be written back over their profile.
--
-- The track belongs next to the tier, on the row only trusted server code can
-- write: 0004 removed the client's write policy on `subscriptions`, so this
-- column is set exclusively by the Paystack webhook / verify grant running
-- under the service role. Clients keep SELECT-only access.
--
-- Left NULL for existing rows on purpose. There is no trustworthy signal to
-- backfill from (`profiles.vehicle_code` is exactly the value this fixes), and
-- a NULL track simply falls back to today's behaviour. The webhook fills it in
-- on the next charge or renewal.

alter table public.subscriptions
  add column if not exists track text
    check (track is null or track in ('car', 'bike_heavy'));

comment on column public.subscriptions.track is
  'Vehicle track the plan was bought for. Server truth for content gating; written only by the Paystack webhook.';
