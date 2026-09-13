import { describe, expect, it } from "vitest";
import { clearsAutobuyGuard } from "@/lib/billing/autobuy-guard";

/**
 * The Back-from-Paystack trapdoor.
 *
 * `/account/billing?buy=premium` launches checkout on mount — that URL is what
 * every paywall and pricing CTA links to. Pressing Back from Paystack returns
 * to a URL that still says `?buy=premium`, so a once-per-tab sessionStorage
 * guard is what stops the page throwing the buyer forward again.
 *
 * The guard was cleared at the top of the checkout handler for a good reason
 * (a deliberate click is a fresh decision) that was applied to the wrong set
 * of callers: the automatic path calls the same handler, so it deleted the
 * guard protecting it. Back went to Paystack. Back again went to Paystack.
 *
 * That is what a real learner hit on 13 September 2026: six `checkout_started`
 * events in 29 seconds, roughly five seconds apart — the cadence of a page
 * load and a Back press, not of a person clicking a button — before he gave up
 * and went back to the free drill. Nobody was charged, because he could never
 * get back to the app to finish.
 */
describe("the once-per-tab auto-checkout guard", () => {
  it("a deliberate click re-arms it, so a second considered purchase still works", () => {
    expect(clearsAutobuyGuard("billing_page")).toBe(true);
  });

  it("the automatic path leaves it standing, or it disarms itself", () => {
    // The whole bug in one assertion. `true` here is the redirect loop.
    expect(clearsAutobuyGuard("autobuy")).toBe(false);
  });
});
