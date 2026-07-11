"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useStudyStore } from "@/hooks/use-study-store";
import {
  trialExhausted,
  poolRemaining,
  POOL_NOUN,
  POOL_HREF,
  type TrialPool,
} from "@/lib/billing/trial";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

export { trialExhausted, poolRemaining } from "@/lib/billing/trial";

/**
 * The conversion moment when the free trial runs out: not a generic paywall
 * but the learner's own numbers — where they stand, how long until their
 * test, and what Premium's daily volume does about the gap.
 */
export function TrialEndCard({
  compact = false,
  feature,
}: {
  compact?: boolean;
  /** Which pool just ran out. When other pools remain, the copy is honest
   * about it ("you still have flashcards left") instead of "trial is done". */
  feature?: TrialPool;
}) {
  const { state, readiness } = useStudyStore();
  const r = readiness.readiness;

  React.useEffect(() => {
    track("trial_end_shown", { compact, readiness: r, feature: feature ?? "all" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const testDate = state.onboarding?.testDate;
  const daysToTest = testDate
    ? Math.max(0, Math.ceil((Date.parse(testDate) - Date.now()) / 86_400_000))
    : null;

  const allDone = trialExhausted(state);
  const remainingPools = (["questions", "flashcards", "tutor"] as TrialPool[]).filter(
    (p) => p !== feature && poolRemaining(state, p) > 0,
  );
  const headline =
    allDone || !feature ? "Your free trial is done" : `You've used your free ${POOL_NOUN[feature]}`;
  const remainingLine =
    !allDone && remainingPools.length > 0
      ? `Still free to use: ${remainingPools
          .map((p) => `${poolRemaining(state, p)} ${POOL_NOUN[p]}`)
          .join(" and ")}.`
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
            <p className="text-sm font-semibold text-foreground">{headline} — {situation}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {remainingLine ? `${remainingLine} ` : ""}{promise}
            </p>
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
      <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">{headline}</h2>
      <p className="mt-2 text-sm text-foreground">{situation}</p>
      {remainingLine && (
        <p className="mt-2 text-sm font-medium text-primary">
          {remainingLine}{" "}
          {feature && remainingPools[0] && (
            <Link href={POOL_HREF[remainingPools[0]]} className="underline hover:no-underline">
              Keep going free
            </Link>
          )}
        </p>
      )}
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
