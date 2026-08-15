"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ReadinessCard } from "@/components/dashboard/readiness-card";
import { CoachPlan } from "@/components/dashboard/coach-plan";
import { ComebackCard } from "@/components/dashboard/comeback-card";
import { TodayHero } from "@/components/dashboard/today-hero";
import { TrialEndCard, trialExhausted } from "@/components/app/trial-end-card";
import { RoadProgress } from "@/components/engagement/road-progress";
import { MasteryRail } from "@/components/dashboard/mastery-rail";
import { ReadinessChartCard } from "@/components/dashboard/readiness-chart-card";
import { TestCountdown } from "@/components/dashboard/test-countdown";
import { Reveal } from "@/components/shared/reveal";
import { useStudyStore } from "@/hooks/use-study-store";
import { countDueFlashcards, generateTodayPlan, isTaskDone, planFocus } from "@/lib/plan";
import { blockingSection } from "@/lib/diagnostic/scoring";
import { isCramWindow, daysUntilTest } from "@/lib/learning/cram";
import { openMistakes } from "@/lib/learning/mistakes";
import { categoryName } from "@/lib/content/categories";
import { CODE_LABEL, hasFeature, PLAN_MAP, studyCodeOf } from "@/lib/billing/plans";
import { topAlert } from "@/lib/dashboard/alerts";
import { cn, daysUntil } from "@/lib/utils";

/**
 * Today.
 *
 * Read top to bottom this answers three questions in order, and the layout is
 * that order: **where am I** (the hero), **what do I do now** (the plan), and
 * **how is it going** (progress). It used to be ten full-width cards of equal
 * weight stacked as siblings, which answered them in roughly the reverse order
 * and gave the eye nothing to land on first.
 *
 * Two structural rules hold it together:
 *
 *  - **One interruption, never five.** The countdown, comeback, cram, trial and
 *    diagnostic banners each used to decide independently whether they applied,
 *    and several could be true at once. `topAlert` ranks them; the page renders
 *    the winner. See lib/dashboard/alerts.ts.
 *  - **A main column and a rail.** The plan is the work and gets the width; the
 *    numbers that give context sit beside it rather than a scroll below it.
 */
export default function DashboardPage() {
  const { state, readiness, hasDiagnostic } = useStudyStore();

  const tasks = generateTodayPlan(state, readiness);
  const doneMap = Object.fromEntries(tasks.map((t) => [t.id, isTaskDone(t, state)]));
  const nextTask = tasks.find((t) => !doneMap[t.id]) ?? null;
  const doneCount = tasks.filter((t) => doneMap[t.id]).length;
  const planDonePct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const focus = planFocus(state, readiness);
  const rationaleInput = {
    firstName: state.profile?.name?.split(" ")[0],
    weakestCategory: focus.categoryId ? categoryName(focus.categoryId) : undefined,
    weakestPct:
      focus.categoryId && !focus.fromWorry ? readiness.perCategory[focus.categoryId] : undefined,
    fromWorry: focus.fromWorry,
    dueCards: countDueFlashcards(state),
    daysToTest: daysUntil(state.onboarding?.testDate ?? null),
    streak: state.streak.current,
  };

  const delta = weekDelta(state.readinessHistory, readiness.readiness);
  const firstName = state.profile?.name?.split(" ")[0] ?? "there";
  const mistakes = openMistakes(state);

  const alert = topAlert({
    cram: isCramWindow(state) && mistakes.length > 0,
    "trial-ended": trialExhausted(state),
    diagnostic: !hasDiagnostic,
    comeback: state.pendingComeback !== null,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <TodayHero
        firstName={firstName}
        vehicleLabel={CODE_LABEL[studyCodeOf(state)]}
        readiness={readiness.readiness}
        passProbability={readiness.passProbability}
        delta={delta}
        streak={state.streak.current}
        cp={state.cp}
        daysToTest={daysUntil(state.onboarding?.testDate ?? null)}
        planDonePct={planDonePct}
        nextTask={nextTask}
      />

      {/* Exactly one of these, chosen by urgency. */}
      {alert === "cram" && (
        <Card className="mb-5 flex flex-wrap items-center justify-between gap-4 border-warning/30 bg-warning/[0.06] p-5">
          <div className="flex items-start gap-3">
            <Flame className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <p className="font-medium text-foreground">
                {daysUntilTest(state) === 0
                  ? "Your test is today"
                  : daysUntilTest(state) === 1
                    ? "Your test is tomorrow"
                    : `Your test is in ${daysUntilTest(state)} days`}
              </p>
              <p className="text-sm text-muted-foreground">
                Skip the new material. {mistakes.length} questions are still tripping you up —
                signs and rules first, since they carry the most marks.
              </p>
            </div>
          </div>
          <Link href="/study/questions?mode=cram" className={cn(buttonVariants())}>
            Drill my mistakes <ArrowRight />
          </Link>
        </Card>
      )}

      {alert === "trial-ended" && <TrialEndCard compact />}

      {alert === "diagnostic" && (
        <Card className="mb-5 flex flex-wrap items-center justify-between gap-4 border-primary/20 bg-primary/[0.04] p-5">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Take your diagnostic</p>
              <p className="text-sm text-muted-foreground">
                It personalises your whole plan and readiness score.
              </p>
            </div>
          </div>
          <Link href="/diagnostic" className={cn(buttonVariants())}>
            Start diagnostic <ArrowRight />
          </Link>
        </Card>
      )}

      {alert === "comeback" && <ComebackCard />}

      {/* The work, and the context for it. `items-start` so the rail doesn't
          stretch to the plan's height and leave its cards floating in space. */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <Reveal className="min-w-0">
          <CoachPlan
            tasks={tasks}
            doneMap={doneMap}
            scenariosUnlocked={hasFeature(state.tier, "scenarios")}
            planLocked={!PLAN_MAP[state.tier].limits.studyPlan}
            rationaleInput={rationaleInput}
          />
        </Reveal>

        <div className="min-w-0 space-y-5">
          <Reveal delay={80}>
            <MasteryRail
              perCategory={readiness.perCategory}
              hasAttempts={state.attempts.length > 0}
            />
          </Reveal>
          <Reveal delay={160}>
            <ReadinessCard
              readiness={readiness.readiness}
              passProbability={readiness.passProbability}
              delta={delta}
              blocking={blockingSection(readiness.perCategory)}
            />
          </Reveal>
          {/* Dates belong with the context, not above the fold competing with
              the score — the hero already carries "days to test". */}
          <TestCountdown onboarding={state.onboarding} />
        </div>
      </div>

      {/* How it's going. */}
      <Reveal delay={80}>
        <RoadProgress
          compact
          className="mt-5"
          rankAchieved={state.rankAchieved}
          inputs={{
            cp: state.cp,
            readiness: readiness.readiness,
            hasPassedMock: state.mockExams.some((m) => m.passed && !m.mini && !m.drill),
          }}
        />
      </Reveal>

      <Reveal delay={160}>
        <ReadinessChartCard data={state.readinessHistory} current={readiness.readiness} />
      </Reveal>

    </div>
  );
}

function weekDelta(
  history: { date: string; readiness: number }[],
  current: number,
): number | null {
  if (history.length < 2) return null;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffKey = cutoff.toISOString().slice(0, 10);
  const within = history.filter((h) => h.date >= cutoffKey);
  const base = (within[0] ?? history[0]).readiness;
  return current - base;
}
