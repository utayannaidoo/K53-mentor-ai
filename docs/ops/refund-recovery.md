# Recover an exhausted refund

A row in pending_refunds with status failed has exhausted the 14-attempt limit.
Funding Paystack alone does not restart it. Preserve the row as the audit trail.

## Read-only diagnosis

1. Inspect the failed row's transaction_reference, attempts and last_error using
   an administrator connection. Do not expose the user's email or secret keys.
2. With the correct account key in the environment (or local .env.local), run:

       node scripts/paystack-refund-status.mjs <transaction-reference>

   This only calls Paystack GET endpoints. It verifies the charge, reads every
   page of that transaction's refund history, and checks the balance in the
   charge currency. Amounts are minor units: ZAR 6000 means R60.
3. If any refund exists, reconcile its status in Paystack before retrying.
   Pending/processing refunds must not be submitted a second time. A processed
   refund must be reconciled to the local queue, never requeued.
4. If the reported balance is insufficient, fund the appropriate refund balance
   through Paystack. If that facility is unavailable, contact Paystack support.
   Do not use a second payment channel without recording and reconciling it.

## Resume the existing queue after funding

Only after a fresh preflight confirms no existing refund and adequate balance,
and the operator has verified the cancellation is still owed, reopen that one
failed row. Do not combine a direct/dashboard refund with this queue restart.
Save the original row and preflight output in the private incident record first.

Use a compare-and-set update in the administrator SQL session, substituting the
verified row ID, reference and original attempt count:

    update public.pending_refunds
    set status = 'queued', attempts = 0, updated_at = now()
    where id = '<verified-row-id>'::uuid
      and transaction_reference = '<verified-reference>'
      and status = 'failed'
      and attempts = <verified-attempt-count>
    returning id, transaction_reference, status, attempts, last_error;

Exactly one row must be returned. Keep last_error as the previous failure trail.
Do not clear money_back_used or edit subscription tiers. The existing daily
reconcile-payments cron (03:00 UTC) owns the refund request and its follow-ups.
A preflight is a point-in-time check, not a reservation of the balance.

## Verify completion

Run the read-only preflight again after the cron. An accepted request is not
proof that the bank has credited the learner: confirm Paystack's final processed
status. Check the local queue, subscription downgrade for the refunded charge,
commission reversal where applicable, and notification delivery. A newer paid
subscription must retain its entitlements. If Paystack or local state disagrees,
escalate for reconciliation; do not keep resubmitting the same charge.

Paystack API reference: https://paystack.com/docs/api/refund/
