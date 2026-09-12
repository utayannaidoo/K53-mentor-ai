"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useStudyStore } from "@/hooks/use-study-store";
import {
  afterTrialCap,
  trialExhausted,
  trialDaysRemaining,
  poolRemaining,
  POOL_NOUN,
  POOL_HREF,
  type TrialPool,
} from "@/lib/billing/trial";
import { cn, daysUntil } from "@/lib/utils";
import { SECTION_LABEL, SECTION_OF, type ExamSection } from "@/lib/constants";
import type { ReadinessBreakdown } from "@/lib/diagnostic/scoring";
import type { CategoryId } from "@/types";
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
  const { state, readiness, hasDiagnostic } = useStudyStore();
  const r = readiness.readiness;

  React.useEffect(() => {
    track("trial_end_shown", {
      compact,
      readiness: hasDiagnostic ? r : "unmeasured",
      feature: feature ?? "all",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A date that has already passed is no countdown at all — clamping it to 0
  // used to sell the upgrade with "your test in 0 days" months after the test.
  const days = daysUntil(state.onboarding?.testDate ?? null);
  const daysToTest = days !== null && days >= 0 ? days : null;

  const allDone = trialExhausted(state);
  const daysLeft = trialDaysRemaining(state);
  const remainingPools = (["questions", "flashcards", "tutor"] as TrialPool[]).filter(
    (p) => p !== feature && poolRemaining(state, p) > 0,
  );
  const headline = allDone
    ? "Your free week is over"
    : feature
      ? `That's today's free ${POOL_NOUN[feature]}`
      : "Your free week";
  // Hitting a daily cap is no longer the end of anything — say so, or the
  // learner reads a temporary limit as a permanent wall and churns.
  const remainingLine =
    [
      remainingPools.length > 0
        ? `Still free today: ${remainingPools
            .map((p) => `${poolRemaining(state, p)} ${POOL_NOUN[p]}`)
            .join(" and ")}.`
        : null,
      allDone
        ? // The week ending is not the end of free study any more — say so, or
          // the learner reads "free week is over" as a locked door.
          `${afterTrialCap("questions")} questions and ${afterTrialCap("flashcards")} flashcards stay free every day.`
        : Number.isFinite(daysLeft)
          ? `Your allowance refills tomorrow — ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left of your free week.`
          : null,
    ]
      .filter(Boolean)
      .join(" ") || null;

  // Naming the section that would fail is more persuasive, and more useful,
  // than a bare readiness percentage.
  const weakest = hasDiagnostic ? weakestSection(readiness) : null;
  const situation = !hasDiagnostic
    ? "Your readiness has not been measured yet."
    : daysToTest !== null
      ? `You're at ${r}% readiness with your test in ${daysToTest} ${daysToTest === 1 ? "day" : "days"}.`
      : `You're at ${r}% readiness.`;
  const weakLine = weakest
    ? ` ${SECTION_LABEL[weakest]} is the section that would catch you out today.`
    : "";
  const promise =
    !hasDiagnostic
      ? "Take the starting check when you're ready; Premium keeps the full practice loop open every day."
      : r >= 80
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
              {weakLine ? `${weakLine.trim()} ` : ""}{remainingLine ? `${remainingLine} ` : ""}{promise}
            </p>
          </div>
        </div>
        <Link
          href="/account/billing"
          onClick={() => track("paywall_cta_clicked", { feature: "trial_end" })}
          // default over sm: this is THE conversion tap on a phone and 36px
          // failed touch-target minimums.
          className={cn(buttonVariants(), "gap-1.5")}
        >
          {/* Honest label: this goes to the plan picker, not back into a
              session — "Keep studying" sent cap-hitters to pricing and felt
              like a bait-and-switch. */}
          <Sparkles className="h-3.5 w-3.5" /> See plans
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
      <p className="mt-2 text-sm text-foreground">{situation}{weakLine}</p>
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

/**
 * The exam section furthest below par, weighted by how much evidence each
 * category actually has. A category nobody has answered is showing a prior,
 * not a measurement, so it can never name the weakness.
 */
function weakestSection(readiness: ReadinessBreakdown): ExamSection | null {
  const totals = new Map<ExamSection, { score: number; weight: number }>();
  for (const [cat, score] of Object.entries(readiness.perCategory) as [CategoryId, number][]) {
    const evidence = readiness.perCategoryEvidence[cat] ?? 0;
    if (evidence <= 0) continue;
    const section = SECTION_OF[cat];
    const acc = totals.get(section) ?? { score: 0, weight: 0 };
    acc.score += score * evidence;
    acc.weight += evidence;
    totals.set(section, acc);
  }
  let worst: { section: ExamSection; mean: number } | null = null;
  for (const [section, { score, weight }] of totals) {
    const mean = score / weight;
    if (!worst || mean < worst.mean) worst = { section, mean };
  }
  return worst?.section ?? null;
}
