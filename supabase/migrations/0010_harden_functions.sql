-- 0010: function hardening flagged by the Supabase security advisor.
--  1. Pin set_referral_code's search_path (it's a trigger fn; the others
--     already set it).
--  2. Revoke RPC execute on the trigger functions from client roles — triggers
--     still fire (owner context), but they should never be callable via
--     /rest/v1/rpc by anon/authenticated.
-- (payment_events having RLS on with no policy is intentional: service-role
--  only, so nothing else can read the webhook ledger.)

create or replace function public.set_referral_code()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.referral_code is null then
    new.referral_code := substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_referral_code() from public, anon, authenticated;
