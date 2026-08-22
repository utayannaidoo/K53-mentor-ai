import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthorizedCron } from "@/lib/cron/auth";
import { isPaystackConfigured } from "@/lib/env";
import { listTransactions } from "@/lib/paystack/client";
import { applyChargeOnce, normaliseTransaction } from "@/lib/paystack/apply";
import { processPendingRefunds } from "@/lib/billing/pending-refunds";

export const runtime = "nodejs";
// Pages through Paystack sequentially and may apply several grants; take the
// full minute rather than the ~10s default.
export const maxDuration = 60;

/**
 * Payment reconciliation — the safety net under the webhook.
 *
 * Both the webhook and the callback-verify route claim a row in the
 * `payment_events` ledger before granting, and release it if the grant throws.
 * That handles almost everything, but one sequence slips through: the webhook
 * lands first and returns `{duplicate: true}` because verify already claimed
 * the row, then verify's grant throws and releases it. Paystack has already had
 * its 200 and will not redeliver. The money is taken, the ledger is clean, and
 * the account is still on free — with no error anywhere except a log line.
 *
 * The same hole opens whenever Paystack exhausts its retries while our database
 * is unreachable, which is exactly when it is most likely to happen.
 *
 * So: ask Paystack what it actually charged, and grant anything we have no
 * ledger row for. `applyChargeOnce` reuses the webhook's idempotency, so a
 * charge already applied is skipped on the unique violation rather than
 * double-granting — which matters most for tutor top-ups, where a second grant
 * is free credits.
 *
 * Read-only in the common case: on a healthy day every transaction hits
 * `already_applied` and nothing is written.
 */

/** How far back to re-check. Comfortably longer than Paystack's retry window,
 *  and long enough that a weekend outage is still caught on Monday. */
const LOOKBACK_DAYS = 3;
const PER_PAGE = 50;
/** Stop rather than page forever if the window somehow returns huge volume. */
const MAX_PAGES = 20;

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isPaystackConfigured) {
    return Response.json({ error: "Paystack not configured" }, { status: 503 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return Response.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const from = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000).toISOString();

  let scanned = 0;
  let repaired = 0;
  let alreadyApplied = 0;
  let failed = 0;
  const repairedRefs: string[] = [];

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const txs = await listTransactions({ from, page, perPage: PER_PAGE, status: "success" });
      if (txs.length === 0) break;

      for (const tx of txs) {
        // `status: success` is a server-side filter, but re-check rather than
        // trust it: granting a paid tier for a failed charge is the one
        // mistake this job must never make.
        if (tx.status !== "success") continue;
        scanned += 1;

        const outcome = await applyChargeOnce(admin, normaliseTransaction(tx));
        if (outcome === "applied") {
          repaired += 1;
          // Loud on purpose — every line here is a customer who paid and did
          // not get what they paid for until this job ran.
          console.error(
            "[reconcile] granted a charge the webhook never applied",
            JSON.stringify({ reference: tx.reference, id: tx.id, amount: tx.amount }),
          );
          if (repairedRefs.length < 20) repairedRefs.push(tx.reference);
        } else if (outcome === "already_applied") {
          alreadyApplied += 1;
        } else {
          failed += 1;
        }
      }

      if (txs.length < PER_PAGE) break;
    }
  } catch (err) {
    // A Paystack outage mid-run leaves earlier pages already repaired, which is
    // fine — the job is idempotent and tomorrow's run re-checks the same window.
    console.error("[reconcile] paystack listing failed", err);
    return Response.json(
      { error: "Reconciliation incomplete", scanned, repaired, alreadyApplied, failed },
      { status: 502 },
    );
  }

  if (failed > 0) {
    console.error(
      "[reconcile] some charges could not be applied",
      JSON.stringify({ failed, scanned }),
    );
  }

  // Second pass: money-back refunds that Paystack refused earlier (usually
  // "Insufficient balance" — the balance refills on the settlement cycle this
  // job's daily schedule naturally waits out). Each queued row gets one retry
  // attempt here; on success the revoke lands and the learner is emailed.
  // Failures are recorded on the row and simply wait for tomorrow's pass —
  // never thrown, so a stuck refund cannot mask a reconciliation failure
  // above (or vice versa).
  let refunds: Awaited<ReturnType<typeof processPendingRefunds>> | null = null;
  try {
    refunds = await processPendingRefunds(admin);
    if (refunds.refunded > 0 || refunds.failed > 0) {
      console.error("[refunds] cron pass result", JSON.stringify(refunds));
    }
  } catch (err) {
    console.error("[refunds] retry pass crashed (rows keep their state)", err);
  }

  return Response.json({
    ok: true,
    windowDays: LOOKBACK_DAYS,
    scanned,
    repaired,
    alreadyApplied,
    failed,
    repairedRefs,
    refunds,
  });
}
