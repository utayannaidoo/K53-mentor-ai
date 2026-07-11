"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function Paywall({
  title,
  description,
  cta = "See plans",
  href = "/account/billing",
  icon,
  feature,
}: {
  title: string;
  description: string;
  cta?: string;
  href?: string;
  icon?: React.ReactNode;
  /** Which feature hit its limit — makes paywall funnels comparable in analytics. */
  feature?: string;
}) {
  React.useEffect(() => {
    track("paywall_viewed", { feature: feature ?? "unknown" });
  }, [feature]);

  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon ?? <Lock className="h-6 w-6" />}
      </div>
      <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <Link
        href={href}
        onClick={() => track("paywall_cta_clicked", { feature: feature ?? "unknown" })}
        className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full gap-2")}
      >
        <Sparkles className="h-4 w-4" /> {cta}
      </Link>
    </Card>
  );
}
