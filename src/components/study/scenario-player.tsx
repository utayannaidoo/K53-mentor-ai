"use client";

import * as React from "react";
import Link from "next/link";
import { X, ArrowRight, CornerDownRight, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Paywall } from "@/components/app/paywall";
import { SignVisual } from "@/components/shared/sign-visual";
import { CategoryIcon } from "@/components/shared/category-icon";
import { useStudyStore } from "@/hooks/use-study-store";
import { hasFeature } from "@/lib/billing/plans";
import { SCENARIOS } from "@/lib/content/scenarios";
import { categoryName } from "@/lib/content/categories";
import { cn } from "@/lib/utils";

export function ScenarioPlayer() {
  const { state, recordScenarioAttempt, recordSession } = useStudyStore();
  const [queue] = React.useState(() => SCENARIOS);
  const startRef = React.useRef(Date.now());
  const [i, setI] = React.useState(0);
  const [chosenId, setChosenId] = React.useState<string | null>(null);
  const [correctCount, setCorrectCount] = React.useState(0);

  if (!hasFeature(state.tier, "scenarios")) {
    return (
      <div className="mx-auto max-w-md py-10">
        <Paywall
          title="Scenarios are a Premium feature"
          description="Branching, real-world situational practice — traffic circles, hazards, dead robots — is where the rules click. Unlock the full scenario library with Premium."
          cta="Unlock scenarios"
          icon={<Sparkles className="h-6 w-6" />}
        />
      </div>
    );
  }

  if (i >= queue.length) {
    return <Summary correct={correctCount} total={queue.length} />;
  }

  const sc = queue[i];
  const chosen = sc.choices.find((c) => c.id === chosenId) ?? null;
  const revealed = chosen !== null;

  function choose(choiceId: string) {
    if (revealed) return;
    const choice = sc.choices.find((c) => c.id === choiceId)!;
    setChosenId(choiceId);
    if (choice.correct) setCorrectCount((c) => c + 1);
    recordScenarioAttempt({
      scenarioId: sc.id,
      categoryId: sc.categoryId,
      choiceId,
      correct: choice.correct,
    });
  }

  function next() {
    setChosenId(null);
    const nextI = i + 1;
    if (nextI >= queue.length) {
      recordSession("scenarios", Math.round((Date.now() - startRef.current) / 1000));
    }
    setI(nextI);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <div className="flex items-center gap-3">
        <Link href="/study" className="text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="h-5 w-5" />
        </Link>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${(i / queue.length) * 100}%` }} />
        </div>
        <span className="font-mono text-xs text-muted-foreground">{i + 1}/{queue.length}</span>
      </div>

      <div key={sc.id} className="mt-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Badge variant="accent" className="gap-1">
            <CategoryIcon id={sc.categoryId} className="h-3 w-3" /> {categoryName(sc.categoryId)}
          </Badge>
          {(sc.image || sc.sign) && <SignVisual image={sc.image} sign={sc.sign} alt={sc.title} className="h-12 w-12" />}
        </div>

        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">{sc.title}</h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">{sc.situation}</p>
        <p className="mt-4 font-medium text-foreground">{sc.prompt}</p>

        <div className="mt-5 space-y-3">
          {sc.choices.map((choice) => {
            const isChosen = chosenId === choice.id;
            const showAs = revealed ? (choice.correct ? "correct" : isChosen ? "wrong" : "muted") : "default";
            return (
              <div key={choice.id}>
                <button
                  onClick={() => choose(choice.id)}
                  disabled={revealed}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border-2 bg-card p-4 text-left transition-all",
                    showAs === "default" && "border-border hover:border-primary/40",
                    showAs === "correct" && "border-success bg-success/[0.06]",
                    showAs === "wrong" && "border-warning bg-warning/[0.06]",
                    showAs === "muted" && "border-border opacity-60",
                  )}
                >
                  {revealed && choice.correct ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  ) : revealed && isChosen ? (
                    <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
                  ) : (
                    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-border" />
                  )}
                  <span className="text-foreground">{choice.text}</span>
                </button>

                {/* Branching consequence */}
                {isChosen && (
                  <div className="ml-5 mt-2 flex gap-2 animate-fade-in">
                    <CornerDownRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className={cn("flex-1 rounded-lg border p-3 text-sm", choice.correct ? "border-success/30 bg-success/[0.05]" : "border-warning/30 bg-warning/[0.05]")}>
                      {choice.consequence}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {revealed && (
          <div className="mt-5 animate-fade-in rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
            <p className="text-sm font-semibold text-primary">Why it matters</p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground">{sc.debrief}</p>
          </div>
        )}

        {revealed && (
          <Button size="lg" className="mt-5 w-full" onClick={next}>
            {i + 1 >= queue.length ? "Finish" : "Next scenario"} <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}

function Summary({ correct, total }: { correct: number; total: number }) {
  return (
    <div className="mx-auto max-w-md py-10">
      <Card className="animate-scale-in p-8 text-center">
        <p className="font-display text-4xl font-semibold tabular">
          {correct}<span className="text-muted-foreground">/{total}</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">scenarios judged correctly</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard" className={cn(buttonVariants())}>
            Back to dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
