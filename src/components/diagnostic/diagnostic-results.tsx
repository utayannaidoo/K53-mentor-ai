"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Sparkles, TrendingUp, Target } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ScoreRing } from "@/components/ui/score-ring";
import { MasteryBar } from "@/components/ui/mastery-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { CategoryIcon } from "@/components/shared/category-icon";
import { categoryName, CATEGORIES } from "@/lib/content/categories";
import { generateTodayPlan } from "@/lib/plan";
import { useStudyStore } from "@/hooks/use-study-store";

export function DiagnosticResults() {
  const router = useRouter();
  const { ready, state, isAuthed, readiness } = useStudyStore();
  const latest = state.diagnostics[state.diagnostics.length - 1];

  React.useEffect(() => {
    if (ready && !latest) router.replace("/diagnostic");
  }, [ready, latest, router]);

  if (!ready || !latest) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  const confidence = state.onboarding?.confidence ?? null;
  const feltScore = confidence !== null ? ((confidence - 1) / 4) * 100 : null;
  const contrast = buildContrast(feltScore, latest.readiness);
  const plan = generateTodayPlan(state, readiness);

  const strongest = latest.strongCategories[0];
  const focus = latest.weakCategories.slice(0, 2);

  return (
    <div className="min-h-dvh bg-background bg-app">
      <header className="flex items-center justify-between px-6 py-5">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-20">
        {/* Reward moment */}
        <div className="flex flex-col items-center text-center">
          <Badge variant="default" className="mb-4 gap-1">
            <Sparkles className="h-3 w-3" /> Your diagnostic is ready
          </Badge>
          <ScoreRing value={latest.readiness} size={208} label="Readiness" />
          <div className="mt-5 flex items-center gap-6">
            <Stat icon={<TrendingUp className="h-4 w-4" />} label="Predicted pass" value={`${latest.passProbability}%`} />
            <div className="h-8 w-px bg-border" />
            <Stat icon={<Target className="h-4 w-4" />} label="Scored" value={`${latest.correct}/${latest.total}`} />
          </div>
          {contrast && (
            <p className="mt-6 max-w-md text-balance text-muted-foreground">{contrast}</p>
          )}
        </div>

        {/* Focus areas (always visible) */}
        <Card className="mt-10 p-6">
          <h2 className="font-display text-lg font-semibold">Here&apos;s what to focus on</h2>
          {strongest && (
            <p className="mt-1 text-sm text-muted-foreground">
              You&apos;re strongest in{" "}
              <span className="font-medium text-success">{categoryName(strongest)}</span>. Let&apos;s
              fix the gaps below first.
            </p>
          )}
          <div className="mt-5 space-y-4">
            {focus.map((cat) => (
              <MasteryBar
                key={cat}
                label={categoryName(cat)}
                value={latest.perCategory[cat]?.score ?? 0}
                icon={<CategoryIcon id={cat} className="h-4 w-4 text-muted-foreground" />}
              />
            ))}
          </div>
        </Card>

        {/* Full breakdown + plan (gated until signup) */}
        <div className="relative mt-6">
          <div className={isAuthed ? "" : "pointer-events-none select-none blur-[6px]"}>
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold">Full category breakdown</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {CATEGORIES.map((cat) => (
                  <MasteryBar
                    key={cat.id}
                    label={cat.short}
                    value={latest.perCategory[cat.id]?.score ?? readiness.perCategory[cat.id]}
                    icon={<CategoryIcon id={cat.id} className="h-4 w-4 text-muted-foreground" />}
                  />
                ))}
              </div>
            </Card>

            <Card className="mt-6 p-6">
              <h2 className="font-display text-lg font-semibold">Your first study session</h2>
              <ul className="mt-4 space-y-3">
                {plan.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/40 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.subtitle}</p>
                    </div>
                    <span className="font-mono text-2xs text-muted-foreground">~{task.estMinutes} min</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {!isAuthed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Card className="mx-4 max-w-sm p-6 text-center shadow-soft-lg">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">Save your plan</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Create a free account to unlock your full breakdown, your personalised plan and
                  start studying.
                </p>
                <Button className="mt-5 w-full" size="lg" onClick={() => router.push("/signup")}>
                  Create my free account <ArrowRight />
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">No credit card required.</p>
              </Card>
            </div>
          )}
        </div>

        {isAuthed && (
          <Button size="xl" className="mt-8 w-full" onClick={() => router.push("/dashboard")}>
            Start my plan <ArrowRight />
          </Button>
        )}
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon} {label}
      </span>
      <span className="tabular mt-0.5 font-mono text-xl font-semibold">{value}</span>
    </div>
  );
}

function buildContrast(felt: number | null, readiness: number): string | null {
  if (felt === null) return null;
  if (readiness >= felt + 12)
    return "You felt unsure — but you actually know more than you think. Let's build on that.";
  if (felt >= readiness + 12)
    return "You felt fairly confident, and there are a few real gaps to close. Far better to find them now than on test day.";
  return "Your gut was about right. Now let's turn that into certainty.";
}
