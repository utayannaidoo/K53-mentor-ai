-- Security: the client must not be able to write its own subscription tier.
-- 0001 gave subscriptions the generic owner FOR ALL policy, which let any
-- signed-in user upsert tier='premium_plus' with the anon key. Tier changes
-- now come only from trusted server code (Stripe webhook using the service
-- role, which bypasses RLS) or the security-definer signup trigger.

drop policy if exists "own_subscriptions" on public.subscriptions;

create policy "read_own_subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);
