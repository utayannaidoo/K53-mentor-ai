"use client";

import Link from "next/link";
import {
  Layers,
  HelpCircle,
  Route,
  FileText,
  Car,
  ArrowRight,
  Lock,
  Signpost,
  CheckCircle2,
  Circle,
  Zap,
  ScanLine,
  Timer,
} from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MasteryBar } from "@/components/ui/mastery-bar";
import { CategoryIcon } from "@/components/shared/category-icon";
import { useStudyStore } from "@/hooks/use-study-store";
import { countDueFlashcards, generateTodayPlan, isTaskDone, mocksRemaining } from "@/lib/plan";
import { PLAN_COMPLETE_CP } from "@/lib/engagement";
import { hasFeature } from "@/lib/billing/plans";
import { categoryName } from "@/lib/content/categories";
import { cn, glass } from "@/lib/utils";
import type { CategoryId } from "@/types";

export default function StudyHubPage() {
  const { state, readiness, usageFor } = useStudyStore();
  const due = countDueFlashcards(state);
  const scenariosUnlocked = hasFeature(state.tier, "scenarios");
  const scannerUnlocked = hasFeature(state.tier, "scanner");
  // A mode also locks once its allowance is spent (free pools are lifetime,
  // paid limits reset daily) — the lock tells the learner before they tap.
  const questionsLocked = !usageFor("questions").allowed;
  const flashcardsLocked = !usageFor("flashcards").allowed;
  const mockLocked = mocksRemaining(state, "full") <= 0;
  const miniLocked = mocksRemaining(state, "mini") <= 0;

  const missions = generateTodayPlan(state, readiness);
  const doneMap = Object.fromEntries(missions.map((t) => [t.id, isTaskDone(t, state)]));
  const doneCount = missions.filter((t) => doneMap[t.id]).length;

  const modes = [
    {
      href: "/study/flashcards",
      icon: Layers,
      title: "Flashcards",
      desc: due > 0 ? "Your review deck is ready" : "Spaced-repetition review",
      tone: "text-primary",
      locked: flashcardsLocked,
    },
    { href: "/study/questions", icon: HelpCircle, title: "Practice questions", desc: "Drill by category", tone: "text-primary", locked: questionsLocked },
    { href: "/study/scan", icon: ScanLine, title: "Sign scanner", desc: "Point your camera at any road sign", tone: "text-accent", locked: !scannerUnlocked },
    { href: "/study/signs", icon: Signpost, title: "Road signs", desc: "Browse every official sign", tone: "text-accent" },
    { href: "/study/scenarios", icon: Route, title: "Scenarios", desc: "Real-world judgement", tone: "text-accent", locked: !scenariosUnlocked },
    { href: "/study/mock-exam", icon: FileText, title: "Mock exam", desc: "Full 64-question test", tone: "text-primary", locked: mockLocked },
    { href: "/study/mock-exam?mode=mini", icon: Timer, title: "Mini mock", desc: "15 questions · 12 minutes", tone: "text-primary", locked: miniLocked },
    { href: "/study/controls", icon: Car, title: "Car controls", desc: "Know every control + how to drive off", tone: "text-primary" },
  ];

  const ranked = (Object.keys(readiness.perCategory) as CategoryId[]).sort(
    (a, b) => readiness.perCategory[a] - readiness.perCategory[b],
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Study" description="Your missions come first — free practice is always open." />

      {/* Today's missions — the directed path */}
      <Card className={cn(glass, "mb-6 p-6")}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Today&apos;s missions</h2>
          <span className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {doneCount}/{missions.length}
            </span>
            <Badge variant="default" className="gap-1 font-mono">
              <Zap className="h-3 w-3" /> +{PLAN_COMPLETE_CP} CP daily bonus
            </Badge>
          </span>
        </div>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-3">
          {missions.map((task) => {
            const done = doneMap[task.id];
            const locked = task.premium && !scenariosUnlocked;
            const href = locked ? "/account/billing" : task.href;
            return (
              <li key={task.id}>
                <Link
                  href={href}
                  className={cn(
                    "press flex h-full items-start gap-2.5 rounded-xl border border-border/50 bg-background/40 px-3 py-3 hover:border-primary/30 hover:bg-background/70",
                    done && "opacity-60",
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ) : locked ? (
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block truncate text-sm font-medium",
                        done ? "text-muted-foreground line-through" : "text-foreground",
                      )}
                    >
                      {task.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{task.subtitle}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      <h2 className="mb-4 font-display text-lg font-semibold">Free practice</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modes.map((m) => (
          <Link key={m.href} href={m.href} className="group">
            <Card className={cn(glass, "hover-elevate flex h-full items-start gap-4 p-5")}>
              <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted", m.tone)}>
                <m.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{m.title}</h3>
                  {m.locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{m.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Card>
          </Link>
        ))}
      </div>

      <Card className={cn(glass, "mt-6 p-6")}>
        <h2 className="font-display text-lg font-semibold">Study by category</h2>
        <p className="mt-1 text-sm text-muted-foreground">Weakest first — tap any to drill it.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {ranked.map((cat) => (
            <Link key={cat} href={`/study/questions?category=${cat}`} className="group block">
              <MasteryBar
                label={<span className="group-hover:text-primary">{categoryName(cat)}</span>}
                value={readiness.perCategory[cat]}
                icon={<CategoryIcon id={cat} className="h-4 w-4 text-muted-foreground" />}
              />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
