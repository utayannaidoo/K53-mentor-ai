"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, Check, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PLAN_MAP } from "@/lib/billing/plans";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const DEFAULT_BENEFITS = [
  "3 full study sessions every day",
  "Full mock exams + scenario practice",
  "AI tutor whenever you're stuck",
  "Personalised daily plan to test day",
];

/**
 * The upgrade moment, framed in the product's own world: the header is a
 * road-sign plate (route-green, thin white keyline — like a real SA
 * regulatory sign) telling you what's beyond this point.
 */
export function Paywall({
  title,
  description,
  cta = "Unlock with Premium",
  href = "/account/billing",
  icon,
  feature,
  benefits = DEFAULT_BENEFITS,
  className,
}: {
  title: string;
  description: string;
  cta?: string;
  href?: string;
  icon?: React.ReactNode;
  /** Which feature hit its limit — makes paywall funnels comparable in analytics. */
  feature?: string;
  benefits?: string[];
  className?: string;
}) {
  React.useEffect(() => {
    track("paywall_viewed", { feature: feature ?? "unknown" });
  }, [feature]);

  const fromPrice = Math.min(...Object.values(PLAN_MAP.premium.monthly));

  return (
    <Card className={cn("mx-auto max-w-md overflow-hidden p-0", className)}>
      {/* Soft-tinted header in the app's own glass language. */}
      <div className="border-b border-border/60 bg-primary/[0.07] px-6 py-7 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon ?? <Lock className="h-5 w-5" />}
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>

      <div className="p-6">
        <p className="text-sm text-muted-foreground">{description}</p>

        <ul className="mt-4 space-y-2">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {b}
            </li>
          ))}
        </ul>

        <Link
          href={href}
          onClick={() => track("paywall_cta_clicked", { feature: feature ?? "unknown" })}
          className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full gap-2")}
        >
          <Sparkles className="h-4 w-4" /> {cta}
        </Link>
        <p className="mt-2.5 text-center text-xs text-muted-foreground">
          From R{fromPrice}/month — less than one failed test booking.{" "}
          <Link href="/account/billing" className="text-primary hover:underline">
            Compare plans
          </Link>
        </p>
      </div>
    </Card>
  );
}
