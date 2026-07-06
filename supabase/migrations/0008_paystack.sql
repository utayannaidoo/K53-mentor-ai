-- 0008: switch billing provider from Stripe to Paystack
-- ============================================================================

-- Generalize the webhook idempotency ledger's name — it's provider-agnostic
-- (keyed by "<event>:<paystack event/reference id>" now, was Stripe event ids).
alter table if exists public.stripe_events rename to payment_events;

comment on column public.subscriptions.provider is 'e.g. ''paystack''';
comment on column public.subscriptions.provider_customer_id is 'Paystack customer_code';
comment on column public.subscriptions.provider_subscription_id is 'Paystack subscription_code';
