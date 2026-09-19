-- 0039: enquiries, test results, and test-day documents.
-- ============================================================================
-- Slice 5 of the school workspace.
--
-- ENQUIRIES are the lightest possible CRM, because the problem is simple: a
-- WhatsApp from a stranger asking about lessons gets read in the car, never
-- answered, and becomes a learner at the school down the road. One question
-- is answered well — who do I call back today — and an enquiry converts into
-- a learner in one tap.
--
-- TEST RESULTS are kept as a history of attempts, not a flag on the learner.
-- A learner who fails twice and passes on the third try is three facts, and a
-- school's pass rate — the number it wants on its own marketing — is only
-- honest if every attempt is counted. Anyone may record a result; only the
-- owner or the office may correct one, and nobody deletes one.
--
-- DOCUMENTS for test day are a short fixed checklist on the learner, because
-- arriving at the testing centre without the eye test or proof of address is
-- a wasted booking and a lost fee.

-- ── Enquiries ──────────────────────────────────────────────────────────────
create table public.school_enquiries (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools on delete cascade,
  name text not null check (length(btrim(name)) > 0 and length(name) <= 80),
  phone text check (length(phone) <= 30),
  email text check (length(email) <= 120),
  source text not null default 'other'
    check (source in ('walk_in','phone','whatsapp','website','referral','other')),
  licence_code text check (licence_code in ('8','10','14','A1','A')),
  message text check (length(message) <= 1000),
  status text not null default 'new' check (status in ('new','contacted','booked','lost')),
  next_follow_up_on date,
  assigned_to uuid,
  converted_learner_id uuid,
  created_by uuid not null references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, school_id),
  foreign key (assigned_to, school_id) references public.school_members (id, school_id),
  foreign key (converted_learner_id, school_id) references public.school_learners (id, school_id)
);
-- Serves the only question this screen exists for: who do I call today.
create index school_enquiries_followup
  on public.school_enquiries (school_id, status, next_follow_up_on);

create trigger school_enquiries_touch before update on public.school_enquiries
  for each row execute function public.school_touch_updated_at();

-- ── Test results ───────────────────────────────────────────────────────────
create table public.school_test_results (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools on delete cascade,
  learner_id uuid not null,
  test_type text not null check (test_type in ('learners','drivers')),
  taken_on date not null,
  centre text check (length(centre) <= 80),
  result text not null check (result in ('passed','failed')),
  -- Who prepared them for it, so pass rates can be read per instructor.
  instructor_id uuid,
  notes text check (length(notes) <= 500),
  recorded_by uuid not null references auth.users,
  created_at timestamptz not null default now(),
  foreign key (learner_id, school_id) references public.school_learners (id, school_id),
  foreign key (instructor_id, school_id) references public.school_members (id, school_id)
);
create index school_test_results_school on public.school_test_results (school_id, taken_on desc);
create index school_test_results_learner on public.school_test_results (learner_id, taken_on desc);

-- ── Test-day documents ─────────────────────────────────────────────────────
-- A fixed set, so the checklist means the same thing at every school. The
-- labels live in src/lib/schools/test-day.ts.
alter table public.school_learners
  add column documents text[] not null default '{}'
    check (documents <@ array['id_copy','proof_of_address','learners_licence','eye_test','photos']::text[]);

-- ── Row-level security ─────────────────────────────────────────────────────
alter table public.school_enquiries enable row level security;
alter table public.school_test_results enable row level security;

create policy school_enquiries_read on public.school_enquiries for select
  using (school_id in (select public.my_school_ids()));
create policy school_enquiries_insert on public.school_enquiries for insert
  with check (school_id in (select public.my_writable_school_ids())
              and created_by = (select auth.uid()));
-- Whoever picks up the phone updates the enquiry.
create policy school_enquiries_update on public.school_enquiries for update
  using (school_id in (select public.my_writable_school_ids()))
  with check (school_id in (select public.my_writable_school_ids()));

create policy school_test_results_read on public.school_test_results for select
  using (school_id in (select public.my_school_ids()));
create policy school_test_results_insert on public.school_test_results for insert
  with check (school_id in (select public.my_writable_school_ids())
              and recorded_by = (select auth.uid()));
-- A mis-tapped "failed" has to be fixable, but not by just anyone: a pass
-- rate everyone can rewrite is not a pass rate.
create policy school_test_results_update on public.school_test_results for update
  using (school_id in (select public.my_writable_school_ids())
         and public.school_role(school_id) in ('owner','assistant'))
  with check (school_id in (select public.my_writable_school_ids())
              and public.school_role(school_id) in ('owner','assistant'));

-- ── Grants ─────────────────────────────────────────────────────────────────
do $$ declare t text; begin
  foreach t in array array['school_enquiries','school_test_results'] loop
    execute format('revoke all on public.%I from public, anon, authenticated',t);
    execute format('grant all on public.%I to service_role',t);
    execute format('grant select on public.%I to authenticated',t);
  end loop;
  execute 'grant insert (school_id, name, phone, email, source, licence_code, message, status,
                         next_follow_up_on, assigned_to, created_by)
           on public.school_enquiries to authenticated';
  execute 'grant update (name, phone, email, source, licence_code, message, status,
                         next_follow_up_on, assigned_to, converted_learner_id)
           on public.school_enquiries to authenticated';
  execute 'grant insert (school_id, learner_id, test_type, taken_on, centre, result, instructor_id,
                         notes, recorded_by)
           on public.school_test_results to authenticated';
  execute 'grant update (test_type, taken_on, centre, result, instructor_id, notes)
           on public.school_test_results to authenticated';
  execute 'grant update (documents) on public.school_learners to authenticated';
end; $$;
