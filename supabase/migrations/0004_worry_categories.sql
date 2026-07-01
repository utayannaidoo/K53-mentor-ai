-- Self-reported weak-spot categories, asked during onboarding before any
-- diagnostic data exists — used as a fallback personalization signal for
-- day-one plan copy until the diagnostic produces measured weak categories.

alter table public.profiles
  add column if not exists worry_categories text[] not null default '{}';
