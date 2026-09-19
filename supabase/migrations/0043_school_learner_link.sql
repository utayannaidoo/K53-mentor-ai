-- K53 Mentor for Schools — linking a roster learner to their own K53 Mentor app.
-- ============================================================================
-- A school keeps a roster row for every learner, app or no app. This adds the
-- optional link from that row to the learner's own K53 Mentor account, and the
-- rules around it are the whole point of the migration:
--
--   1. ONLY THE LEARNER CREATES THE LINK. The school hands over an 8-character
--      code; the learner, signed in, enters it and consents. Nothing a school
--      can do sets linked_user_id — not an insert, not an update — which is
--      why this migration also narrows 0036's table-wide INSERT grant on
--      school_learners to named columns. Without that, a school could insert
--      a roster row already "linked", with consent, to any account it liked.
--
--   2. WHAT CROSSES IS FIXED AND NARROW. School -> learner is served by the
--      app from the school's own tables (lessons, ratings, notes the
--      instructor marked visible, balance). Learner -> school is exactly one
--      function, school_learner_progress_summary: a readiness number (with the
--      day it was last updated) and a strength per question category. No
--      policy on any learner table ever names a school. No attempts, no tutor
--      conversations, no diagnostic answers, no activity times.
--
--   3. EITHER SIDE CAN END IT, AND DELETION ENDS IT. The learner withdraws
--      consent, or the school disconnects; both clear the link. Deleting the
--      learner's account nulls it (0041's rule: nothing may block erasure) and
--      a trigger clears the consent with it.
--
-- The link is not the referral attribution. school_referrals is immutable and
-- once-ever by design; learners change schools. Accepting a link does make an
-- opportunistic claim_school_referral when the school is a partner — the one
-- way the software feeds the referral programme — which quietly does nothing
-- for a learner who has already paid or already been attributed.

-- ── The link itself ─────────────────────────────────────────────────────────
alter table public.school_learners
  add column linked_user_id uuid references auth.users on delete set null,
  add column link_consent_at timestamptz,
  add constraint school_learners_link_consented check ((linked_user_id is null) = (link_consent_at is null));

-- One roster row per learner account per school.
create unique index school_learners_one_link
  on public.school_learners (school_id, linked_user_id) where linked_user_id is not null;
create index school_learners_linked_user on public.school_learners (linked_user_id) where linked_user_id is not null;

-- Account deletion nulls linked_user_id (ON DELETE SET NULL). The consent goes
-- with it, or the CHECK above would refuse the delete.
create function public.school_learner_unlinked() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.linked_user_id is null then new.link_consent_at := null; end if;
  return new;
end $$;
revoke all on function public.school_learner_unlinked() from public, anon, authenticated;
create trigger school_learners_unlinked before update of linked_user_id on public.school_learners
  for each row execute function public.school_learner_unlinked();

-- Rule 1: INSERT on school_learners by named column, never the link columns.
-- (UPDATE was already per column in 0036/0039, and neither list names them.)
revoke insert on public.school_learners from authenticated;
grant insert (school_id, first_name, last_name, phone, email, id_number_last4, licence_code, stage,
              status, assigned_instructor_id, test_date, test_centre, notes, documents, created_by)
  on public.school_learners to authenticated;

-- ── Codes a school hands to a learner ───────────────────────────────────────
create table public.school_learner_link_codes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools on delete cascade,
  learner_id uuid not null,
  -- Same alphabet as invite codes: no O/0/I/1, it gets read out loud.
  short_code text not null check (short_code ~ '^[A-HJ-NP-Z2-9]{8}$'),
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  revoked_at timestamptz,
  foreign key (learner_id, school_id) references public.school_learners (id, school_id) on delete cascade
);
create unique index school_learner_link_codes_open
  on public.school_learner_link_codes (short_code) where used_at is null and revoked_at is null;

alter table public.school_learner_link_codes enable row level security;
revoke all on public.school_learner_link_codes from public, anon, authenticated;
grant all on public.school_learner_link_codes to service_role;

-- ── RPCs (service role only; the server passes the caller as p_user) ────────

-- A school member with a writable workspace makes a code for one learner.
-- Replaces any code still open for that learner.
create function public.create_learner_link_code(
  p_user uuid, p_learner uuid, p_short_code text, p_expires_days int default 7
) returns uuid
language plpgsql security definer set search_path = public as $$
declare target uuid; linked uuid; result uuid;
begin
  select school_id, linked_user_id into target, linked from public.school_learners where id = p_learner;
  if target is null then raise exception 'That learner could not be found'; end if;
  if not exists (
    select 1 from public.school_members m
      join public.school_subscriptions s on s.school_id = m.school_id
     where m.school_id = target and m.user_id = p_user and m.status = 'active'
       and ((s.status = 'trialing' and s.trial_ends_at > now())
         or (s.status in ('active', 'past_due')
           and not (s.cancel_at_period_end and s.current_period_end is not null and now() >= s.current_period_end)
           and not (s.current_period_end is not null and now() >= s.current_period_end + interval '3 days')))
  ) then
    raise exception 'Only someone at this school can connect a learner';
  end if;
  if linked is not null then raise exception 'This learner is already connected'; end if;

  update public.school_learner_link_codes set revoked_at = now()
   where learner_id = p_learner and used_at is null and revoked_at is null;
  insert into public.school_learner_link_codes (school_id, learner_id, short_code, created_by, expires_at)
    values (target, p_learner, upper(btrim(p_short_code)), p_user,
            now() + make_interval(days => greatest(1, least(coalesce(p_expires_days, 7), 30))))
    returning id into result;
  return result;
