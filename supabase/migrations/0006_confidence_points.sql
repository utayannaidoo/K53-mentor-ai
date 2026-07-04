-- Confidence Points (CP) — the difficulty-weighted competence score behind
-- Driver Ranks. Lives on the streaks row alongside the other engagement state
-- synced by saveAccount; the client merges by max() so a stale server value
-- never rolls a learner's points back.

alter table public.streaks
  add column if not exists cp int not null default 0;
