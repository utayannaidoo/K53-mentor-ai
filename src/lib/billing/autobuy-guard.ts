/**
 * The once-per-tab guard on `/account/billing?buy=…`.
 *
 * That URL means "start checkout immediately" — it is what every paywall and
 * pricing CTA links to. Sending the buyer straight to Paystack is the point,
 * but it makes the page dangerous on a **back** navigation: pressing Back from
 * Paystack returns to a URL that still says `?buy=premium`, the effect runs
 * again, and the buyer is thrown forward to Paystack before they can read
 * anything. The guard is a sessionStorage flag that allows the automatic
 * checkout once per tab.
 *
 * ── The bug this function exists to prevent ─────────────────────────────────
 *
 * The guard was cleared unconditionally at the top of the checkout handler,
 * with the reasoning that *a deliberate click* means the buyer has made a
 * fresh decision, so a later auto-checkout in the same tab is legitimate. That
 * reasoning is right, and the code did not implement it: the automatic path
 * calls the same handler, so the guard was deleted by the very call it was
 * guarding. It could never fire, and Back from Paystack looped straight back
 * to Paystack.
 *
 * A learner did exactly that on 13 September 2026 — six `checkout_started`
 * events in 29 seconds, spaced about five seconds apart, which is the rhythm
 * of a page load and a Back press, not of someone clicking a button. He gave
 * up and went back to the free drill. It read like a broken endpoint; it was a
 * trapdoor.
 */
export type CheckoutSource = "billing_page" | "autobuy";

/**
 * Only a deliberate click re-arms automatic checkout for this tab. The
 * automatic path must leave the guard standing, or it disarms itself.
 */
export function clearsAutobuyGuard(source: CheckoutSource): boolean {
  return source === "billing_page";
}