end $$;

-- What a code would connect, before the learner agrees: the school's name and
-- the first name it has for them. Nothing is changed.
create function public.peek_learner_link(p_short_code text)
returns table (school_name text, learner_first_name text)
language plpgsql security definer set search_path = public as $$
begin
  return query
    select s.name, l.first_name
      from public.school_learner_link_codes c
      join public.schools s on s.id = c.school_id
      join public.school_learners l on l.id = c.learner_id
     where c.short_code = upper(btrim(p_short_code))
       and c.used_at is null and c.revoked_at is null and c.expires_at > now()
       and l.linked_user_id is null;
end $$;

-- The learner agrees. Returns the school's name.
create function public.accept_learner_link(p_user uuid, p_short_code text) returns text
language plpgsql security definer set search_path = public as $$
declare code record; school_name text; partner_code text;
begin
  select c.* into code from public.school_learner_link_codes c
   where c.short_code = upper(btrim(p_short_code))
     and c.used_at is null and c.revoked_at is null and c.expires_at > now()
   for update;
  if not found then raise exception 'That code is not valid any more. Ask your driving school for a new one.'; end if;

  -- Lock the roster row; a second acceptance of the same code waits here and
  -- then finds the code used.
  perform 1 from public.school_learners where id = code.learner_id for update;
  if exists (select 1 from public.school_learners where id = code.learner_id and linked_user_id is not null) then
    raise exception 'That learner is already connected to an account';
  end if;
  if exists (select 1 from public.school_learners
              where school_id = code.school_id and linked_user_id = p_user) then
    raise exception 'Your account is already connected to this school';
  end if;
  if exists (select 1 from public.school_members
              where school_id = code.school_id and user_id = p_user and status = 'active') then
    raise exception 'Staff at a school cannot connect themselves as its learner';
  end if;

  update public.school_learners set linked_user_id = p_user, link_consent_at = now() where id = code.learner_id;
  update public.school_learner_link_codes set used_at = now() where id = code.id;

  -- Rule 3's footnote: the software feeds the referral programme, never the
  -- other way round, and a failed or refused claim changes nothing here.
  select pc.code into partner_code
    from public.schools s
    join public.partner_school_codes pc on pc.school_id = s.partner_school_id and pc.status = 'active'
   where s.id = code.school_id
   order by pc.created_at desc limit 1;
  if partner_code is not null then
    begin
      perform public.claim_school_referral(p_user, partner_code, 'link');
    exception when others then
      raise log 'accept_learner_link: referral claim skipped: %', sqlerrm;
    end;
  end if;

  select name into school_name from public.schools where id = code.school_id;
  return school_name;
end $$;

-- Either side ends the link: the learner it belongs to, or anyone at the
-- school. (A school member may disconnect on a read-only workspace too:
-- stopping the sharing of someone's data is never a paid feature.)
create function public.unlink_school_learner(p_user uuid, p_learner uuid) returns boolean
language plpgsql security definer set search_path = public as $$
declare target uuid; linked uuid;
begin
  select school_id, linked_user_id into target, linked from public.school_learners where id = p_learner for update;
  if target is null or linked is null then return false; end if;
  if linked <> p_user and not exists (
    select 1 from public.school_members where school_id = target and user_id = p_user and status = 'active'
  ) then
    raise exception 'Only the learner or their school can disconnect this';
  end if;
  update public.school_learners set linked_user_id = null, link_consent_at = null where id = p_learner;
  return true;
end $$;

-- Learner -> school, and nothing else (rule 2). Null when the caller is not at
-- the learner's school or the learner is not connected.
create function public.school_learner_progress_summary(p_user uuid, p_learner uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare target uuid; linked uuid; ready int; ready_day date; strengths jsonb;
begin
  select school_id, linked_user_id into target, linked from public.school_learners where id = p_learner;
  if target is null or linked is null then return null; end if;
  if not exists (select 1 from public.school_members
                  where school_id = target and user_id = p_user and status = 'active') then
    return null;
  end if;

  select r.readiness, r.day into ready, ready_day
    from public.readiness_history r where r.user_id = linked order by r.day desc limit 1;

  -- Strength per category: the share right in the latest 30 answers there.
  -- A category with fewer than 10 answers is marked as too early to judge.
  select coalesce(jsonb_agg(jsonb_build_object(
           'category_id', category_id, 'strength', strength, 'enough', answered >= 10)
           order by category_id), '[]'::jsonb)
    into strengths
    from (
      select category_id,
             round(100.0 * avg(case when is_correct then 1 else 0 end))::int as strength,
             count(*) as answered
        from (
          select q.category_id, q.is_correct,
                 row_number() over (partition by q.category_id order by q.attempted_at desc) as rn
            from public.question_attempts q where q.user_id = linked
        ) latest
       where rn <= 30
       group by category_id
    ) per_category;

  return jsonb_build_object(
    'readiness', ready,
    'readiness_day', ready_day,
    'categories', strengths
  );
end $$;

do $$ declare f record; begin
  for f in select oid::regprocedure as signature from pg_proc where pronamespace = 'public'::regnamespace
    and proname in ('create_learner_link_code', 'peek_learner_link', 'accept_learner_link',
                    'unlink_school_learner', 'school_learner_progress_summary', 'school_learner_unlinked') loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.signature);
    execute format('grant execute on function %s to service_role', f.signature);
  end loop;
end $$;
