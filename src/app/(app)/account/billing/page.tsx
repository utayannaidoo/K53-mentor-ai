"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Sparkles, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useStudyStore } from "@/hooks/use-study-store";
import {
  PLANS,
  PLAN_MAP,
  MONEY_BACK_DAYS,
  REFUND_PROCESSING_DAYS,
  monthlyPrice,
  annualMonthlyPrice,
  annualPrice,
  isFreePlan,
} from "@/lib/billing/plans";
import { cn, formatZar } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { track as trackEvent } from "@/lib/analytics";
import type { SubscriptionTier } from "@/types";

/**
 * Marks that this tab arrived with a purchase intent (`?buy=` auto-checkout).
 * Cleared the moment a payment confirms — after that, a later visit to this
 * page is a fresh decision, not an abandoned checkout to resume.
 */
const AUTOBUY_SESSION_KEY = "k53.autobuy";

/**
 * PostHog is the funnel's main instrument, but ad blockers drop it for a
 * meaningful share of SA mobile traffic — exactly the devices Paystack
 * checkout happens on. Unverified payment returns are also support-relevant
 * (the buyer may not know whether they were charged), so mirror them to the
 * server log sink, which nothing in the browser can block. Fire-and-forget.
 */
function reportUnverifiedReturn(reason: "not_paid" | "timeout" | "no_reference") {
  trackEvent("payment_return_unverified", { reason });
  void fetch("/api/log", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message: `payment_return_unverified reason=${reason}`,
      url: "/account/billing",
    }),
  }).catch(() => {});
}

function BillingInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const { state, hasOnboarded, setTier, refreshAccount } = useStudyStore();
  type BannerTone = "success" | "info" | "warning";
  const [banner, setBanner] = React.useState<string | null>(
    // Returning from Paystack is NOT proof of payment — the hosted page sends
    // everyone back here, paid or not. Say what's actually happening until
    // verification answers.
    sp.get("status") === "success" ? "Checking your payment…" : null,
  );
  const [bannerTone, setBannerTone] = React.useState<BannerTone>(
    sp.get("status") === "success" ? "info" : "success",
  );
  /** Every banner write goes through here so the tone can never go stale. */
  function showBanner(text: string, tone: BannerTone = "success") {
    setBanner(text);
    setBannerTone(tone);
  }
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<SubscriptionTier | null>(null);

  // After the Paystack redirect the webhook may still be in flight — poll the
  // account until the paid tier lands so the page doesn't look paid-but-locked.
  const paidReturn = sp.get("status") === "success";
  React.useEffect(() => {
    if (!paidReturn || !isSupabaseConfigured) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    // Paystack appends the transaction reference to the callback URL.
    const reference = sp.get("reference") ?? sp.get("trxref");

    const settle = (tier: SubscriptionTier | null): boolean => {
      if (cancelled) return true;
      if (tier && tier !== "free") {
        showBanner("Payment complete — taking you to your study plan…");
        // Payment succeeded, so a future purchase intent in this tab should
        // auto-checkout again rather than being treated as a possible
        // abandoned-checkout revisit.
        try {
          window.sessionStorage.removeItem(AUTOBUY_SESSION_KEY);
        } catch {
          /* private mode */
        }
        trackEvent("plan_activated", { tier });
        // A returning user who just changed plans is already signed in and
        // onboarded — send them straight back into the app. Only a brand-new
        // payer who hasn't onboarded yet needs the /continue router (which
        // hands first-timers into onboarding/diagnostic). Routing an existing
        // user through /continue is what could bounce a plan change to /login.
        setTimeout(() => {
          if (!cancelled) router.push(hasOnboarded ? "/dashboard" : "/continue");
        }, 1600);
        return true;
      }
      return false;
    };

    let tries = 0;
    const poll = async () => {
      tries += 1;
      const tier = await refreshAccount().catch(() => null);
      if (settle(tier)) return;
      if (tries < 8) timer = setTimeout(poll, 2500);
      else {
        reportUnverifiedReturn(reference ? "timeout" : "no_reference");
        showBanner(
          reference
            ? "We couldn't confirm your payment yet. If you were charged, your plan activates automatically within a few minutes — check back shortly."
            : "Your checkout didn't complete, so you haven't been charged. Pick a plan below whenever you're ready.",
          "warning",
        );
      }
    };

    const run = async () => {
      // Confirm the payment server-side straight away rather than waiting on
      // the webhook — the plan activates the moment the buyer is back.
      if (reference) {
        try {
          const res = await fetch("/api/paystack/verify", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ reference }),
          });
          if (res.ok && !cancelled) {
            // A definitive "not paid" from Paystack won't change with polling:
            // abandoned and failed transactions stay abandoned. Say so instead
            // of promising an activation that is never coming.
            const verdict = (await res.json().catch(() => null)) as
              | { verified?: boolean }
              | null;
            if (verdict && verdict.verified === false) {
              reportUnverifiedReturn("not_paid");
              showBanner(
                "That payment didn't go through, so you haven't been charged. If it was a mistake, pick a plan below to try again.",
                "warning",
              );
              return;
            }
            const tier = await refreshAccount().catch(() => null);
            if (settle(tier)) return;
          }
        } catch {
          // fall through to polling
        }
      }
      if (!cancelled) timer = setTimeout(poll, 1500);
    };
    run();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidReturn]);
  const [cycle, setCycle] = React.useState<"monthly" | "annual">(
    sp.get("cycle") === "annual" ? "annual" : "monthly",
  );
  const [cancelBusy, setCancelBusy] = React.useState(false);
  const [confirmingCancel, setConfirmingCancel] = React.useState(false);
  const [cardBusy, setCardBusy] = React.useState(false);

  /**
   * Server truth about renewal. Deliberately not in the study store: that is
   * client state persisted to localStorage, and a stale cached copy telling
   * someone their access ends on the wrong day is worse than a fetch.
   */
  interface BillingStatus {
    tier?: string;
    hasBillingAccount?: boolean;
    cancelAtPeriodEnd?: boolean;
    currentPeriodEnd?: string | null;
    refundEligible?: boolean;
    /** When refundEligible is false: which money-back gate closed, so the
        cancel dialog states the real reason instead of implying a promise. */
    refundIneligibleReason?: "not_paid" | "money_back_used" | "no_payment_record" | "outside_window" | null;
    /** Non-null while a money-back refund sits queued for automatic retry. */
    refundProcessingSince?: string | null;
    moneyBackDays?: number;
  }
  const [billing, setBilling] = React.useState<BillingStatus | null>(null);

  const loadBilling = React.useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const res = await fetch("/api/billing/status");
      setBilling(res.ok ? ((await res.json()) as BillingStatus) : null);
    } catch {
      // Non-fatal: the page still works, it just can't name a renewal date.
      setBilling(null);
    }
  }, []);

  React.useEffect(() => {
    void loadBilling();
  }, [loadBilling]);

  /** "3 September 2026" — the date someone is actually owed access until. */
  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return null;
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return null;
    return new Date(t).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  /**
   * "26 August 2026" — the date a queued money-back refund is promised by:
   * REFUND_PROCESSING_DAYS business days out, which is what Paystack's
   * settlement cycle (the usual reason an instant refund can't fire) takes to
   * refill the balance the daily retry pass spends.
   */
  const refundEta = () => {
    const d = new Date();
    let added = 0;
    while (added < REFUND_PROCESSING_DAYS) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) added += 1;
    }
    return formatDate(d.toISOString());
  };

  /**
   * Send the learner to Paystack's hosted page to attach a new card.
   *
   * The old advice here was "cancel and resubscribe with the new card", which
   * asked someone whose payment had just failed to first give up their
   * subscription. Paystack hosts the form because it collects card details;
   * that is also why this is a redirect rather than anything inline.
   */
  async function doUpdateCard() {
    setError(null);
    setCardBusy(true);
    try {
      const res = await fetch("/api/billing/update-card", { method: "POST" });
      const data = await res.json().catch(() => ({}) as { url?: string; error?: string });
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(
        data.error === "no_billing_account" || data.error === "no_active_subscription"
          ? "No active subscription found — if you just paid, give it a minute and refresh."
          : "Couldn't open the card update page — please try again shortly.",
      );
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setCardBusy(false);
    }
  }

  /** Cancel the active Paystack subscription — Paystack has no hosted portal. */
  async function doCancel() {
    setError(null);
    setCancelBusy(true);
    // Read the tier before anything below can flip it to "free" — otherwise
    // every cancellation reports churning off the Free plan.
    const cancelledFrom = state.tier;
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        refunded?: boolean;
        refundError?: boolean;
        /** True when the refund failed instantly but is queued for automatic retry. */
        refundQueued?: boolean;
        /** Paystack's verbatim refusal — logged server-side, never shown raw. */
        refundMessage?: string | null;
        /** Why no refund was even attempted (money-back gates). */
        refundReason?: string | null;
        /** Honest upper bound for a queued refund, in business days. */
        refundProcessingDays?: number;
        /** true only when the charge was reversed, so access ends now. */
        endsNow?: boolean;
        accessUntil?: string | null;
        /** Lifetime of the subscription in days; null when unknown. */
        daysActive?: number | null;
      };
      if (res.ok) {
        // The one event the funnel was missing. `refunded` separates a
        // money-back cancellation inside the 7-day window from someone
        // leaving later — very different signals about why they went.
        trackEvent("subscription_cancelled", {
          plan: cancelledFrom,
          refunded: Boolean(data.refunded),
          ends_now: Boolean(data.endsNow),
          ...(typeof data.daysActive === "number" ? { days_active: data.daysActive } : {}),
        });
        setConfirmingCancel(false);
        void loadBilling();
        // Only drop the local tier when access actually ended. Outside the
        // money-back window the learner keeps everything until the period
        // runs out, and flipping the store to "free" here would lock them out
        // of content they have paid for until the next page load corrected it.
        if (data.endsNow) {
          setTier("free");
          showBanner(
            "Your plan is cancelled and your payment refunded in full — it clears to your card within 5–10 business days.",
          );
          return;
        }
        if (data.refundQueued) {
          // The instant refund couldn't fire (usually Paystack's settlement
          // balance is empty), but the money IS owed and a cron now owns
          // completing it. Promise a date, not a shrug — and be clear access
          // continues until the refund actually lands.
          const by = refundEta();
          showBanner(
            `Your plan is cancelled and your refund is processing — no action needed. It completes automatically${
              by ? ` by ${by}` : ` within ${data.refundProcessingDays ?? REFUND_PROCESSING_DAYS} business days`
            }, and you'll get a confirmation email. You keep full access until then.`,
            "info",
          );
          return;
        }
        const until = formatDate(data.accessUntil);
        showBanner(
          (until
            ? `Your plan won't renew. You keep full access until ${until}.`
            : "Your plan won't renew. You keep full access until the end of the period you've paid for.") +
            (data.refundError
              ? " We couldn't process an automatic refund — email us if you were expecting one."
              : ""),
        );
        return;
      }
      setError(
        data.error === "no_billing_account" || data.error === "no_active_subscription"
          ? "No active subscription found — if you just paid, give it a minute and refresh."
          : "Cancellation couldn't complete — please try again shortly.",
      );
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setCancelBusy(false);
    }
  }

  /** `source` separates one-click entries (?buy= from paywalls/pricing) from
      a deliberate pick on this page — the split that answers whether
      skipping the plan comparison helps or hurts conversion. */
  async function choose(
    plan: (typeof PLANS)[number],
    source: "billing_page" | "autobuy" = "billing_page",
  ) {
    if (plan.id === state.tier) return;
    setError(null);
    if (plan.id === "free") {
      if (isSupabaseConfigured && state.tier !== "free") {
        // A real subscription can't be ended by flipping local state — the
        // Paystack subscription would keep billing. Confirm, then cancel.
        setConfirmingCancel(true);
        return;
      }
      setTier("free");
      showBanner("You're now on the Free plan.", "info");
      return;
    }
    setBusy(plan.id);
    // A deliberate click means future intents in this tab may auto-checkout
    // again — clear the abandoned-checkout guard.
    try {
      window.sessionStorage.removeItem(AUTOBUY_SESSION_KEY);
    } catch {
      /* private mode */
    }
    trackEvent("checkout_started", { plan: plan.id, cycle, source });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: plan.id, cycle }),
      });
      const data = await res.json().catch(() => ({}) as { url?: string; demo?: boolean });
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      // Local unlock exists ONLY in the pure demo build (no accounts, no
      // billing backend). Anywhere else, a failed checkout is a failure —
      // tier is granted exclusively by the Paystack webhook.
      if (data.demo && !isSupabaseConfigured) {
        setTier(plan.id);
        showBanner(`You're now on ${plan.name}. (Demo — no charge was made.)`);
        return;
      }
      setError(
        data.demo
          ? "Payments aren't configured on this environment yet (Paystack keys are missing), so no charge was made and your plan is unchanged."
          : "Checkout couldn't start — please try again in a moment.",
      );
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  // Arrived from a landing pricing button or a paywall CTA (…?buy=premium):
  // kick off that plan's checkout automatically. If the account already has a
  // paid plan, don't charge again — carry straight on into the app.
  const buy = sp.get("buy");
  const autoBuyStarted = React.useRef(false);
  React.useEffect(() => {
    if (!buy || !isSupabaseConfigured || autoBuyStarted.current) return;
    autoBuyStarted.current = true;
    // Once per tab session: a remount after backing out of Paystack (history
    // navigation recreates this page) would otherwise re-fire the checkout
    // before the buyer can even read the plans.
    try {
      if (window.sessionStorage.getItem(AUTOBUY_SESSION_KEY) === "1") {
        showBanner(
          "Your last checkout didn't finish — nothing was charged. Pick a plan below when you're ready.",
          "info",
        );
        return;
      }
      window.sessionStorage.setItem(AUTOBUY_SESSION_KEY, "1");
    } catch {
      /* private mode — no guard available, proceed */
    }
    void (async () => {
      const tier = await refreshAccount().catch(() => null);
      // Anti-double-charge: only when the requested plan IS the current plan
      // is there nothing to buy. A paid user asking for the OTHER paid plan is
      // an upgrade (Premium → Premium Plus) and must reach checkout — bouncing
      // them to /continue made every upgrade CTA a silent dead end.
      if (tier && tier === buy) {
        router.replace("/continue");
        return;
      }
      if (buy === "premium" || buy === "premium_plus") {
        setBusy(buy);
        void choose(PLAN_MAP[buy], "autobuy");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buy]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Billing & plan" description="Manage your subscription." />

      {banner && (
        <div
          className={cn(
            "mb-5 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm",
            bannerTone === "success" && "border-success/30 bg-success/[0.08] text-success",
            bannerTone === "info" &&
              "border-primary/30 bg-primary/[0.08] text-foreground",
            bannerTone === "warning" &&
              "border-warning/40 bg-warning/[0.09] text-foreground",
          )}
          role="status"
        >
          <CheckCircle2
            className={cn(
              "h-4 w-4 shrink-0",
              bannerTone === "success" && "text-success",
              bannerTone === "info" && "text-primary",
              bannerTone === "warning" && "text-warning",
            )}
          />{" "}
          {banner}
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-lg border border-danger/30 bg-danger/[0.08] px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* The tier is written by the payment webhook — if a payment just went
          through, this pulls the fresh status without a full reload. */}
      {isSupabaseConfigured && (
        <div className="-mt-2 mb-5">
          <button
            type="button"
            className="-my-2 inline-flex items-center rounded-md px-3 py-2 text-xs font-medium text-primary hover:underline"
            onClick={async () => {
              const tier = await refreshAccount().catch(() => null);
              showBanner(
                tier && tier !== "free"
                  ? `Plan status refreshed — you're on ${PLAN_MAP[tier].name}.`
                  : "Plan status refreshed — no active paid plan found yet.",
                "info",
              );
            }}
          >
            Refresh plan status
          </button>
        </div>
      )}

      <div className="mb-6">
        {/* Billing cycle — annual takes R20/mo off every paid plan. */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Billing</span>
          <div className="inline-flex rounded-full bg-muted/60 p-[5px] shadow-[inset_0_0_0_1px_hsl(0_0%_100%/0.07)]">
            {(["monthly", "annual"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors max-sm:min-h-[44px]",
                  cycle === c
                    ? "bg-card text-foreground shadow-[0_4px_12px_-6px_hsl(var(--shadow)/0.6)]"
                    : "text-muted-foreground",
                )}
              >
                {c === "monthly" ? "Monthly" : "Annual"}
              </button>
            ))}
          </div>
          {cycle === "annual" && (
            <span className="text-xs font-medium text-success">Save R20/mo — one payment covers the year</span>
          )}
        </div>

        {/* Said before the card is entered, not first disclosed on the receipt.
            Shown to everyone who could start a subscription here. */}
        {state.tier === "free" && (
          <p className="mt-3 text-xs text-muted-foreground">
            Paid plans renew automatically {cycle === "annual" ? "every year" : "every month"} until
            you cancel. Cancel any time from this page — you keep access to the end of the period
            you&apos;ve paid for, and within {MONEY_BACK_DAYS} days of your first payment we refund
            it in full.
          </p>
        )}

        {isSupabaseConfigured && state.tier !== "free" && !confirmingCancel && (
          <div className="mt-4">
            {/* Durable "your money is coming back" state. The cancel-time
                banner scrolls away; a queued refund lasts days, so this chip
                keeps the promise visible until the cron completes it. */}
            {billing?.refundProcessingSince && (
              <div className="mb-3 rounded-lg border border-primary/30 bg-primary/[0.08] px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  Your refund is processing — no action needed
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  You cancelled inside the money-back window. The refund completes automatically
                  {refundEta() ? ` by ${refundEta()}` : ` within ${REFUND_PROCESSING_DAYS} business days`} and
                  you&rsquo;ll get a confirmation email when it lands.
                </p>
              </div>
            )}
            {/* Renewal state, in the two words that matter: does it renew, and
                until when. Rendered only once the server has answered, so the
                page never guesses a date. */}
            {billing?.hasBillingAccount &&
              (billing.cancelAtPeriodEnd ? (
                <div className="mb-3 rounded-lg border border-warning/30 bg-warning/[0.08] px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    Your plan won&apos;t renew
                    {formatDate(billing.currentPeriodEnd)
                      ? ` — full access until ${formatDate(billing.currentPeriodEnd)}`
                      : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Nothing more will be charged. After that date you drop to Free — and since your
                    free week is already used, that means no daily allowances. Resume any time
                    before then to keep going without a gap.
                  </p>
                  <div className="mt-3">
                    <Button
                      onClick={() => choose(PLAN_MAP[state.tier])}
                      disabled={busy !== null}
                      aria-busy={busy !== null}
                    >
                      {busy ? <Spinner className="mr-2 h-3.5 w-3.5" /> : null}
                      Resume {PLAN_MAP[state.tier].name}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mb-3 text-sm text-muted-foreground">
                  Renews automatically
                  {formatDate(billing.currentPeriodEnd)
                    ? ` on ${formatDate(billing.currentPeriodEnd)}`
                    : ""}
                  . Cancel any time.
                </p>
              ))}

            <div className="flex flex-wrap items-center gap-2">
              {/* default size, not sm: these are the two taps a subscriber in
                  trouble needs most (failed card → update), on a phone. */}
              <Button variant="outline" onClick={doUpdateCard} disabled={cardBusy} aria-busy={cardBusy}>
                {cardBusy ? <Spinner className="mr-2 h-3.5 w-3.5" /> : null}
                Update card
              </Button>
              {!billing?.cancelAtPeriodEnd && (
                <Button variant="outline" onClick={() => setConfirmingCancel(true)}>
                  Cancel plan
                </Button>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Card expired or replaced? Update it here — your plan carries on uninterrupted. We
              never see your card details; the form is hosted by Paystack.
            </p>
          </div>
        )}
        {confirmingCancel && (
          <div className="mt-4 rounded-lg border border-warning/30 bg-warning/[0.08] p-4">
            <p className="text-sm font-medium text-foreground">Cancel your plan?</p>
            {/* Two genuinely different outcomes, and the old copy described
                only one of them. Inside the money-back window the charge is
                reversed, so access ends with it; outside it, nothing is
                refunded and the paid period is still owed. */}
            {billing?.refundEligible ? (
              <p className="mt-1 text-xs text-muted-foreground">
                You&apos;re still inside the {billing.moneyBackDays ?? 7}-day money-back window, so
                we&apos;ll refund your payment in full automatically and access ends straight away.
                If our payment provider can&apos;t send it back instantly, it completes on its own
                within {REFUND_PROCESSING_DAYS} business days — you&apos;ll get a confirmation
                email either way. Your progress, streak and readiness all carry over.
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                {billing?.refundIneligibleReason === "outside_window" &&
                  `Your ${billing.moneyBackDays ?? 7}-day money-back window has ended. `}
                {billing?.refundIneligibleReason === "money_back_used" &&
                  "The one-time money-back guarantee has already been used on this account. "}
                You keep full access until
                {formatDate(billing?.currentPeriodEnd)
                  ? ` ${formatDate(billing?.currentPeriodEnd)}`
                  : " the end of the period you've paid for"}
                {" "}— nothing more will be charged and nothing is lost today. After that you drop to
                Free, and since your free week is already used there are no daily allowances. Your
                progress, streak and readiness all carry over either way.
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="danger"
                onClick={doCancel}
                loading={cancelBusy}
                loadingText="Cancelling…"
              >
                Yes, cancel
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmingCancel(false)} disabled={cancelBusy}>
                Keep my plan
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const current = plan.id === state.tier;
          return (
            <Card
              key={plan.id}
              className={cn("flex flex-col p-6", plan.highlighted && !current && "border-primary ring-1 ring-primary")}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                {current && <Badge variant="success">Current</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-2xl font-semibold">
                  {isFreePlan(plan)
                    ? "Free"
                    : formatZar(cycle === "annual" ? annualMonthlyPrice(plan) : monthlyPrice(plan))}
                </span>
                {!isFreePlan(plan) && <span className="text-sm text-muted-foreground">/month</span>}
              </div>
              {!isFreePlan(plan) && cycle === "annual" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatZar(annualPrice(plan))} billed once a year
                </p>
              )}

              <Button
                className="mt-5 w-full"
                variant={current ? "outline" : plan.highlighted ? "default" : "outline"}
                disabled={current || busy !== null}
                loading={busy === plan.id}
                loadingText="Opening checkout…"
                onClick={() => choose(plan)}
              >
                {current ? (
                  "Current plan"
                ) : plan.id === "free" ? (
                  "Downgrade"
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Choose {plan.name}
                  </>
                )}
              </Button>

              <ul className="mt-6 space-y-2.5">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="text-foreground">{perk}</span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {isSupabaseConfigured
          ? "Payments are powered by Paystack. Paid features unlock the moment your payment is confirmed."
          : "Payments are powered by Paystack (payment-ready, not charged in this demo). Choosing a paid plan unlocks its features immediately so you can try them."}
        {" "}
        <a href="/refunds" className="underline hover:text-foreground">
          Refund &amp; cancellation policy
        </a>
        .
      </p>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner className="h-6 w-6" /></div>}>
      <BillingInner />
    </Suspense>
  );
}
