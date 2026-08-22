"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn, glassSubtle } from "@/lib/utils";

/**
 * The single recommended next activity after a session ends.
 *
 * One band, one action — it answers "what should I do now?" at the exact
 * moment the learner is deciding. It renders only when a rule has real data to
 * cite (see `src/lib/learning/next-step.ts`); a session with nothing to act on
 * shows nothing rather than a filler recommendation.
 */
export function NextStepCard({
  title,
  body,
  href,
  cta,
  className,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
  className?: string;
}) {
  return (
    <section
      aria-label="Recommended next step"
      className={cn(
        glassSubtle,
        "rounded-2xl border p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Target className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Recommended next
          </p>
          <h2 className="mt-1 font-display text-base font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-balance">{body}</p>
        </div>
      </div>
      <Link
        href={href}
        className={cn(buttonVariants(), "mt-4 w-full sm:w-auto")}
      >
        {cta} <ArrowRight />
      </Link>
    </section>
  );
}
