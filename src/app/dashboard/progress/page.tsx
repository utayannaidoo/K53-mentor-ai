"use client";

import * as React from "react";
import Link from "next/link";
import { Flame, Clock, Target, CheckCircle2, Award, Lock, FileText, Sparkles, Zap } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { RoadProgress } from "@/components/engagement/road-progress";
import { MasteryMap } from "@/components/engagement/mastery-map";
import { DrivingPassport } from "@/components/engagement/driving-passport";
import { ShareCard } from "@/components/engagement/share-card";
import { buttonVariants } from "@/components/ui/button";
import { useStudyStore } from "@/hooks/use-study-store";
import { categoryName } from "@/lib/content/categories";
import { bestStudyTime, mostImproved } from "@/lib/insights";
import { hasFeature, PLAN_MAP } from "@/lib/billing/plans";
import { formatDuration, formatDate, cn, glass, glassSubtle } from "@/lib/utils";
import type { CategoryId } from "@/types";

export default function ProgressPage() {
  const { state, readiness } = useStudyStore();

  const totalSeconds = state.sessions.reduce((s, x) => s + x.durationSeconds, 0);
  const answered = state.attempts.length;
  const correct = state.attempts.filter((a) => a.correct).length;
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
  const advanced = hasFeature(state.tier, "advancedAnalytics");

  // Free plan sees the last 7 days; the older history stays visible as a
  // blurred teaser rather than silently vanishing.
  const fullHistory = PLAN_MAP[state.tier].limits.progressHistory === "full";
  const cutoffKey = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  })();
  const visibleHistory = fullHistory
    ? state.readinessHistory
    : state.readinessHistory.filter((h) => h.date >= cutoffKey);
  const hiddenPoints = state.readinessHistory.length - visibleHistory.length;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Progress" description="Your readiness, mastery and study habits over time." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={<Target className="h-4 w-4" />} label="Readiness" value={`${readiness.readiness}%`} tone="text-primary" />
        <StatTile icon={<CheckCircle2 className="h-4 w-4" />} label="Accuracy" value={`${accuracy}%`} />
        <StatTile icon={<Flame className="h-4 w-4" />} label="Current streak" value={`${state.streak.current}d`} />
        <StatTile icon={<Award className="h-4 w-4" />} label="Longest streak" value={`${state.streak.longest}d`} />
        <StatTile icon={<Clock className="h-4 w-4" />} label="Time studied" value={formatDuration(totalSeconds)} />
        <StatTile icon={<Target className="h-4 w-4" />} label="Questions" value={`${answered}`} />
        <StatTile icon={<Sparkles className="h-4 w-4" />} label="Predicted pass" value={`${readiness.passProbability}%`} tone="text-success" />
        <StatTile icon={<Zap className="h-4 w-4" />} label="Confidence Points" value={`${state.cp}`} tone="text-primary" />
      </div>

      <RoadProgress
        className="mt-5"
        rankAchieved={state.rankAchieved}
        inputs={{
          cp: state.cp,
          readiness: readiness.readiness,
          hasPassedMock: state.mockExams.some((m) => m.passed && !m.mini),
        }}
      />

      <Card className={cn(glass, "mt-5 p-6")}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Readiness over time</h2>
          {!fullHistory && (
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" /> Last 7 days on Free
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <TrendChart data={visibleHistory} height={200} />
        </div>
        {!fullHistory && hiddenPoints > 0 && (
          <div className="relative mt-4 overflow-hidden rounded-lg border border-border/60">
            <div className="pointer-events-none select-none blur-[5px]" aria-hidden>
              <TrendChart data={state.readinessHistory} height={90} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-background/40">
              <Link
                href="/account/billing"
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm hover:underline"
              >
                <Lock className="h-3 w-3" /> See your full history with Premium
              </Link>
            </div>
          </div>
        )}
      </Card>

      <Card className={cn(glass, "mt-5 p-6")}>
        <h2 className="font-display text-lg font-semibold">Mastery Map</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Rings track sustained mastery, not one good quiz. 90%+ stamps the category.
        </p>
        <div className="mt-5">
          <MasteryMap perCategory={readiness.perCategory} />
        </div>
      </Card>

      <div className="mt-5">
        <DrivingPassport perCategory={readiness.perCategory} />
      </div>

      {/* Shareable progress card — the WhatsApp brag surface */}
      <Card className={cn(glass, "mt-5 p-6")}>
        <h2 className="font-display text-lg font-semibold">Share your progress</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Send your card to the group chat — a study buddy makes the streak easier to keep.
        </p>
        <div className="mt-4 max-w-xl">
          <ShareCard />
        </div>
      </Card>

      <Card className={cn(glass, "mt-5 p-6")}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Mock exam history</h2>
          <Link href="/study/mock-exam" className="text-xs font-medium text-primary hover:underline">
            Take a mock
          </Link>
        </div>
        {state.mockExams.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={<FileText className="h-6 w-6" />}
              title="No mock exams yet"
              description="A full 64-question mock is the best test of real readiness — it mirrors the actual K53 paper."
              action={
                <Link href="/study/mock-exam" className={cn(buttonVariants())}>
                  Take your first mock
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
            {[...state.mockExams].reverse().map((m) => (
              <li key={m.id} className="flex items-center justify-between bg-background/30 px-4 py-3 transition-colors hover:bg-muted/40">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {m.score}/{m.total}
                      {m.mini && <span className="ml-1.5 text-2xs font-normal text-muted-foreground">Mini</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(m.at)}</p>
                  </div>
                </div>
                <Badge variant={m.passed ? "success" : "warning"}>{m.passed ? "Passed" : "Not yet"}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Advanced analytics — Premium Plus */}
      <Card className={cn(glass, "mt-5 overflow-hidden p-6")}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Advanced analytics</h2>
          {!advanced && <Badge variant="secondary" className="gap-1"><Lock className="h-3 w-3" /> Premium Plus</Badge>}
        </div>
        {advanced ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-3 text-sm">
            <Insight
              label="Most improved"
              value={(() => {
                const m = mostImproved(state.attempts);
                return m ? `${categoryName(m.categoryId)} +${m.delta}%` : "Not enough data yet";
              })()}
            />
            <Insight
              label="Sharpest time of day"
              value={(() => {
                const t = bestStudyTime(state.attempts);
                return t ? `${t.label} · ${t.accuracy}%` : "Not enough data yet";
              })()}
            />
            <Insight label="Avg. session" value={state.sessions.length ? formatDuration(totalSeconds / state.sessions.length) : "—"} />
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-md text-sm text-muted-foreground">
              Improvement trends, time-of-day study patterns and per-category velocity. Unlock with
              Premium Plus.
            </p>
            <Link href="/account/billing" className={cn(buttonVariants({ variant: "outline" }))}>
              Upgrade
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <Card className={cn(glassSubtle, "p-4")}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <p className={cn("tabular mt-1 font-mono text-2xl font-semibold", tone)}>{value}</p>
    </Card>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}
