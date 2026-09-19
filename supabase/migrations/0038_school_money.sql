-- 0038: the school's money — lesson packages, payments, and who owes what.
-- ============================================================================
-- Slice 3 of the school workspace. This is the SCHOOL's ledger of money its
-- learners paid it — mostly cash in the car and EFT — not our billing, which
-- is Paystack's and lives elsewhere. Nothing here moves money; it records it.
--
-- Four rules, each for a reason:
--
-- 1. Payments are APPEND-ONLY. No browser can UPDATE or DELETE a payment. A
--    mistake is VOIDED — with a reason, by whom, when — through
--    void_school_payment, and the row stays. An instructor who could quietly
--    edit yesterday's R500 cash entry is how a school loses money and blames
--    the software.
--
-- 2. Only the owner or the office can void. An instructor can record a
--    payment (they are usually the one handed the cash) but cannot make one
--    disappear.
--
-- 3. There is NO stored balance. A learner's balance is computed from the
--    ledger — packages sold, lessons charged, payments not voided — in
--    src/lib/schools/money.ts. A stored running balance drifts, and
--    reconciling a drifted number against a physical cash box is the worst
--    support call there is.
--
-- 4. A lesson is paid for EITHER from a package OR at its own price, never
--    both, and a package can only ever be used by the learner it was sold to.
--    Composite foreign keys enforce that; the UI does not have to.

create table public.school_packages (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools on delete cascade,
  learner_id uuid not null,
  name text not null check (length(btrim(name)) > 0 and length(name) <= 80),
  -- Null for an open package ("R3 000 of lessons") that is not counted in lessons.
  lessons_included int check (lessons_included between 1 and 200),
  price_cents int not null check (price_cents between 0 and 10000000),
  status text not null default 'active' check (status in ('active','used','expired','refunded')),
  sold_on date not null,
  expires_on date,
  created_by uuid not null references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, school_id),
  unique (id, learner_id),
  foreign key (learner_id, school_id) references public.school_learners (id, school_id)
);
create index school_packages_learner on public.school_packages (school_id, learner_id);

create trigger school_packages_touch before update on public.school_packages
  for each row execute function public.school_touch_updated_at();

-- A lesson draws down a package, or carries its own price. Not both.
alter table public.school_lessons
  add column package_id uuid,
  add column price_cents int check (price_cents between 0 and 10000000),
  add constraint school_lessons_one_way_to_pay check (package_id is null or price_cents is null),
  add constraint school_lessons_package_needs_learner check (package_id is null or learner_id is not null),
  add constraint school_lessons_package_same_school
    foreign key (package_id, school_id) references public.school_packages (id, school_id),
  add constraint school_lessons_package_same_learner
    foreign key (package_id, learner_id) references public.school_packages (id, learner_id);

create table public.school_payments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools on delete cascade,
  learner_id uuid not null,
  package_id uuid,
  -- Positive is money in. A refund to a learner is recorded as a negative
  -- payment, so the ledger still adds up without anything being edited.
  amount_cents int not null check (amount_cents <> 0 and amount_cents between -10000000 and 10000000),
  method text not null check (method in ('cash','eft','card','snapscan','other')),
  reference text check (length(reference) <= 80),
  received_on date not null,
  received_by uuid not null references auth.users,
  note text check (length(note) <= 500),
  voided_at timestamptz,
  voided_by uuid references auth.users,
  void_reason text check (length(void_reason) <= 300),
  created_at timestamptz not null default now(),
  check ((voided_at is null) = (voided_by is null)),
  check (voided_at is null or length(btrim(coalesce(void_reason, ''))) > 0),
  foreign key (learner_id, school_id) references public.school_learners (id, school_id),
  foreign key (package_id, school_id) references public.school_packages (id, school_id),
  foreign key (package_id, learner_id) references public.school_packages (id, learner_id)
);
create index school_payments_ledger on public.school_payments (school_id, learner_id, received_on);
create index school_payments_recent on public.school_payments (school_id, received_on desc);

