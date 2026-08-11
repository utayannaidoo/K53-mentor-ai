"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import {
  PLANS,
  monthlyPrice,
  annualMonthlyPrice,
  annualPrice,
  isFreePlan,
} from "@/lib/billing/plans";
import { cn, formatZar } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";

export function PricingSection({
  withHeading = true,
  className,
}: {
  withHeading?: boolean;
  className?: string;
}) {
  const [annual, setAnnual] = React.useState(false);

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

      {/* Billing cadence — one price covers every licence code */}
      <div className="mt-2 flex flex-col items-center gap-3">
        {/* Sliding monthly / annual toggle */}
        {/* A radiogroup, not two loose buttons — without the roles a screen
            reader gets no signal about which cadence is currently selected. */}
        <div
          role="radiogroup"
          aria-label="Billing cadence"
          className="relative inline-grid grid-cols-2 items-center rounded-full bg-muted/60 p-[5px] shadow-[inset_0_0_0_1px_hsl(0_0%_100%/0.07)]"
        >
          <span
            aria-hidden
            className="absolute left-[5px] top-[5px] z-0 h-[calc(100%-10px)] w-[calc(50%-5px)] rounded-full bg-card/95 shadow-[0_4px_12px_-6px_hsl(var(--shadow)/0.6)] transition-transform duration-[450ms] ease-spring"
            style={{ transform: annual ? "translateX(100%)" : "translateX(0)" }}
          />
          <button
            type="button"
            role="radio"
            aria-checked={!annual}
            onClick={() => setAnnual(false)}
            className="relative z-10 w-full whitespace-nowrap rounded-full px-[22px] py-[9px] text-center text-sm font-semibold text-foreground"
          >
            Monthly
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={annual}
            onClick={() => setAnnual(true)}
            className="relative z-10 w-full whitespace-nowrap rounded-full px-[22px] py-[9px] text-center text-sm font-semibold text-foreground"
          >
            Annual <span className="text-[11px] text-success">save R20/mo</span>
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Car, motorcycle and heavy codes — all included, switch any time.
        </p>
      </div>

      <div className="mt-9 grid items-start gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(270px,1fr))]">
        {PLANS.map((plan) => {
          const isFree = isFreePlan(plan);
          const monthlyEquivalent = annual ? annualMonthlyPrice(plan) : monthlyPrice(plan);
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
              {/* Name the amount that actually leaves their account. "R40/mo
                  billed yearly" without the R480 total is the kind of omission
                  that reads as a trick the moment the card is charged. */}
              {/* "billed monthly" describes the amount but not the commitment.
                  A recurring charge should say it recurs *before* the card is
                  entered, not first appear on the receipt. */}
              <div className="mt-1 text-[0.78rem] text-muted-foreground">
                {isFree
                  ? "No card needed"
                  : annual
                    ? `${formatZar(annualPrice(plan))} billed yearly, renews automatically`
                    : "Billed monthly, renews automatically"}
              </div>

              <Link
                href={
                  isFree
                    ? "/onboarding"
                    : `/signup?plan=${plan.id}&cycle=${annual ? "annual" : "monthly"}`
                }
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
        {isSupabaseConfigured ? (
          <>
            Prices in ZAR, billed securely through Paystack. Cancel anytime — with a{" "}
            <Link href="/refunds" className="underline hover:text-foreground">
              7-day money-back guarantee
            </Link>{" "}
            on your first payment.
          </>
        ) : (
          <>
            Prices in ZAR. Billing is payment-ready (Paystack) but not charged in this demo —
            choosing a paid plan simply unlocks the features so you can try them.
          </>
        )}
      </p>
    </section>
  );
}
