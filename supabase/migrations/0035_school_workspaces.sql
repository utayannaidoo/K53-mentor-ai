-- 0035: driving schools become tenants, not just commission counterparties.
-- ============================================================================
-- Until now a driving school was a row in `partner_schools`: someone we owe
-- R20 to, with no login and no data of their own. This migration adds the
-- other half — a workspace the school pays us for, where they keep their
-- diary, their learners and their money.
--
-- `partner_schools` is deliberately NOT extended:
--   * its `status` means "may earn commission" — `mature_school_commissions`
--     holds money on `status <> 'active'`, so a school that stops referring but
--     keeps paying for software would have to be marked `suspended`;
--   * it holds plaintext bank details behind a blanket revoke, and a
--     tenant-facing policy on that table is one mistake away from leaking them;
--   * its rows are created by an ANONYMOUS post (/api/partners/apply), while a
--     tenant is created by an authenticated owner;
--   * `partner_commissions.user_id` is globally unique by design — referral
--     semantics a software tenant must not inherit.
-- The two are linked one-to-one and optionally, by `schools.partner_school_id`.
--
-- Naming rule, so the halves never blur: `partner_*` is the referral
-- programme, `school_*` is the product. `schools` is the only new bare name.
--
-- THIS IS THE FIRST TENANT IN THIS DATABASE. Every policy before now has been
-- `auth.uid() = user_id`. Read the three notes below before changing anything
-- here — the helpers are load-bearing for every table added after this one.

-- ── Tenant ──────────────────────────────────────────────────────────────────
create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  -- Reserved for a future public booking page (/book/<slug>). Unique now so we
  -- never have to reconcile collisions retroactively.
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,32}$'),
  -- At most one workspace per partner school, and at most one partner school
  -- per workspace. Null is the common case: a software customer who has never
  -- joined the referral programme.
  partner_school_id uuid unique references public.partner_schools,
  town text, province text, phone text, email text,
  timezone text not null default 'Africa/Johannesburg',
  -- 'eft' pays commission out by bank transfer as before; 'credit' accrues it
  -- against the software subscription instead. See 0042.
  commission_mode text not null default 'eft' check (commission_mode in ('eft','credit')),
  default_lesson_minutes int not null default 60 check (default_lesson_minutes between 15 and 480),
  status text not null default 'active' check (status in ('active','archived')),
  created_by uuid not null references auth.users,
  created_at timestamptz not null default now()
);

create table public.school_members (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  -- 'assistant' is office staff: no diary of their own and no seat consumed.
  role text not null check (role in ('owner','instructor','assistant')),
  status text not null default 'active' check (status in ('active','suspended')),
  display_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  deactivated_at timestamptz,
  unique (school_id, user_id),
  -- Child tables reference (id, school_id) so their own school_id cannot drift
  -- from their parent's. Cheaper and more honest than a trigger.
  unique (id, school_id)
);

-- Exactly one active owner. Without this an ownership transfer that races
-- leaves either two owners or none, and none is an unrecoverable tenant.
create unique index school_members_one_owner
  on public.school_members(school_id) where role = 'owner' and status = 'active';
-- The hottest index in the product: my_school_ids() hits it on every query.
create index school_members_user on public.school_members(user_id) where status = 'active';

