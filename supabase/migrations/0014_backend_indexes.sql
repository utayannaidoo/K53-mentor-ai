-- 0014: backend indexes for webhook + referral lookups
-- ============================================================================
-- The Paystack webhook resolves subscriptions by customer_code on renewal
-- charge.success, invoice.payment_failed and subscription.disable — without an
-- index every event scans the table. The referral endpoint counts profiles by
-- referred_by on each invite-card load.

create index if not exists subscriptions_provider_customer_idx
  on public.subscriptions (provider_customer_id);

create index if not exists profiles_referred_by_idx
  on public.profiles (referred_by);
