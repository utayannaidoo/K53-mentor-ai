"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { ReadinessCard } from "@/components/dashboard/readiness-card";
import { TodayPlan } from "@/components/dashboard/today-plan";
import { WeakAreas } from "@/components/dashboard/weak-areas";
import { AiRecommendation } from "@/components/dashboard/ai-recommendation";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { TestCountdown } from "@/components/dashboard/test-countdown";
import { useStudyStore } from "@/hooks/use-study-store";
import { generateTodayPlan, isTaskDone } from "@/lib/plan";
import { hasFeature } from "@/lib/billing/plans";
import { cn, glass } from "@/lib/utils";
import type { CategoryId } from "@/types";

export default function DashboardPage() {
  const { state, readiness, hasDiagnostic } = useStudyStore();

  const tasks = generateTodayPlan(state, readiness);
  const doneMap = Object.fromEntries(tasks.map((t) => [t.id, isTaskDone(t, state)]));

  const weakest = readiness.weakCategories[0] ?? null;
  const missCount = weakest
    ? state.attempts.filter((a) => a.categoryId === weakest && !a.correct).length
    : 0;

  const delta = weekDelta(state.readinessHistory, readiness.readiness);
  const firstName = state.profile?.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's exactly what to study today."
      />

      <TestCountdown onboarding={state.onboarding} />

      {!hasDiagnostic && (
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

      <div className="grid gap-5 lg:grid-cols-2">
        <ReadinessCard
          readiness={readiness.readiness}
          passProbability={readiness.passProbability}
          delta={delta}
        />
        <TodayPlan
          tasks={tasks}
          doneMap={doneMap}
          scenariosUnlocked={hasFeature(state.tier, "scenarios")}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <WeakAreas perCategory={readiness.perCategory} />
        <AiRecommendation category={weakest} missCount={missCount} />
      </div>

      <Card className={cn(glass, "mt-5 p-6")}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Readiness trend</h2>
          <Link href="/dashboard/progress" className="text-xs font-medium text-primary hover:underline">
            Detailed progress
          </Link>
        </div>
        <div className="mt-4">
          <TrendChart data={state.readinessHistory} />
        </div>
      </Card>
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
