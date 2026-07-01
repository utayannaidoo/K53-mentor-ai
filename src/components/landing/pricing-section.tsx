"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import {
  PLANS,
  monthlyPrice,
  annualMonthlyPrice,
  isFreePlan,
  VEHICLE_CLASS_LABEL,
  type VehicleClass,
} from "@/lib/billing/plans";
import { cn, formatZar } from "@/lib/utils";

export function PricingSection({
  withHeading = true,
  className,
}: {
  withHeading?: boolean;
  className?: string;
}) {
  const [annual, setAnnual] = React.useState(false);
  const [vc, setVc] = React.useState<VehicleClass>("car");

  return (
    <section
      id="pricing"
      className={cn("mx-auto max-w-[1120px] scroll-mt-20 px-6 py-16", className)}
    >
      {withHeading && (
        <div className="mx-auto mb-8 max-w-[600px] text-center">
          <span className="text-[13px] font-medium uppercase tracking-[0.12em] text-primary">
            Pricing
          </span>
          <h2 className="mt-3 text-balance font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
            Start free. Upgrade when you&apos;re hooked.
          </h2>
        </div>
      )}

      {/* Toggles: vehicle class + billing cadence */}
      <div className="mt-2 flex flex-col items-center gap-3">
        {/* Vehicle-class toggle — the price depends on which licence you're after */}
        <div className="relative inline-grid grid-cols-2 items-center rounded-full bg-muted/60 p-[5px] shadow-[inset_0_0_0_1px_hsl(0_0%_100%/0.07)]">
          <span
            aria-hidden
            className="absolute left-[5px] top-[5px] z-0 h-[calc(100%-10px)] w-[calc(50%-5px)] rounded-full bg-card/95 shadow-[0_4px_12px_-6px_hsl(var(--shadow)/0.6)] transition-transform duration-[450ms] ease-spring"
            style={{ transform: vc === "bike_heavy" ? "translateX(100%)" : "translateX(0)" }}
          />
          <button
            type="button"
            onClick={() => setVc("car")}
            className="relative z-10 w-full whitespace-nowrap rounded-full px-[22px] py-[9px] text-center text-sm font-semibold text-foreground"
          >
            Car
          </button>
          <button
            type="button"
            onClick={() => setVc("bike_heavy")}
            className="relative z-10 w-full whitespace-nowrap rounded-full px-[22px] py-[9px] text-center text-sm font-semibold text-foreground"
          >
            Bike &amp; Heavy
          </button>
        </div>

        {/* Sliding monthly / annual toggle */}
        <div className="relative inline-grid grid-cols-2 items-center rounded-full bg-muted/60 p-[5px] shadow-[inset_0_0_0_1px_hsl(0_0%_100%/0.07)]">
          <span
            aria-hidden
            className="absolute left-[5px] top-[5px] z-0 h-[calc(100%-10px)] w-[calc(50%-5px)] rounded-full bg-card/95 shadow-[0_4px_12px_-6px_hsl(var(--shadow)/0.6)] transition-transform duration-[450ms] ease-spring"
            style={{ transform: annual ? "translateX(100%)" : "translateX(0)" }}
          />
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className="relative z-10 w-full whitespace-nowrap rounded-full px-[22px] py-[9px] text-center text-sm font-semibold text-foreground"
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className="relative z-10 w-full whitespace-nowrap rounded-full px-[22px] py-[9px] text-center text-sm font-semibold text-foreground"
          >
            Annual <span className="text-[11px] text-success">save R20/mo</span>
          </button>
        </div>

        <p className="text-xs text-muted-foreground">{VEHICLE_CLASS_LABEL[vc]}</p>
      </div>

      <div className="mt-9 grid items-start gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(270px,1fr))]">
        {PLANS.map((plan) => {
          const isFree = isFreePlan(plan);
          const monthlyEquivalent = annual ? annualMonthlyPrice(plan, vc) : monthlyPrice(plan, vc);
          const cta = isFree
            ? "Start free"
            : plan.name === "Premium"
              ? "Go Premium"
              : `Go ${plan.name}`;

          return (
            <div
              key={plan.id}
              className={cn(
                "glass-2 relative rounded-[20px] p-7",
                plan.highlighted &&
                  "shadow-[inset_0_1px_0_hsl(0_0%_100%/0.5),inset_0_0_0_1.5px_hsl(var(--primary)/0.5),0_30px_70px_-36px_hsl(var(--primary)/0.5)]",
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b from-primary-light to-primary px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-white shadow-[0_8px_18px_-8px_hsl(var(--primary)/0.8)]">
                  Most popular
                </span>
              )}

              <h3 className="font-display text-[18px] font-semibold">{plan.name}</h3>
              <p className="mt-1.5 text-[0.88rem] text-muted-foreground">{plan.tagline}</p>

              <div className="mt-[18px] flex items-baseline gap-1">
                <span className="font-mono text-[40px] font-semibold leading-none tracking-[-0.03em]">
                  {isFree ? "R0" : formatZar(monthlyEquivalent)}
                </span>
                <span className="text-[0.9rem] text-muted-foreground">{isFree ? "forever" : "/mo"}</span>
              </div>
              <div className="mt-1 h-3.5 text-[0.78rem] text-muted-foreground">
                {isFree ? "No card needed" : annual ? "billed yearly" : "billed monthly"}
              </div>

              <Link
                href={isFree ? "/onboarding" : "/account/billing"}
                className={cn(
                  "mt-5 flex w-full items-center justify-center rounded-xl py-[13px] text-[15px] font-semibold transition-[transform,filter] duration-[400ms] ease-spring hover:brightness-[1.06] active:scale-[0.97]",
                  plan.highlighted
                    ? "bg-gradient-to-b from-primary-light to-primary text-white shadow-[inset_0_1px_0_hsl(0_0%_100%/0.45),0_12px_26px_-12px_hsl(var(--primary)/0.7)]"
                    : "bg-muted/70 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--border))]",
                )}
              >
                {cta}
              </Link>

              <div className="mt-[22px] flex flex-col gap-[11px]">
                {plan.perks.map((perk) => (
                  <div key={perk} className="flex items-start gap-2.5 text-[0.9rem] leading-[1.4]">
                    <Check
                      className="mt-0.5 h-[17px] w-[17px] shrink-0 text-success"
                      strokeWidth={2.6}
                    />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
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
