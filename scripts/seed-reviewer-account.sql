-- Reviewer / demo accounts for the Paystack activation review.
-- Creates full-access (Premium Plus) logins so a reviewer can exercise every
-- feature on the live site without a real payment.
--
-- HOW TO RUN (manual only — do NOT add to migrations or supabase/seed.sql):
--   Supabase Dashboard -> your project -> SQL Editor -> paste this -> Run.
--   (Runs as the service role, which is required: RLS blocks any client from
--    writing its own subscription tier — see 0004_lock_subscriptions.sql.)
--
-- Safe to re-run: existing accounts with these emails are skipped, and the
-- tier is re-asserted each time.
--
-- To REVOKE access later, see the cleanup block at the bottom.
-- ---------------------------------------------------------------------------

do $$
declare
  accounts text[][] := array[
    -- {email, password}
    array['paystack.review@k53mentor.app', 'K53Review-2026'],
    array['paystack.review2@k53mentor.app', 'K53Review-2026']
  ];
  a    text[];
  uid  uuid;
begin
  foreach a slice 1 in array accounts loop
    -- Skip if the account already exists.
    select id into uid from auth.users where email = a[1];

    if uid is null then
      uid := gen_random_uuid();

      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) values (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        a[1], crypt(a[2], gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
        '', '', '', ''
      );

      insert into auth.identities (
        provider_id, user_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at, id
      ) values (
        uid::text, uid,
        jsonb_build_object('sub', uid::text, 'email', a[1], 'email_verified', true),
        'email', now(), now(), now(), gen_random_uuid()
      );
      -- The on_auth_user_created trigger (handle_new_user) has now created a
      -- profile + a 'free' subscription row for this user.
    end if;

    -- Elevate to full access. Upsert in case the trigger row is missing.
    insert into public.subscriptions (user_id, tier, status, current_period_end)
    values (uid, 'premium_plus', 'active', now() + interval '1 year')
    on conflict (user_id)
    do update set tier = 'premium_plus',
                  status = 'active',
                  current_period_end = now() + interval '1 year';
  end loop;
end $$;

-- Verify:
select u.email, s.tier, s.status, s.current_period_end
from auth.users u
join public.subscriptions s on s.user_id = u.id
where u.email in ('paystack.review@k53mentor.app', 'paystack.review2@k53mentor.app');

-- ---------------------------------------------------------------------------
-- CLEANUP (run after the review is approved to remove the test accounts):
--
-- delete from auth.users
--  where email in ('paystack.review@k53mentor.app', 'paystack.review2@k53mentor.app');
-- -- (auth.identities, profiles and subscriptions cascade on delete.)
-- ---------------------------------------------------------------------------
