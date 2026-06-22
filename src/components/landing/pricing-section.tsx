"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { PLANS, ANNUAL_DISCOUNT } from "@/lib/billing/plans";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn, formatZar } from "@/lib/utils";

export function PricingSection({
  withHeading = true,
  className,
}: {
  withHeading?: boolean;
  className?: string;
}) {
  const [annual, setAnnual] = React.useState(true);

  return (
    <section id="pricing" className={cn("container scroll-mt-20 py-16 lg:py-24", className)}>
      {withHeading && (
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Pricing</p>
          <h2 className="mt-2 text-balance font-display text-3xl font-semibold tracking-tight">
            Cheaper than failing the test once
          </h2>
          <p className="mt-4 text-muted-foreground">
            A re-test booking plus the wasted trip costs more than a month of Premium. Start free —
            upgrade only when you&apos;re ready.
          </p>
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-3">
        <span className={cn("text-sm", !annual && "font-semibold text-foreground", annual && "text-muted-foreground")}>
          Monthly
        </span>
        <Switch checked={annual} onChange={setAnnual} label="Annual billing" />
        <span className={cn("text-sm", annual && "font-semibold text-foreground", !annual && "text-muted-foreground")}>
          Annual <Badge variant="success" className="ml-1">Save ~35%</Badge>
        </span>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isFree = plan.id === "free";
          const price = annual ? plan.priceAnnual : plan.priceMonthly;
          const period = annual ? "/year" : "/month";
          const discount = ANNUAL_DISCOUNT(plan);
          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-xl border bg-card p-6 shadow-soft",
                plan.highlighted ? "border-primary ring-1 ring-primary" : "border-border",
              )}
            >
              {plan.highlighted && (
                <Badge variant="default" className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1 bg-primary text-primary-foreground">
                  <Sparkles className="h-3 w-3" /> Most popular
                </Badge>
              )}
              <div>
                <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
              </div>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-3xl font-semibold tracking-tight">
                  {isFree ? "Free" : formatZar(price)}
                </span>
                {!isFree && <span className="text-sm text-muted-foreground">{period}</span>}
              </div>
              {!isFree && annual && discount > 0 && (
                <p className="mt-1 text-xs text-success">
                  {formatZar(Math.round(plan.priceAnnual / 12))}/mo billed annually — save {discount}%
                </p>
              )}
              {!isFree && !annual && <p className="mt-1 text-xs text-muted-foreground">billed monthly</p>}

              <Link
                href={isFree ? "/onboarding" : "/account/billing"}
                className={cn(
                  buttonVariants({ variant: plan.highlighted ? "default" : "outline" }),
                  "mt-6 w-full",
                )}
              >
                {isFree ? "Start free" : `Choose ${plan.name}`}
              </Link>

              <ul className="mt-6 space-y-2.5">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="text-foreground">{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mx-auto mt-8 max-w-xl text-center text-xs text-muted-foreground">
        Prices in ZAR. Billing is payment-ready (Stripe) but not charged in this demo — choosing a
        paid plan simply unlocks the features so you can try them.
      </p>
    </section>
  );
}
