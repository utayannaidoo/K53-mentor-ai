"use client";

import Link from "next/link";
import { Layers, HelpCircle, Route, FileText, MessageSquareText, ArrowRight, Lock } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MasteryBar } from "@/components/ui/mastery-bar";
import { CategoryIcon } from "@/components/shared/category-icon";
import { useStudyStore } from "@/hooks/use-study-store";
import { countDueFlashcards } from "@/lib/plan";
import { hasFeature } from "@/lib/billing/plans";
import { CATEGORIES, categoryName } from "@/lib/content/categories";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/types";

export default function StudyHubPage() {
  const { state, readiness } = useStudyStore();
  const due = countDueFlashcards(state);
  const scenariosUnlocked = hasFeature(state.tier, "scenarios");

  const modes = [
    {
      href: "/study/flashcards",
      icon: Layers,
      title: "Flashcards",
      desc: due > 0 ? `${due} due now` : "Spaced-repetition review",
      tone: "text-primary",
    },
    { href: "/study/questions", icon: HelpCircle, title: "Practice questions", desc: "Drill by category", tone: "text-primary" },
    { href: "/study/scenarios", icon: Route, title: "Scenarios", desc: "Real-world judgement", tone: "text-accent", locked: !scenariosUnlocked },
    { href: "/study/mock-exam", icon: FileText, title: "Mock exam", desc: "Full 68-question test", tone: "text-primary" },
    { href: "/tutor", icon: MessageSquareText, title: "AI Tutor", desc: "Ask anything, get explained", tone: "text-primary" },
  ];

  const ranked = (Object.keys(readiness.perCategory) as CategoryId[]).sort(
    (a, b) => readiness.perCategory[a] - readiness.perCategory[b],
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Study" description="Pick how you want to study today." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modes.map((m) => (
          <Link key={m.href} href={m.href} className="group">
            <Card className="flex h-full items-start gap-4 p-5 transition-shadow hover:shadow-soft-lg">
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

      <Card className="mt-6 p-6">
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
