-- The real tests' outcomes, self-reported.
--
-- The Driver Rank ladder reserves its last rung for an actual licence and no
-- in-app gate can reach it (LICENCE_RANK_INDEX in src/lib/engagement.ts). The
-- learner's own answer is the only thing that grants it, which makes it the
-- single most durable fact in the product — and until now it had nowhere to
-- live. `rankAchieved` is local-only, and production wipes local state on sign
-- out, so "I passed my learner's" would have survived exactly until the next
-- sign-in on a new device.
--
-- Two tests, two sets of columns, mirroring the `test_date` /
-- `drivers_test_date` pair already on this table. Someone whose goal is "both"
-- sits them months apart and one answer must never stand in for the other.
--
-- Keyed by the booked date rather than a boolean: a learner who fails in March
-- and re-books for June must be asked again in June, and a flag cannot say
-- which attempt it answered.
--
-- DEPLOY ORDER: apply this BEFORE shipping the code that writes it. PostgREST
-- fails the whole statement on an unknown column, and these ride along on the
-- profiles upsert — a write against a database without them would take the
-- name, licence code and test date down with it. (The client guards this by
-- only sending each pair once a result exists, so the exposure is limited to
-- someone answering the prompt in the window between deploy and migration.)

-- ── Learner's test ──────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists licence_result text
  check (licence_result in ('passed', 'failed'));

alter table public.profiles
  add column if not exists licence_result_at timestamptz;

-- The booking the answer belongs to. Nullable for every row that predates this.
alter table public.profiles
  add column if not exists licence_result_test_date date;

-- ── Driver's test ───────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists drivers_result text
  check (drivers_result in ('passed', 'failed'));

alter table public.profiles
  add column if not exists drivers_result_at timestamptz;

alter table public.profiles
  add column if not exists drivers_result_test_date date;

-- RLS is unchanged: profiles already carries `own_profile` (0001), which is
-- `for all using (auth.uid() = id)`, so a learner can write their own results
-- and no one else's.
