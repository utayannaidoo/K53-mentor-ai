import type { ChargeSuccessData } from "@/lib/paystack/apply";

/**
 * Ledger ids for Paystack webhook events.
 *
 * The `payment_events` table makes every event apply exactly once: the webhook
 * claims an id before applying, and a redelivery that hits the unique index is
 * acknowledged as a duplicate. That only works when the id is unique *per
 * event instance*. An earlier scheme keyed every event as `${event}:${id}` and
 * fell back to the empty string when the payload carried neither `id` nor
 * `reference` — which most lifecycle events don't. Every customer's
 * `refund.processed` collapsed onto the single id `"refund.processed:"`, so
 * after the first refund ever was applied, all later ones — for any customer —
 * were swallowed as duplicates. Same shape for `subscription.disable`,
 * `subscription.not_renew` and `invoice.payment_failed`.
 *
 * This function derives a stable per-instance id where the payload offers one,
 * and returns null where it doesn't. A null means "no reliable identity":
 * callers apply the event WITHOUT claiming a ledger row. That is safe because
 * every non-charge handler is an idempotent state write (set a flag, set a
 * status) — replaying one converges on the same state, unlike `charge.success`
 * whose credits/tier grant genuinely must run once.
 */

interface RefundData {
  refund_reference?: string;
  transaction?: { reference?: string } | null;
  transaction_reference?: string;
}

interface SubscriptionEventData {
  subscription_code?: string;
  customer?: { customer_code?: string } | null;
}

interface PaymentFailedData extends SubscriptionEventData {
  /** Best timestamp available to separate repeated failures for one subscription. */
  paid_at?: string;
  created_at?: string;
}

export function webhookLedgerId(event: string, data: unknown): string | null {
  const d = (data ?? {}) as Record<string, unknown>;
  switch (event) {
    case "charge.success": {
      const charge = data as ChargeSuccessData;
      return typeof charge?.id !== "undefined"
        ? `charge.success:${String(charge.id)}`
        : // No transaction id: nothing to dedupe on, and this is the one event
          // that must never be applied twice. Callers treat null as "refuse".
          null;
    }
    case "refund.processed": {
      const r = data as RefundData;
      const ref = r.refund_reference ?? r.transaction?.reference ?? r.transaction_reference;
      return ref ? `refund.processed:${ref}` : null;
    }
    case "charge.dispute.create": {
      // Dispute payloads carry their own numeric id.
      return typeof d.id !== "undefined" ? `${event}:${String(d.id)}` : null;
    }
    case "invoice.payment_failed": {
      const p = data as PaymentFailedData;
      const sub = p.subscription_code ?? p.customer?.customer_code;
      if (!sub) return null;
      const at = p.paid_at ?? p.created_at ?? "";
      return `${event}:${sub}:${at}`;
    }
    case "subscription.disable":
    case "subscription.not_renew": {
      const s = data as SubscriptionEventData;
      const code = s.subscription_code ?? s.customer?.customer_code;
      return code ? `${event}:${code}` : null;
    }
    default:
      return null;
  }
}
