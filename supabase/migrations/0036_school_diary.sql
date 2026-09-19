-- 0036: the diary — a school's learners, its cars, and the lessons between them.
-- ============================================================================
-- Slice 1 of the school workspace. Builds on 0035's tenancy; read that file's
-- NOTE 1–3 first, because every policy here uses its helpers the same way.
--
-- The one constraint that matters most is at the bottom of `school_lessons`:
-- two EXCLUDE constraints that make it impossible to book an instructor, or a
-- car, into two places at once. That is enforced HERE and not in application
-- code on purpose. Two instructors booking on two phones over patchy 3G will
-- race, and "read the diary, then insert if free" loses that race every time
-- it happens. With the constraint, the second insert fails with SQLSTATE
-- 23P01 and the server action turns that into "Sipho is already booked at
-- 14:00". The WHERE clauses mean a cancelled lesson frees its slot with no
-- cleanup code at all.
--
-- Cross-tenant references are closed with COMPOSITE foreign keys: a lesson's
-- (learner_id, school_id) must match a learner row's (id, school_id), so a
-- school cannot book another school's learner or car even if it learns the
-- UUID. Row-level security decides which rows you may touch; these keys decide
-- which rows yours may point at.
--
-- No DELETE is granted on anything here. A lesson that did not happen is
-- cancelled, a learner who stops is marked `left`, a car that is sold is
-- `retired`. The diary is a business record and records are not erased.

-- Supabase keeps extensions in their own schema. The EXCLUDE constraints need
-- btree_gist for `uuid WITH =` inside a GiST index; the default operator class
-- is found without a search_path, so the schema does not have to be named.
create extension if not exists btree_gist with schema extensions;

-- ── Learners ────────────────────────────────────────────────────────────────
create table public.school_learners (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools on delete cascade,
  first_name text not null check (length(btrim(first_name)) > 0),
  last_name text not null default '',
  -- Deliberately not unique: siblings share a parent's number all the time.
  -- Duplicates are for the UI to point out, not for the database to refuse.
  phone text, email text,
  -- Never the full SA ID number. A national identifier the product has no use
  -- for is pure POPIA liability; the last four digits are enough to tell two
  -- learners with the same name apart at the testing centre.
  id_number_last4 text check (id_number_last4 ~ '^[0-9]{4}$'),
  -- Same domain as the learner app's VehicleCode, so the right set of K53
  -- modules can be offered against this learner in slice 2.
  licence_code text not null default '8' check (licence_code in ('8','10','14','A1','A')),
  stage text not null default 'learners' check (stage in ('learners','drivers')),
  status text not null default 'active'
    check (status in ('enquiry','active','paused','passed','left')),
  assigned_instructor_id uuid,
  test_date date, test_centre text,
  notes text,
  created_by uuid not null references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, school_id),
  foreign key (assigned_instructor_id, school_id) references public.school_members (id, school_id)
);
create index school_learners_roster on public.school_learners (school_id, status, last_name);