create table public.school_invites (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools on delete cascade,
  -- Nullable: plenty of instructors have no working email address.
  email text,
  role text not null check (role in ('instructor','assistant')),
  -- Only ever the digest of the emailed token. The token itself exists in the
  -- email and nowhere else.
  token_hash text not null unique,
  -- The other acceptance path, because it has to survive being read aloud on a
  -- WhatsApp voice note. Charset excludes O/0/I/1 for that reason.
  short_code text not null unique check (short_code ~ '^[A-Z2-9]{8}$'),
  invited_by uuid not null references auth.users,
  expires_at timestamptz not null,
  accepted_at timestamptz, accepted_by uuid references auth.users,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index school_invites_pending on public.school_invites(school_id)
  where accepted_at is null and revoked_at is null;

-- Separate from `subscriptions` and never merged with it. Two reasons, both
-- load-bearing: `subscriptions` is unique(user_id) with a learner-only tier
-- enum, and `remember_partner_first_payment` fires on every write to it — a
-- school charge routed through that table would mint a first-payment receipt
-- for the owner and permanently burn their own once-ever referral eligibility.
create table public.school_subscriptions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null unique references public.schools on delete cascade,
  plan text not null default 'trial' check (plan in ('trial','solo','team','fleet')),
  status text not null default 'trialing'
    check (status in ('trialing','active','past_due','canceled','paused')),
  -- The paid ceiling on owner+instructor members. Never auto-enforced by
  -- deactivating anyone: a downgrade can legitimately leave 4 members on a
  -- 2-seat plan. It blocks new invites and is reported; that is enough.
  seats int not null default 1 check (seats between 1 and 100),
  provider text, provider_customer_id text, provider_subscription_id text,
  plan_code text,
  current_period_end timestamptz, trial_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  paid_at timestamptz, last_charge_reference text,
  -- Referral commission converted to account credit. Has no withdrawal path by
  -- design; a balance someone can cash out is a refund obligation.
  credit_cents int not null default 0 check (credit_cents >= 0),
  refunded_at timestamptz, disputed_at timestamptz,
  created_at timestamptz not null default now()
);
create index school_subscriptions_customer on public.school_subscriptions(provider_customer_id);
create index school_subscriptions_provider_sub on public.school_subscriptions(provider_subscription_id);

-- ── The three helpers every tenant policy is built on ───────────────────────
--
-- NOTE 1 — why these are parameterless.
-- A scalar subquery over a parameterless STABLE function is hoisted by the
-- planner into an InitPlan and evaluated ONCE per query. That is the same
-- mechanism 0015 bought by rewriting auth.uid() as (select auth.uid()).
-- Taking school_id as an argument would defeat it and re-evaluate per row.
--
-- NOTE 2 — why these are SECURITY DEFINER, and why that prevents recursion.
-- my_school_ids() reads school_members. The SELECT policy on school_members
-- calls my_school_ids(). That is only not infinite recursion (42P17) because
-- SECURITY DEFINER makes the function read the table with RLS bypassed.
-- Writing the same test inline as `exists (select 1 from school_members ...)`
-- inside the policy WILL recurse. Do not.
--
-- NOTE 3 — these three are granted to `authenticated`, unlike every other
-- function in this database. They have to be: they run inside policies. It is
-- safe because no argument can name another user, all three are read-only, and
-- search_path is pinned. A future harden-functions pass that blanket-revokes
-- execute from authenticated WILL lock every school out of its own diary.
-- These three belong on that pass's skip list.

create function public.my_school_ids() returns uuid[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(school_id), '{}'::uuid[])
  from public.school_members
  where user_id = (select auth.uid()) and status = 'active'
$$;

-- The paywall, in the database rather than in a component. A school whose
-- trial has lapsed keeps every read and loses every write: their diary is
-- their business record, and holding it hostage is not a billing strategy.
create function public.my_writable_school_ids() returns uuid[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(m.school_id), '{}'::uuid[])
  from public.school_members m
  join public.school_subscriptions s on s.school_id = m.school_id
  where m.user_id = (select auth.uid()) and m.status = 'active'
    and (s.status in ('active','past_due')
         or (s.status = 'trialing' and s.trial_ends_at > now()))
$$;

-- Returns the CALLER's own role in one school, for WITH CHECK clauses where a
-- single row is being tested anyway.
create function public.school_role(p_school uuid) returns text
language sql stable security definer set search_path = public as $$
  select role from public.school_members
  where school_id = p_school and user_id = (select auth.uid()) and status = 'active'
$$;

-- ── Policies ────────────────────────────────────────────────────────────────
-- Every tenant policy in this product is the same shape:
--   using (school_id = any ((select public.my_school_ids())))
-- Mind the DOUBLE parentheses. The inner pair makes it a scalar subquery of
-- type uuid[], so `= ANY(array)` applies. A single pair parses as
-- `= ANY(subquery)`, which is a different operator and will not behave.

alter table public.schools enable row level security;
alter table public.school_members enable row level security;
alter table public.school_invites enable row level security;
alter table public.school_subscriptions enable row level security;

create policy "school_read" on public.schools for select
  using (id = any ((select public.my_school_ids())));
-- Only the owner edits the school record, and only while it is writable.
create policy "school_update" on public.schools for update
  using (id = any ((select public.my_writable_school_ids()))
         and public.school_role(id) = 'owner')
  with check (id = any ((select public.my_writable_school_ids()))
              and public.school_role(id) = 'owner');

