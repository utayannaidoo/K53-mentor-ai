-- 0037: what happened in the lesson — notes, and K53 manoeuvres rated.
-- ============================================================================
-- Slice 2 of the school workspace, and the part no spreadsheet can do. After
-- a lesson the instructor records, in about thirty seconds:
--   * what happened (a summary),
--   * which K53 yard-test manoeuvres were covered, each rated
--       1 introduced · 2 developing · 3 test-ready,
--     with the faults seen picked from that manoeuvre's own failure criteria
--     (DriverModule.commonFaults in src/lib/content/driver-modules*.ts),
--   * what the next lesson should start with.
-- The learner's progress grid is then simply the latest rating per manoeuvre.
--
-- Three decisions worth knowing before changing anything here:
--
-- 1. module_id is NOT a foreign key to licence_modules. That table was seeded
--    with six rows in 0002 and never again; the TypeScript content has 33
--    modules. An FK would reject 27 of them. The format is checked here and
--    the id itself is validated against DRIVER_MODULES by the server action.
--
-- 2. Progress is a VIEW, not a maintained table. A rollup table has to be
--    recomputed on every write and drifts the first time a recompute is
--    missed; editing an old lesson could even overwrite a newer rating. The
--    view takes the latest assessment per manoeuvre by lesson time, so it is
--    correct by construction. It is security_invoker, so it sees exactly what
--    the caller's row-level security lets them see — no more.
--
-- 3. Writes go through ONE function, record_lesson_assessment. A lesson's
--    note and its ratings must change together (an edit replaces the set of
--    manoeuvres), and PostgREST cannot run two statements in a transaction.
--    The function is SECURITY DEFINER, takes the caller from auth.uid() —
--    never from an argument — and checks permission itself, so a browser holds
--    SELECT on these tables and nothing else. That keeps the privilege audit
--    in supabase/tests/school_isolation.sql true for every school table:
--    no signed-in user can DELETE anything, even an assessment line.

create table public.school_lesson_notes (
  lesson_id uuid primary key,
  school_id uuid not null,
  summary text not null default '' check (length(summary) <= 4000),
  -- "What the next lesson starts with." The one line an instructor needs on
  -- the way to the next pickup.
  next_focus text check (length(next_focus) <= 500),
  -- Off by default and chosen per note. An instructor's candid note ("nervous,
  -- mother is pressuring him") must never be one setting away from the
  -- learner's phone. Nothing reads this yet; the learner link (slice 7) will.
  learner_visible boolean not null default false,
  created_by uuid not null references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (lesson_id, school_id) references public.school_lessons (id, school_id) on delete cascade
);

create table public.school_lesson_modules (
  lesson_id uuid not null,
  school_id uuid not null,
  module_id text not null check (module_id ~ '^[a-z0-9_]{2,64}$'),
  rating smallint not null check (rating between 1 and 3),
  faults text[] not null default '{}'
    check (cardinality(faults) <= 20),
  assessed_by uuid not null references auth.users,
  assessed_at timestamptz not null default now(),
  primary key (lesson_id, module_id),
  foreign key (lesson_id, school_id) references public.school_lessons (id, school_id) on delete cascade
);
create index school_lesson_modules_school on public.school_lesson_modules (school_id, module_id);

-- ── Progress: the latest rating per learner per manoeuvre ─────────────────
-- A cancelled lesson or a no-show did not happen, so nothing recorded against
-- it counts, even if someone rated it before cancelling.
create view public.school_learner_progress with (security_invoker = true) as
select distinct on (lm.school_id, l.learner_id, lm.module_id)
  lm.school_id,
  l.learner_id,
  lm.module_id,
  lm.rating,
  lm.faults,
  lm.lesson_id,
  l.starts_at as lesson_at
from public.school_lesson_modules lm
join public.school_lessons l on l.id = lm.lesson_id and l.school_id = lm.school_id
where l.status not in ('cancelled_learner', 'cancelled_school', 'no_show')
order by lm.school_id, l.learner_id, lm.module_id, l.starts_at desc, lm.assessed_at desc;