-- ── Cars (and bikes, and trucks) ────────────────────────────────────────────
create table public.school_vehicles (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools on delete cascade,
  registration text not null check (length(btrim(registration)) > 0),
  make text, model text,
  -- Mirrors the learner app's VehicleGroup, so a motorcycle lesson is never
  -- offered the Polo and the module list on the lesson sheet fits the vehicle.
  vehicle_group text not null default 'car' check (vehicle_group in ('car','motorcycle','heavy')),
  transmission text not null default 'manual' check (transmission in ('manual','automatic')),
  licence_disc_expires_on date,
  status text not null default 'active' check (status in ('active','in_service','retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, school_id)
);
create unique index school_vehicles_registration
  on public.school_vehicles (school_id, upper(btrim(registration)));

-- ── Lessons ─────────────────────────────────────────────────────────────────
create table public.school_lessons (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools on delete cascade,
  learner_id uuid,
  instructor_id uuid not null,
  vehicle_id uuid,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  -- Half-open, so a 10:00–11:00 lesson and an 11:00–12:00 lesson do not clash.
  slot tstzrange generated always as (tstzrange(starts_at, ends_at, '[)')) stored,
  -- 'block' is time the instructor is unavailable: leave, a service, a funeral.
  -- It holds the diary like a lesson does, and has no learner.
  kind text not null default 'lesson' check (kind in ('lesson','test','assessment','block')),
  status text not null default 'scheduled'
    check (status in ('scheduled','completed','no_show','cancelled_learner','cancelled_school')),
  pickup_address text,
  created_by uuid not null references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (ends_at - starts_at <= interval '8 hours'),
  check ((kind = 'block') = (learner_id is null)),
  unique (id, school_id),
  foreign key (learner_id, school_id) references public.school_learners (id, school_id),
  foreign key (instructor_id, school_id) references public.school_members (id, school_id),
  foreign key (vehicle_id, school_id) references public.school_vehicles (id, school_id),
  -- THE constraint. See the header.
  constraint school_lessons_no_instructor_overlap
    exclude using gist (instructor_id with =, slot with &&)
    where (status in ('scheduled','completed')),
  constraint school_lessons_no_vehicle_overlap
    exclude using gist (vehicle_id with =, slot with &&)
    where (vehicle_id is not null and status in ('scheduled','completed'))
);
create index school_lessons_diary on public.school_lessons (school_id, starts_at);
create index school_lessons_learner on public.school_lessons (learner_id, starts_at);

-- ── updated_at belongs to the database ──────────────────────────────────────
-- Set by trigger rather than by the caller, so no client can backdate a change
-- and no server action can forget to set it. clock_timestamp(), not now():
-- now() is frozen at the start of the transaction, so a row edited late in a
-- long transaction would claim to have changed before it did.
create function public.school_touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end; $$;

create trigger school_learners_touch before update on public.school_learners
  for each row execute function public.school_touch_updated_at();
create trigger school_vehicles_touch before update on public.school_vehicles
  for each row execute function public.school_touch_updated_at();
create trigger school_lessons_touch before update on public.school_lessons
  for each row execute function public.school_touch_updated_at();

-- ── One more helper, same contract as 0035's three ─────────────────────────
-- The caller's own member ids, one per school they belong to. Parameterless and
-- set-returning for the same once-per-query reason as my_school_ids() (0035,
-- NOTE 1), SECURITY DEFINER for the same no-recursion reason (NOTE 2), and
-- granted to `authenticated` for the same reason (NOTE 3) — it runs in policies.
create function public.my_member_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from public.school_members
  where user_id = (select auth.uid()) and status = 'active'
$$;

-- ── Policies ────────────────────────────────────────────────────────────────
alter table public.school_learners enable row level security;
alter table public.school_vehicles enable row level security;
alter table public.school_lessons enable row level security;

-- Everyone in a school reads its whole diary. Instructors need to see each
-- other's bookings to avoid clashing; the UI filters to "mine" by default.
create policy school_learners_read on public.school_learners for select
  using (school_id in (select public.my_school_ids()));
create policy school_vehicles_read on public.school_vehicles for select
  using (school_id in (select public.my_school_ids()));
create policy school_lessons_read on public.school_lessons for select
  using (school_id in (select public.my_school_ids()));

-- Any member may add and edit learners — the instructor who takes a call in
-- the car is usually the one who signs the learner up.
create policy school_learners_insert on public.school_learners for insert
  with check (school_id in (select public.my_writable_school_ids())
              and created_by = (select auth.uid()));
create policy school_learners_update on public.school_learners for update
  using (school_id in (select public.my_writable_school_ids()))
  with check (school_id in (select public.my_writable_school_ids()));

-- The fleet is the owner's and the office's to manage.
create policy school_vehicles_insert on public.school_vehicles for insert
  with check (school_id in (select public.my_writable_school_ids())
              and public.school_role(school_id) in ('owner','assistant'));
create policy school_vehicles_update on public.school_vehicles for update
  using (school_id in (select public.my_writable_school_ids())
         and public.school_role(school_id) in ('owner','assistant'))
  with check (school_id in (select public.my_writable_school_ids())
              and public.school_role(school_id) in ('owner','assistant'));

-- The owner and the office book for anyone; an instructor books and changes
-- only their own lessons.
create policy school_lessons_insert on public.school_lessons for insert
  with check (school_id in (select public.my_writable_school_ids())
              and created_by = (select auth.uid())
              and (public.school_role(school_id) in ('owner','assistant')
                   or instructor_id in (select public.my_member_ids())));
create policy school_lessons_update on public.school_lessons for update
  using (school_id in (select public.my_writable_school_ids())
         and (public.school_role(school_id) in ('owner','assistant')
              or instructor_id in (select public.my_member_ids())))
  with check (school_id in (select public.my_writable_school_ids())
              and (public.school_role(school_id) in ('owner','assistant')
                   or instructor_id in (select public.my_member_ids())));

-- ── Grants ──────────────────────────────────────────────────────────────────
-- Same rule as 0035: strip Supabase's grant-everything defaults first, then
-- grant exactly this. UPDATE is granted per column, which is what stops a row
-- being moved to another school (school_id is never updatable) or having its
-- author rewritten (created_by never is either).
do $$ declare t text; f record; begin
  foreach t in array array['school_learners','school_vehicles','school_lessons'] loop
    execute format('revoke all on public.%I from public, anon, authenticated',t);
    execute format('grant all on public.%I to service_role',t);
    execute format('grant select, insert on public.%I to authenticated',t);
  end loop;

  execute 'grant update (first_name, last_name, phone, email, id_number_last4, licence_code, stage,
                         status, assigned_instructor_id, test_date, test_centre, notes)
           on public.school_learners to authenticated';
  execute 'grant update (registration, make, model, vehicle_group, transmission,
                         licence_disc_expires_on, status)
           on public.school_vehicles to authenticated';
  execute 'grant update (learner_id, instructor_id, vehicle_id, starts_at, ends_at, kind, status,
                         pickup_address)
           on public.school_lessons to authenticated';

  -- Trigger function: nobody calls it directly.
  for f in select oid::regprocedure as signature from pg_proc where pronamespace='public'::regnamespace
    and proname = 'school_touch_updated_at' loop
    execute format('revoke execute on function %s from public, anon, authenticated',f.signature);
  end loop;

  -- The 0035 NOTE 3 exception: runs inside policies.
  for f in select oid::regprocedure as signature from pg_proc where pronamespace='public'::regnamespace
    and proname = 'my_member_ids' loop
    execute format('revoke execute on function %s from public, anon',f.signature);
    execute format('grant execute on function %s to authenticated, service_role',f.signature);
  end loop;
end; $$;