-- Read your own membership row even before the array is populated, so a
-- freshly accepted invite can render something.
create policy "school_members_read" on public.school_members for select
  using (user_id = (select auth.uid())
         or school_id = any ((select public.my_school_ids())));
-- Deliberately no INSERT/UPDATE/DELETE policy. Role is a privilege: a policy
-- permitting UPDATE here would let any instructor make themselves owner.
-- Membership changes go through the definer RPCs below.

create policy "school_subscriptions_read" on public.school_subscriptions for select
  using (school_id = any ((select public.my_school_ids())));
-- No write policies, mirroring `subscriptions` after 0004. Money is written by
-- the webhook with the service role and by nothing else.

-- school_invites has RLS enabled and INTENTIONALLY NO POLICIES: it holds
-- token_hash, and RLS cannot protect a single column. The owner's "pending
-- invites" list is served by a server action through the service role.

-- ── Tenant lifecycle RPCs ───────────────────────────────────────────────────
-- Everything that assigns a role, counts a seat or crosses into auth.users is
-- a SECURITY DEFINER function invoked by a server action, never a table write.

-- Derives a unique slug from the school name, appending -2, -3 … on collision.
create function public.school_slug_from_name(p_name text) returns text
language plpgsql security definer set search_path = public as $$
declare base text; candidate text; n int := 1;
begin
  base := btrim(regexp_replace(lower(coalesce(p_name,'')), '[^a-z0-9]+', '-', 'g'), '-');
  base := left(nullif(base,''), 28);
  if base is null or length(base) < 3 then base := 'school'; end if;
  candidate := base;
  while exists (select 1 from public.schools where slug = candidate) loop
    n := n + 1;
    candidate := left(base, 28) || '-' || n::text;
  end loop;
  return candidate;
end; $$;

-- One transaction: the school, its owner, and a trial subscription. Role
-- assignment must never be a client write, which is the whole reason this is
-- a function and not three inserts from a server action.
create function public.create_school_for_owner(
  p_user uuid, p_name text, p_town text default null, p_province text default null,
  p_phone text default null, p_trial_days int default 30
) returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  if p_user is null then raise exception 'A signed-in user is required'; end if;
  if length(btrim(coalesce(p_name,''))) = 0 then raise exception 'School name is required'; end if;
  -- One workspace per person as owner. Someone who genuinely runs two schools
  -- is a support conversation, not a self-serve flow.
  if exists (select 1 from public.school_members
              where user_id = p_user and role = 'owner' and status = 'active') then
    raise exception 'You already own a school';
  end if;

  insert into public.schools (name, slug, town, province, phone, created_by)
    values (btrim(p_name), public.school_slug_from_name(p_name),
            nullif(btrim(coalesce(p_town,'')),''), nullif(btrim(coalesce(p_province,'')),''),
            nullif(btrim(coalesce(p_phone,'')),''), p_user)
    returning id into new_id;

  insert into public.school_members (school_id, user_id, role, display_name)
    values (new_id, p_user, 'owner',
            coalesce((select full_name from public.profiles where id = p_user), ''));

  insert into public.school_subscriptions (school_id, plan, status, seats, trial_ends_at)
    values (new_id, 'trial', 'trialing', 1, now() + make_interval(days => p_trial_days));

  return new_id;
end; $$;

-- Links an existing referral partner to this workspace. The identity guard is
-- the same one claim_school_referral uses: the caller must be the school's
-- owner AND their auth email must match the partner record's contact email.
-- Anything short of that is an ops task in /admin, not a self-serve claim.
create function public.link_partner_school(
  p_user uuid, p_school uuid, p_code text
) returns text language plpgsql security definer set search_path = public as $$
declare partner_id uuid; partner_name text; caller_email text;
begin
  if (select role from public.school_members
       where school_id = p_school and user_id = p_user and status = 'active') is distinct from 'owner' then
    raise exception 'Only the school owner can link a partner code';
  end if;
  if exists (select 1 from public.schools where id = p_school and partner_school_id is not null) then
    raise exception 'This school is already linked to a partner code';
  end if;

  select c.school_id into partner_id from public.partner_school_codes c
   where c.code = lower(btrim(p_code)) and c.status = 'active';
  if partner_id is null then raise exception 'That code is not active'; end if;

  select lower(btrim(email)) into caller_email from auth.users where id = p_user;
  if not exists (select 1 from public.partner_schools s
                  where s.id = partner_id and lower(btrim(s.contact_email)) = caller_email) then
    raise exception 'That code belongs to a different contact email';
  end if;

  update public.schools set partner_school_id = partner_id where id = p_school;
  select name into partner_name from public.partner_schools where id = partner_id;
  return partner_name;
