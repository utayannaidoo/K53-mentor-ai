# Recover a stuck refund

A money-back refund lands in pending_refunds when Paystack refuses it, usually
"Insufficient balance to process refund". Paystack only refunds from takings it
has not paid out yet: in South Africa that is roughly the last two working days
of sales. On a quiet week the learner's own payment has already been paid out
and nothing new covers it, so retrying alone may never succeed.

The daily reconcile-payments cron (03:00 UTC) retries each queued row. Support
gets a "Refund stuck" email after 2 failed retries, and a "Queued refund gave up"
email after 14, when the row becomes failed. Settle it from /admin/refunds (the
admin allowlist is ADMIN_EMAILS). Never delete a row: it is the audit trail.

## 1. Check Paystack first (read-only)

With the correct account key in the environment (or local .env.local), run:

    node scripts/paystack-refund-status.mjs <transaction-reference>

This only calls Paystack GET endpoints. It verifies the charge, reads every page
of refund history and keeps that charge's refunds (plus any refund that names no
charge), and checks the balance in the charge currency. Amounts are minor units:
ZAR 6000 means R60.

If any refund already exists, reconcile it in Paystack before doing anything
else. A pending or processing refund must not be submitted a second time, and a
processed one must be reconciled to the local row, never retried.

Do not use `node scripts/paystack-refund-diagnose.mjs --refund <reference>
--confirm` or the Paystack dashboard's refund button for a queued charge. Both
submit a refund outside the queue, and the cron would then submit the same
charge again. Use the diagnose script read-only (no `--refund`).

## 2a. Refund through Paystack

Once new sales or a balance top-up cover the charge, press **Retry now** on the
row. Registered businesses can top up by EFT (1% fee in South Africa); Starter
businesses can only wait for sales, or ask Paystack support to hold payouts
longer. A preflight is a point-in-time check, not a reservation of the balance.

Retry now works on a row that is still retrying and on one that has stopped. A
refusal is shown on the page and recorded as the row's last error, and does not
use up the cron's 14 attempts. On success the row is marked refunded, the
learner's plan ends if this charge is still their latest payment, any partner
commission is voided, and the learner is emailed.

## 2b. Repay by EFT

When Paystack cannot cover it in time:

1. Press **Stop retries to repay by EFT** first, so the cron cannot refund the
   same charge through Paystack the next morning. A row that gave up after 14
   attempts is already stopped.
2. Ask the learner for their bank details and pay them the charge amount by EFT.
3. Press **Mark as refunded** with the reference your bank shows. The page
   refuses this while the row is still retrying.

Only record the EFT after the money has gone. Recording runs the same follow-ups
as a Paystack refund, and the learner's email says the money came by EFT, not
back to their card. The row keeps the EFT reference and the admin who recorded
it (manual_reference, manual_recorded_by). Never retry through Paystack after
an EFT.

## 3. Verify completion

The row moves to "Settled in the last 30 days" on /admin/refunds. For a Paystack
refund, run the preflight again later: an accepted request is not proof that the
bank has credited the learner, so confirm Paystack's final processed status.
Check that the learner's plan ended only if the refunded charge was their latest;
a newer paid subscription must keep its tier. Check that the learner email went:
the page says when it could not, and then you tell them yourself. If Paystack
and local state disagree, escalate for reconciliation rather than resubmitting.

## Fallback: reopen a stopped row without the admin page

Only if /admin/refunds cannot be used (for example ADMIN_EMAILS is unset), and
only after a fresh preflight shows no existing refund and enough balance, reopen
the one failed row for the cron. Save the original row and preflight output in
the private incident record first, then use a compare-and-set update in the
administrator SQL session:

    update public.pending_refunds
    set status = 'queued', attempts = 0, updated_at = now()
    where id = '<verified-row-id>'::uuid
      and transaction_reference = '<verified-reference>'
      and status = 'failed'
      and attempts = <verified-attempt-count>
    returning id, transaction_reference, status, attempts, last_error;

Exactly one row must be returned. Keep last_error as the previous failure trail.
Do not clear money_back_used or edit subscription tiers: the cron owns the
refund request and its follow-ups.

Paystack API reference: https://paystack.com/docs/api/refund/
