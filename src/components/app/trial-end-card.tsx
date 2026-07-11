"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useStudyStore } from "@/hooks/use-study-store";
import { totalUsage } from "@/lib/store/local-store";
import { PLAN_MAP } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import type { UserState } from "@/types";

/** Whether the free once-off trial has been used up. */
export function trialExhausted(state: UserState): boolean {
  if (state.tier !== "free") return false;
  const used = totalUsage(state);
  const caps = PLAN_MAP.free.limits;
  return (
    (typeof caps.questions === "number" && used.questions >= caps.questions) ||
    (typeof caps.flashcards === "number" && used.flashcards >= caps.flashcards)
  );
}

/**
 * The conversion moment when the free trial runs out: not a generic paywall
 * but the learner's own numbers — where they stand, how long until their
 * test, and what Premium's daily volume does about the gap.
 */
export function TrialEndCard({ compact = false }: { compact?: boolean }) {
  const { state, readiness } = useStudyStore();
  const r = readiness.readiness;

  React.useEffect(() => {
    track("trial_end_shown", { compact, readiness: r });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const testDate = state.onboarding?.testDate;
  const daysToTest = testDate
    ? Math.max(0, Math.ceil((Date.parse(testDate) - Date.now()) / 86_400_000))
    : null;

  const situation =
    daysToTest !== null
      ? `You're at ${r}% readiness with your test in ${daysToTest} ${daysToTest === 1 ? "day" : "days"}.`
      : `You're at ${r}% readiness.`;
  const promise =
    r >= 80
      ? "Premium's daily mock exams and full scenario practice keep you sharp until test day."
      : "Learners who practise daily typically pass 80% readiness within two weeks — Premium gives you 3 full sessions a day and the AI plan that gets you there.";

  if (compact) {
    return (
      <Card className="mb-5 flex flex-wrap items-center justify-between gap-3 border-primary/25 bg-primary/[0.05] p-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Your free trial is done — {situation}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{promise}</p>
          </div>
        </div>
        <Link
          href="/account/billing"
          onClick={() => track("paywall_cta_clicked", { feature: "trial_end" })}
          className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
        >
          <Sparkles className="h-3.5 w-3.5" /> Keep studying
        </Link>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <TrendingUp className="h-6 w-6" />
      </div>
      <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">
        Your free trial is done
      </h2>
      <p className="mt-2 text-sm text-foreground">{situation}</p>
      <p className="mt-2 text-sm text-muted-foreground">{promise}</p>
      <Link
        href="/account/billing"
        onClick={() => track("paywall_cta_clicked", { feature: "trial_end" })}
        className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full gap-2")}
      >
        <Sparkles className="h-4 w-4" /> See plans
      </Link>
      <p className="mt-3 text-xs text-muted-foreground">
        Everything you&apos;ve done so far — progress, streak, readiness — carries over.
      </p>
    </Card>
  );
}
