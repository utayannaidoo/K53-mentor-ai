-- 0025_streak_regain_cap.sql
-- Cap freeze-regains at ONE per streak run. `regainsUsed` counts how many
-- bridges this run has already spent; the client resets it to 0 when a run
-- ends (see resolveStreak / touchStreak in src/lib/store/local-store.ts).
-- Without the cap, the weekly allowance refill let a learner bridge a missed
-- day every week forever — a "streak" surviving on one session a week.
alter table public.streaks
  add column if not exists regains_used int not null default 0;
