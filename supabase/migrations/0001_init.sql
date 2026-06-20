-- ============================================================================
-- K53 Mentor AI — initial schema
-- PostgreSQL / Supabase. Row Level Security is enabled on every user-owned
-- table so a user can only ever read and write their own rows.
-- ============================================================================

-- ── Content: categories, questions, flashcards, scenarios ───────────────────

create table if not exists public.categories (
  id          text primary key,           -- e.g. 'signs', 'rules'
  name        text not null,
  short       text not null,
  description text not null,
  scope       text not null default 'learners' check (scope in ('learners','drivers')),
  icon        text not null default 'Signpost'
);

create table if not exists public.questions (
  id            text primary key,
  category_id   text not null references public.categories(id) on delete cascade,
  prompt        text not null,
  options       jsonb not null,
  correct_index int  not null,
  explanation   text not null,
  difficulty    int  not null default 1 check (difficulty between 1 and 3),
  scope         text not null default 'learners',
  sign          text,
  created_at    timestamptz not null default now()
);
create index if not exists questions_category_idx on public.questions(category_id);

create table if not exists public.flashcards (
  id          text primary key,
  category_id text not null references public.categories(id) on delete cascade,
  front       text not null,
  back        text not null,
  difficulty  int  not null default 1,
  sign        text
);
create index if not exists flashcards_category_idx on public.flashcards(category_id);

create table if not exists public.scenarios (
  id          text primary key,
  category_id text not null references public.categories(id) on delete cascade,
  title       text not null,
  situation   text not null,
  prompt      text not null,
  choices     jsonb not null,             -- [{id,text,correct,consequence}]
  debrief     text not null,
  sign        text
);

create table if not exists public.licence_modules (
  id          text primary key,
  name        text not null,
  summary     text not null,
  difficulty  int  not null default 1,
  est_minutes int  not null default 10,
  common_faults jsonb not null default '[]'
);

create table if not exists public.licence_procedure_steps (
  id          uuid primary key default gen_random_uuid(),
  module_id   text not null references public.licence_modules(id) on delete cascade,
  step_number int  not null,
  title       text not null,
  instruction text not null,
  tip         text,
  unique (module_id, step_number)
);

-- ── Profiles (1:1 with auth.users) ──────────────────────────────────────────

create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text not null default '',
  email           text,
  vehicle_code    text default '8' check (vehicle_code in ('8','10','14')),
  goal            text default 'learners' check (goal in ('learners','drivers','both')),
  test_date       date,
  prior_attempts  int  not null default 0,
  confidence      int  check (confidence between 1 and 5),
  knowledge_level text check (knowledge_level in ('beginner','some','confident')),
  study_frequency text check (study_frequency in ('casual','steady','intense')),
  onboarded_at    timestamptz,
  created_at      timestamptz not null default now(),
  last_active_at  timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  tier                     text not null default 'free' check (tier in ('free','premium','premium_plus')),
  status                   text not null default 'active',
  provider                 text,                -- 'stripe'
  provider_customer_id     text,
  provider_subscription_id text,
  current_period_end       timestamptz,
  created_at               timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.streaks (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  current              int not null default 0,
  longest              int not null default 0,
  last_study_date      date,
  freezes_remaining    int not null default 1,
  freeze_refreshed_week text
);

-- ── Progress & activity ─────────────────────────────────────────────────────

create table if not exists public.diagnostic_attempts (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  readiness                int not null,
  predicted_pass_probability int not null,
  total                    int not null,
  correct                  int not null,
  per_category             jsonb not null default '{}',
  weak_categories          jsonb not null default '[]',
  strong_categories        jsonb not null default '[]',
  completed_at             timestamptz not null default now()
);
create index if not exists diagnostic_user_idx on public.diagnostic_attempts(user_id);

create table if not exists public.diagnostic_responses (
  id                    uuid primary key default gen_random_uuid(),
  diagnostic_attempt_id uuid not null references public.diagnostic_attempts(id) on delete cascade,
  question_id           text not null,
  is_correct            boolean not null
);

create table if not exists public.question_attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  question_id   text not null,
  category_id   text not null,
  selected_index int not null,
  is_correct    boolean not null,
  context       text not null default 'practice' check (context in ('diagnostic','practice','mock')),
  attempted_at  timestamptz not null default now()
);
create index if not exists question_attempts_user_idx on public.question_attempts(user_id);
create index if not exists question_attempts_cat_idx on public.question_attempts(user_id, category_id);

