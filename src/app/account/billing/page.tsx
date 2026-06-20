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
import { PLANS } from "@/lib/billing/plans";
import { cn, formatZar } from "@/lib/utils";
import type { SubscriptionTier } from "@/types";

function BillingInner() {
  const sp = useSearchParams();
  const { state, setTier } = useStudyStore();
  const [banner, setBanner] = React.useState<string | null>(
    sp.get("status") === "success" ? "Payment complete — your plan is active." : null,
  );
  const [busy, setBusy] = React.useState<SubscriptionTier | null>(null);

  async function choose(plan: (typeof PLANS)[number]) {
    if (plan.id === state.tier) return;
    if (plan.id === "free") {
      setTier("free");
      setBanner("You're now on the Free plan.");
      return;
    }
    setBusy(plan.id);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: plan.id }),
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
      setBanner(`You're now on ${plan.name}. (Demo — no charge was made.)`);
    } catch {
      setTier(plan.id);
      setBanner(`You're now on ${plan.name}. (Demo — no charge was made.)`);
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
                  {plan.priceMonthly === 0 ? "Free" : formatZar(plan.priceMonthly)}
                </span>
                {plan.priceMonthly > 0 && <span className="text-sm text-muted-foreground">/month</span>}
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