-- ── The one way in ─────────────────────────────────────────────────────────
-- p_modules is a JSON array of {module_id, rating, faults[]}. It REPLACES the
-- lesson's set: a manoeuvre left out of an edit is no longer recorded against
-- this lesson. The learner's grid then falls back to their previous lesson's
-- rating for it, which is what "I rated the wrong thing" should do.
create function public.record_lesson_assessment(
  p_lesson uuid,
  p_summary text,
  p_next_focus text,
  p_learner_visible boolean,
  p_modules jsonb,
  p_mark_completed boolean default true
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  caller uuid := (select auth.uid());
  l record;
  m jsonb;
begin
  if caller is null then raise exception 'Sign in to record a lesson'; end if;

  select * into l from public.school_lessons where id = p_lesson;
  -- "Not found" and "not yours" are the same answer, so a lesson id from
  -- another school cannot be confirmed to exist.
  if not found or l.school_id not in (select public.my_school_ids()) then
    raise exception 'That lesson could not be found';
  end if;
  if l.school_id not in (select public.my_writable_school_ids()) then
    raise exception 'Your subscription has lapsed, so the workspace is read-only';
  end if;
  if coalesce(public.school_role(l.school_id), '') <> 'owner'
     and l.instructor_id not in (select public.my_member_ids()) then
    raise exception 'Only the instructor who taught this lesson, or the owner, can record it';
  end if;
  if l.learner_id is null then raise exception 'Blocked time has nothing to record'; end if;
  if l.status in ('cancelled_learner', 'cancelled_school', 'no_show') then
    raise exception 'That lesson did not happen, so there is nothing to record';
  end if;
  if jsonb_typeof(coalesce(p_modules, '[]'::jsonb)) <> 'array'
     or jsonb_array_length(coalesce(p_modules, '[]'::jsonb)) > 40 then
    raise exception 'Too many manoeuvres for one lesson';
  end if;

  insert into public.school_lesson_notes (lesson_id, school_id, summary, next_focus, learner_visible, created_by)
  values (
    p_lesson, l.school_id,
    left(coalesce(p_summary, ''), 4000),
    nullif(left(btrim(coalesce(p_next_focus, '')), 500), ''),
    coalesce(p_learner_visible, false),
    caller
  )
  on conflict (lesson_id) do update
    set summary = excluded.summary,
        next_focus = excluded.next_focus,
        learner_visible = excluded.learner_visible,
        updated_at = clock_timestamp();

  delete from public.school_lesson_modules where lesson_id = p_lesson;
  for m in select value from jsonb_array_elements(coalesce(p_modules, '[]'::jsonb)) loop
    insert into public.school_lesson_modules (lesson_id, school_id, module_id, rating, faults, assessed_by)
    values (
      p_lesson, l.school_id,
      m->>'module_id',
      (m->>'rating')::smallint,
      coalesce(
        (select array_agg(left(f, 200)) from jsonb_array_elements_text(coalesce(m->'faults', '[]'::jsonb)) as f),
        '{}'
      ),
      caller
    );
  end loop;

  if p_mark_completed and l.status = 'scheduled' then
    update public.school_lessons set status = 'completed' where id = p_lesson;
  end if;
  return p_lesson;
end; $$;

-- ── Row-level security: reads only ────────────────────────────────────────
alter table public.school_lesson_notes enable row level security;
alter table public.school_lesson_modules enable row level security;

create policy school_lesson_notes_read on public.school_lesson_notes for select
  using (school_id in (select public.my_school_ids()));
create policy school_lesson_modules_read on public.school_lesson_modules for select
  using (school_id in (select public.my_school_ids()));
-- No write policies and no write grants: record_lesson_assessment is the only
-- way these rows change.

do $$ declare t text; f record; begin
  foreach t in array array['school_lesson_notes','school_lesson_modules'] loop
    execute format('revoke all on public.%I from public, anon, authenticated',t);
    execute format('grant all on public.%I to service_role',t);
    execute format('grant select on public.%I to authenticated',t);
  end loop;
  execute 'revoke all on public.school_learner_progress from public, anon, authenticated';
  execute 'grant select on public.school_learner_progress to authenticated, service_role';

  -- Called by the signed-in user's own client, like the diary writes. It
  -- identifies the caller from auth.uid(), so there is no user argument to
  -- forge. Joins 0035 NOTE 3's list of functions a harden pass must skip.
  for f in select oid::regprocedure as signature from pg_proc where pronamespace='public'::regnamespace
    and proname = 'record_lesson_assessment' loop
    execute format('revoke execute on function %s from public, anon',f.signature);
    execute format('grant execute on function %s to authenticated, service_role',f.signature);
  end loop;
end; $$;