-- ── Voiding: the only change a payment can ever undergo ────────────────────
create function public.void_school_payment(p_payment uuid, p_reason text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  caller uuid := (select auth.uid());
  pay record;
begin
  if caller is null then raise exception 'Sign in to void a payment'; end if;
  if length(btrim(coalesce(p_reason, ''))) = 0 then
    raise exception 'Say why the payment is being voided';
  end if;

  select * into pay from public.school_payments where id = p_payment for update;
  if not found or pay.school_id not in (select public.my_school_ids()) then
    raise exception 'That payment could not be found';
  end if;
  if pay.school_id not in (select public.my_writable_school_ids()) then
    raise exception 'Your subscription has lapsed, so the workspace is read-only';
  end if;
  if coalesce(public.school_role(pay.school_id), '') not in ('owner','assistant') then
    raise exception 'Only the owner or the office can void a payment';
  end if;
  if pay.voided_at is not null then raise exception 'That payment is already void'; end if;

  update public.school_payments
     set voided_at = clock_timestamp(), voided_by = caller, void_reason = left(btrim(p_reason), 300)
   where id = p_payment;
  return p_payment;
end; $$;

-- ── Row-level security ─────────────────────────────────────────────────────
alter table public.school_packages enable row level security;
alter table public.school_payments enable row level security;

create policy school_packages_read on public.school_packages for select
  using (school_id in (select public.my_school_ids()));
create policy school_payments_read on public.school_payments for select
  using (school_id in (select public.my_school_ids()));

-- Anyone in the school can sell a package or take a payment — in a small
-- school the instructor is the one in the car when the money changes hands.
create policy school_packages_insert on public.school_packages for insert
  with check (school_id in (select public.my_writable_school_ids())
              and created_by = (select auth.uid()));
create policy school_payments_insert on public.school_payments for insert
  with check (school_id in (select public.my_writable_school_ids())
              and received_by = (select auth.uid())
              and voided_at is null);

-- Correcting a package (its name, size, price or status) is the owner's and
-- the office's job, not an instructor's.
create policy school_packages_update on public.school_packages for update
  using (school_id in (select public.my_writable_school_ids())
         and public.school_role(school_id) in ('owner','assistant'))
  with check (school_id in (select public.my_writable_school_ids())
              and public.school_role(school_id) in ('owner','assistant'));

-- ── Grants ─────────────────────────────────────────────────────────────────
-- Payments: SELECT and INSERT only, for everyone. The void columns cannot even
-- be set on insert (column-level INSERT grant below), so a payment cannot be
-- born void, and no UPDATE grant exists at all.
do $$ declare t text; f record; begin
  foreach t in array array['school_packages','school_payments'] loop
    execute format('revoke all on public.%I from public, anon, authenticated',t);
    execute format('grant all on public.%I to service_role',t);
    execute format('grant select on public.%I to authenticated',t);
  end loop;
  execute 'grant insert (school_id, learner_id, name, lessons_included, price_cents, status, sold_on,
                         expires_on, created_by)
           on public.school_packages to authenticated';
  execute 'grant update (name, lessons_included, price_cents, status, expires_on)
           on public.school_packages to authenticated';
  execute 'grant insert (school_id, learner_id, package_id, amount_cents, method, reference,
                         received_on, received_by, note)
           on public.school_payments to authenticated';
  -- A lesson's way of paying is part of booking it.
  execute 'grant update (package_id, price_cents) on public.school_lessons to authenticated';

  for f in select oid::regprocedure as signature from pg_proc where pronamespace='public'::regnamespace
    and proname = 'void_school_payment' loop
    execute format('revoke execute on function %s from public, anon',f.signature);
    execute format('grant execute on function %s to authenticated, service_role',f.signature);
  end loop;
end; $$;
