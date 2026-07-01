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
  monthlyPrice,
  isFreePlan,
  vehicleClass as classOfCode,
  VEHICLE_CLASS_LABEL,
  VEHICLE_CLASS_SHORT,
} from "@/lib/billing/plans";
import { cn, formatZar } from "@/lib/utils";
import type { SubscriptionTier, VehicleClass } from "@/types";

function BillingInner() {
  const sp = useSearchParams();
  const { state, setTier, setVehicleClass, updateOnboarding } = useStudyStore();
  const [banner, setBanner] = React.useState<string | null>(
    sp.get("status") === "success" ? "Payment complete — your plan is active." : null,
  );
  const [busy, setBusy] = React.useState<SubscriptionTier | null>(null);
  // The track (car vs bike+heavy) is chosen here — it sets which codes the
  // learner can study and drives the per-class price. A plan covers exactly
  // one track; the other track's plans are a switch, never included.
  const [track, setTrack] = React.useState<VehicleClass>(state.vehicleClass ?? "car");

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
    applyTrack();
    if (plan.id === "free") {
      setTier("free");
      setBanner(
        switchingTrack && state.tier === "free"
          ? `Your Free plan now covers ${VEHICLE_CLASS_LABEL[track]}.`
          : "You're now on the Free plan.",
      );
      return;
    }
    setBusy(plan.id);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: plan.id, track }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
      // Demo mode (Stripe not configured) — unlock locally.
      setTier(plan.id);
      setBanner(`You're now on ${plan.name} — ${VEHICLE_CLASS_LABEL[track]}. (Demo — no charge was made.)`);
    } catch {
      setTier(plan.id);
      setBanner(`You're now on ${plan.name} — ${VEHICLE_CLASS_LABEL[track]}. (Demo — no charge was made.)`);
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
                  {isFreePlan(plan) ? "Free" : formatZar(monthlyPrice(plan, track))}
                </span>
                {!isFreePlan(plan) && <span className="text-sm text-muted-foreground">/month</span>}
              </div>

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
        Payments are powered by Stripe (payment-ready, not charged in this demo). Choosing a paid
        plan unlocks its features immediately so you can try them.
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