end; $$;

-- Seats are counted under a row lock on the school, the same serialisation
-- mark_partner_payout_paid uses. Without it two simultaneous accepts both see
-- one free seat and both land.
create function public.create_school_invite(
  p_user uuid, p_school uuid, p_role text, p_email text,
  p_token_hash text, p_short_code text, p_expires_days int default 14
) returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid; used int; allowed int;
begin
  if (select role from public.school_members
       where school_id = p_school and user_id = p_user and status = 'active') is distinct from 'owner' then
    raise exception 'Only the school owner can invite people';
  end if;
  if p_role not in ('instructor','assistant') then raise exception 'Unknown role'; end if;

  perform 1 from public.schools where id = p_school for update;

  if p_role = 'instructor' then
    select seats into allowed from public.school_subscriptions where school_id = p_school;
    -- Outstanding invites hold a seat, or three invites fill one seat twice.
    select count(*) into used from (
      select 1 from public.school_members
       where school_id = p_school and status = 'active' and role in ('owner','instructor')
      union all
      select 1 from public.school_invites
       where school_id = p_school and accepted_at is null and revoked_at is null and expires_at > now()
         and role = 'instructor'
    ) q;
    if used >= coalesce(allowed, 1) then
      raise exception 'No seats left on your plan';
    end if;
  end if;

  insert into public.school_invites (school_id, email, role, token_hash, short_code, invited_by, expires_at)
    values (p_school, nullif(lower(btrim(coalesce(p_email,''))),''), p_role, p_token_hash,
            upper(btrim(p_short_code)), p_user, now() + make_interval(days => p_expires_days))
    returning id into new_id;
  return new_id;
end; $$;

