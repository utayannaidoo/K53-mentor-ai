"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  monthlyPrice,
  annualMonthlyPrice,
  annualPrice,
  isFreePlan,
  vehicleClass as classOfCode,
  VEHICLE_CLASS_LABEL,
  VEHICLE_CLASS_SHORT,
} from "@/lib/billing/plans";
import { cn, formatZar } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { track as trackEvent } from "@/lib/analytics";
import type { SubscriptionTier, VehicleClass } from "@/types";

function BillingInner() {
  const sp = useSearchParams();
  const { state, setTier, setVehicleClass, updateOnboarding, refreshAccount } = useStudyStore();
  const [banner, setBanner] = React.useState<string | null>(
    sp.get("status") === "success" ? "Payment received — activating your plan…" : null,
  );
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
        setBanner("Payment complete — your plan is active.");
        trackEvent("plan_activated", { tier });
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
      else setBanner("Payment received. Your plan can take a minute to activate — refresh shortly.");
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
  // The track (car vs bike+heavy) is chosen here — it sets which codes the
  // learner can study and drives the per-class price. A plan covers exactly
  // one track; the other track's plans are a switch, never included.
  const [track, setTrack] = React.useState<VehicleClass>(state.vehicleClass ?? "car");
  const [cycle, setCycle] = React.useState<"monthly" | "annual">("monthly");
  const [cancelBusy, setCancelBusy] = React.useState(false);
  const [confirmingCancel, setConfirmingCancel] = React.useState(false);

  /** Cancel the active Paystack subscription — Paystack has no hosted portal. */
  async function doCancel() {
    setError(null);
    setCancelBusy(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = await res
        .json()
        .catch(() => ({}) as { error?: string; refunded?: boolean; refundError?: boolean });
      if (res.ok) {
        setTier("free");
        setConfirmingCancel(false);
        setBanner(
          data.refunded
            ? "Your plan is cancelled and your payment refunded in full — it clears to your card within 5–10 business days."
            : data.refundError
              ? "Your plan is cancelled. We couldn't process the automatic refund — please email us and we'll sort it out right away."
              : "Your plan is cancelled — you're back on Free.",
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

  /** Move the subscription (and the study content with it) onto `track`. */
  function applyTrack() {
    setVehicleClass(track);
    // The study code must live inside the track that's being paid for —
    // otherwise the subscription says one vehicle class while every study
    // surface serves another.
    const code = state.onboarding?.vehicleCode;
    if (code && classOfCode(code) !== track) {
      updateOnboarding({ vehicleCode: track === "car" ? "8" : "A" });
    }
  }

  async function choose(plan: (typeof PLANS)[number]) {
    const switchingTrack = state.vehicleClass !== null && state.vehicleClass !== track;
    if (plan.id === state.tier && !switchingTrack) return;
    setError(null);
    if (plan.id === "free") {
      if (isSupabaseConfigured && state.tier !== "free") {
        // A real subscription can't be ended by flipping local state — the
        // Paystack subscription would keep billing. Confirm, then cancel.
        setConfirmingCancel(true);
        return;
      }
      applyTrack();
      setTier("free");
      setBanner(
        switchingTrack && state.tier === "free"
          ? `Your Free plan now covers ${VEHICLE_CLASS_LABEL[track]}.`
          : "You're now on the Free plan.",
      );
      return;
    }
    setBusy(plan.id);
    trackEvent("checkout_started", { plan: plan.id, cycle, track });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: plan.id, track, cycle }),
      });
      const data = await res.json().catch(() => ({}) as { url?: string; demo?: boolean });
      if (res.ok && data.url) {
        applyTrack();
        window.location.href = data.url;
        return;
      }
      // Local unlock exists ONLY in the pure demo build (no accounts, no
      // billing backend). Anywhere else, a failed checkout is a failure —
      // tier is granted exclusively by the Paystack webhook.
      if (data.demo && !isSupabaseConfigured) {
        applyTrack();
        setTier(plan.id);
        setBanner(`You're now on ${plan.name} — ${VEHICLE_CLASS_LABEL[track]}. (Demo — no charge was made.)`);
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

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Billing & plan" description="Manage your subscription." />

      {banner && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-success/30 bg-success/[0.08] px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" /> {banner}
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
            className="text-xs font-medium text-primary hover:underline"
            onClick={async () => {
              const tier = await refreshAccount().catch(() => null);
              setBanner(
                tier && tier !== "free"
                  ? `Plan status refreshed — you're on ${PLAN_MAP[tier].name}.`
                  : "Plan status refreshed — no active paid plan found yet.",
              );
            }}
          >
            Refresh plan status
          </button>
        </div>
      )}

      {/* Subscription track — decides which licence codes you can study. */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Track</span>
          <div className="inline-flex rounded-full bg-muted/60 p-[5px] shadow-[inset_0_0_0_1px_hsl(0_0%_100%/0.07)]">
            {(["car", "bike_heavy"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTrack(t)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                  track === t
                    ? "bg-card text-foreground shadow-[0_4px_12px_-6px_hsl(var(--shadow)/0.6)]"
                    : "text-muted-foreground",
                )}
              >
                {VEHICLE_CLASS_SHORT[t]}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{VEHICLE_CLASS_LABEL[track]}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          A plan covers one track only. Switching track moves your subscription and study
          content to the other vehicle class — it doesn&apos;t add it.
        </p>

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
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
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

        {isSupabaseConfigured && state.tier !== "free" && !confirmingCancel && (
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setConfirmingCancel(true)}>
              Cancel plan
            </Button>
            <span className="ml-2.5 align-middle text-xs text-muted-foreground">
              To change card details, cancel and resubscribe with the new card.
            </span>
          </div>
        )}
        {confirmingCancel && (
          <div className="mt-4 rounded-lg border border-warning/30 bg-warning/[0.08] p-4">
            <p className="text-sm font-medium text-foreground">Cancel your plan?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              You&apos;ll drop to Free immediately — your progress, streak and readiness all carry over.
              If you&apos;re within 7 days of your first payment, we&apos;ll refund it in full automatically.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="danger" onClick={doCancel} disabled={cancelBusy}>
                {cancelBusy ? "Cancelling…" : "Yes, cancel"}
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
          // A plan is only "current" on the track it was bought for — the
          // same tier on the other track is a switch, not something owned.
          const onTrack = state.vehicleClass === null || state.vehicleClass === track;
          const current = plan.id === state.tier && onTrack;
          const isTrackSwitch = plan.id === state.tier && !onTrack;
          return (
            <Card
              key={plan.id}
              className={cn("flex flex-col p-6", plan.highlighted && !current && "border-primary ring-1 ring-primary")}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                {current && (
                  <Badge variant="success">
                    {state.vehicleClass ? `Current · ${VEHICLE_CLASS_SHORT[state.vehicleClass]}` : "Current"}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-2xl font-semibold">
                  {isFreePlan(plan)
                    ? "Free"
                    : formatZar(cycle === "annual" ? annualMonthlyPrice(plan, track) : monthlyPrice(plan, track))}
                </span>
                {!isFreePlan(plan) && <span className="text-sm text-muted-foreground">/month</span>}
              </div>
              {!isFreePlan(plan) && cycle === "annual" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatZar(annualPrice(plan, track))} billed once a year
                </p>
              )}

              <Button
                className="mt-5 w-full"
                variant={current ? "outline" : plan.highlighted ? "default" : "outline"}
                disabled={current || busy !== null}
                onClick={() => choose(plan)}
              >
                {busy === plan.id ? (
                  <Spinner />
                ) : current ? (
                  "Current plan"
                ) : isTrackSwitch ? (
                  `Switch to ${VEHICLE_CLASS_SHORT[track]}`
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