create table if not exists public.flashcard_review_log (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  flashcard_id    text not null,
  rating          text not null check (rating in ('again','hard','good','easy')),
  ease            numeric not null default 2.5,   -- SM-2 ease factor
  interval_days   int not null default 0,
  reps            int not null default 0,
  lapses          int not null default 0,
  stability       numeric,                        -- reserved for FSRS upgrade
  difficulty      numeric,                        -- reserved for FSRS upgrade
  due_at          timestamptz,
  reviewed_at     timestamptz not null default now(),
  unique (user_id, flashcard_id)
);
create index if not exists flashcard_due_idx on public.flashcard_review_log(user_id, due_at);

create table if not exists public.scenario_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  scenario_id  text not null,
  category_id  text not null,
  choice_id    text not null,
  is_correct   boolean not null,
  attempted_at timestamptz not null default now()
);

create table if not exists public.mock_exam_attempts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  score            int not null,
  total            int not null,
  passed           boolean not null,
  per_category     jsonb not null default '{}',
  duration_seconds int not null default 0,
  taken_at         timestamptz not null default now()
);

create table if not exists public.mock_exam_responses (
  id                  uuid primary key default gen_random_uuid(),
  mock_exam_attempt_id uuid not null references public.mock_exam_attempts(id) on delete cascade,
  question_id         text not null,
  is_correct          boolean not null
);

create table if not exists public.study_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  session_type     text not null,
  started_at       timestamptz not null,
  ended_at         timestamptz not null,
  duration_seconds int not null default 0
);
create index if not exists study_sessions_user_idx on public.study_sessions(user_id);

create table if not exists public.study_plans (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  plan_data    jsonb not null default '{}',
  generated_at timestamptz not null default now()
);

create table if not exists public.readiness_history (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  day       date not null,
  readiness int not null,
  unique (user_id, day)
);

create table if not exists public.user_procedure_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  module_id    text not null references public.licence_modules(id) on delete cascade,
  step_number  int not null,
  completed_at timestamptz not null default now(),
  unique (user_id, module_id, step_number)
);

create table if not exists public.tutor_conversations (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  title               text not null default 'Conversation',
  context_label       text,
  context_question_id text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.tutor_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.tutor_conversations(id) on delete cascade,
  role            text not null check (role in ('user','assistant')),
  content         text not null,
  model           text,
  token_count     int,
  created_at      timestamptz not null default now()
);
create index if not exists tutor_messages_conv_idx on public.tutor_messages(conversation_id);

create table if not exists public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  type          text not null,
  payload       jsonb not null default '{}',
  scheduled_for timestamptz,
  sent_at       timestamptz,
  opened_at     timestamptz,
  created_at    timestamptz not null default now()
);

-- ── Row Level Security ──────────────────────────────────────────────────────

-- Content tables: world-readable, no client writes.
do $$
declare t text;
begin
  foreach t in array array['categories','questions','flashcards','scenarios','licence_modules','licence_procedure_steps']
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format($p$create policy "public_read_%1$s" on public.%1$I for select using (true);$p$, t);
  end loop;
end $$;

-- User-owned tables: owner-only access via auth.uid().
do $$
declare t text;
begin
  foreach t in array array[
    'subscriptions','streaks','diagnostic_attempts','question_attempts',
    'flashcard_review_log','scenario_attempts','mock_exam_attempts','study_sessions',
    'study_plans','readiness_history','user_procedure_progress','tutor_conversations',
    'notifications'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format($p$create policy "own_%1$s" on public.%1$I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);$p$, t);
  end loop;
end $$;

-- profiles keyed by id = auth.uid()
alter table public.profiles enable row level security;
create policy "own_profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- child tables checked through their parent's owner
alter table public.diagnostic_responses enable row level security;
create policy "own_diag_responses" on public.diagnostic_responses for all
  using (exists (select 1 from public.diagnostic_attempts d where d.id = diagnostic_attempt_id and d.user_id = auth.uid()))
  with check (exists (select 1 from public.diagnostic_attempts d where d.id = diagnostic_attempt_id and d.user_id = auth.uid()));

alter table public.mock_exam_responses enable row level security;
create policy "own_mock_responses" on public.mock_exam_responses for all
  using (exists (select 1 from public.mock_exam_attempts m where m.id = mock_exam_attempt_id and m.user_id = auth.uid()))
  with check (exists (select 1 from public.mock_exam_attempts m where m.id = mock_exam_attempt_id and m.user_id = auth.uid()));

alter table public.tutor_messages enable row level security;
create policy "own_tutor_messages" on public.tutor_messages for all
  using (exists (select 1 from public.tutor_conversations c where c.id = conversation_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.tutor_conversations c where c.id = conversation_id and c.user_id = auth.uid()));

-- ── New-user bootstrap: profile + streak + free subscription ────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email)
    on conflict (id) do nothing;
  insert into public.streaks (user_id) values (new.id) on conflict do nothing;
  insert into public.subscriptions (user_id, tier, status) values (new.id, 'free', 'active') on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