-- Accepts by token digest or by short code; the caller supplies whichever it
-- has. Re-checks seats under the same lock, because the seat count can change
-- between issuing an invite and accepting it.
create function public.accept_school_invite(
  p_user uuid, p_token_hash text default null, p_short_code text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare inv record; used int; allowed int;
begin
  if p_user is null then raise exception 'A signed-in user is required'; end if;

  select * into inv from public.school_invites
   where (p_token_hash is not null and token_hash = p_token_hash)
      or (p_short_code is not null and short_code = upper(btrim(p_short_code)))
   limit 1;
  if inv is null then raise exception 'That invite could not be found'; end if;
  if inv.revoked_at is not null then raise exception 'That invite was cancelled'; end if;
  if inv.accepted_at is not null then raise exception 'That invite has already been used'; end if;
  if inv.expires_at <= now() then raise exception 'That invite has expired'; end if;

  perform 1 from public.schools where id = inv.school_id for update;

  if exists (select 1 from public.school_members
              where school_id = inv.school_id and user_id = p_user and status = 'active') then
    update public.school_invites set accepted_at = now(), accepted_by = p_user where id = inv.id;
    return inv.school_id;
  end if;

  if inv.role = 'instructor' then
    select seats into allowed from public.school_subscriptions where school_id = inv.school_id;
    select count(*) into used from public.school_members
     where school_id = inv.school_id and status = 'active' and role in ('owner','instructor');
    if used >= coalesce(allowed, 1) then raise exception 'That school has no seats left'; end if;
  end if;

  insert into public.school_members (school_id, user_id, role, display_name)
    values (inv.school_id, p_user, inv.role,
            coalesce((select full_name from public.profiles where id = p_user), ''))
  on conflict (school_id, user_id) do update
    set status = 'active', role = excluded.role, deactivated_at = null;

  update public.school_invites set accepted_at = now(), accepted_by = p_user where id = inv.id;
  return inv.school_id;
end; $$;

create function public.revoke_school_invite(p_user uuid, p_invite uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare target uuid;
begin
  select school_id into target from public.school_invites where id = p_invite;
  if target is null then return false; end if;
  if (select role from public.school_members
       where school_id = target and user_id = p_user and status = 'active') is distinct from 'owner' then
    raise exception 'Only the school owner can cancel an invite';
  end if;
  update public.school_invites set revoked_at = now()
   where id = p_invite and accepted_at is null and revoked_at is null;
  return found;
end; $$;

create function public.set_member_role(p_user uuid, p_member uuid, p_role text)
returns boolean language plpgsql security definer set search_path = public as $$
declare target uuid; target_role text;
begin
  if p_role not in ('instructor','assistant') then
    -- Ownership moves only through transfer_school_ownership, which keeps the
    -- one-active-owner invariant in a single transaction.
    raise exception 'Use the ownership transfer to change an owner';
  end if;
  select school_id, role into target, target_role from public.school_members where id = p_member;
  if target is null then return false; end if;
  if target_role = 'owner' then raise exception 'The owner''s role cannot be changed here'; end if;
  if (select role from public.school_members
       where school_id = target and user_id = p_user and status = 'active') is distinct from 'owner' then
    raise exception 'Only the school owner can change roles';
  end if;
  update public.school_members set role = p_role where id = p_member;
  return true;
end; $$;

create function public.deactivate_school_member(p_user uuid, p_member uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare target uuid; target_role text;
begin
  select school_id, role into target, target_role from public.school_members where id = p_member;
  if target is null then return false; end if;
  if target_role = 'owner' then raise exception 'Transfer ownership before removing the owner'; end if;
  if (select role from public.school_members
       where school_id = target and user_id = p_user and status = 'active') is distinct from 'owner' then
    raise exception 'Only the school owner can remove someone';
  end if;
  update public.school_members set status = 'suspended', deactivated_at = now() where id = p_member;
  return true;
end; $$;

-- Demote and promote in one statement each, inside one transaction, so the
-- school_members_one_owner index never sees two active owners.
create function public.transfer_school_ownership(p_user uuid, p_school uuid, p_member uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare incoming record;
begin
  if (select role from public.school_members
       where school_id = p_school and user_id = p_user and status = 'active') is distinct from 'owner' then
    raise exception 'Only the current owner can transfer ownership';
  end if;
  select * into incoming from public.school_members
   where id = p_member and school_id = p_school and status = 'active';
  if incoming is null then raise exception 'That person is not an active member'; end if;
  if incoming.user_id = p_user then return true; end if;

  update public.school_members set role = 'instructor'
   where school_id = p_school and user_id = p_user and role = 'owner';
  update public.school_members set role = 'owner' where id = p_member;
  return true;
end; $$;

-- ── Grants ──────────────────────────────────────────────────────────────────
-- Tables: the four tenant tables keep their policies for `authenticated` and
-- grant the service role everything. Note this differs from 0033, where the
-- partner tables have RLS on and NO policies — these tables are read by the
-- browser, so they need both the grant and the policies above.
do $$ declare t text; f record; begin
  foreach t in array array['schools','school_members','school_subscriptions'] loop
    execute format('grant select on public.%I to authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
  -- schools.update is policy-gated to the owner; the column grant is table-wide
  -- because column-level revokes do not override a table-level grant (0020).
  execute 'grant update (name, town, province, phone, email, default_lesson_minutes) on public.schools to authenticated';

  -- Never readable by a browser: it holds token_hash.
  execute 'revoke all on public.school_invites from public, anon, authenticated';
  execute 'grant all on public.school_invites to service_role';

  -- Every RPC is service-role only and reached through a server action that
  -- re-checks the caller itself.
  for f in select oid::regprocedure as signature from pg_proc where pronamespace='public'::regnamespace
    and proname in ('create_school_for_owner','link_partner_school','create_school_invite',
                    'accept_school_invite','revoke_school_invite','set_member_role',
                    'deactivate_school_member','transfer_school_ownership','school_slug_from_name') loop
    execute format('revoke execute on function %s from public, anon, authenticated',f.signature);
    execute format('grant execute on function %s to service_role',f.signature);
  end loop;

  -- The exception described in NOTE 3. These three run inside policies.
  for f in select oid::regprocedure as signature from pg_proc where pronamespace='public'::regnamespace
    and proname in ('my_school_ids','my_writable_school_ids','school_role') loop
    execute format('revoke execute on function %s from public, anon',f.signature);
    execute format('grant execute on function %s to authenticated, service_role',f.signature);
  end loop;
end; $$;
