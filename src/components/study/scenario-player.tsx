"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  CornerDownRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Paywall } from "@/components/app/paywall";
import { SignVisual } from "@/components/shared/sign-visual";
import { CategoryIcon } from "@/components/shared/category-icon";
import { SessionRecap } from "@/components/study/session-recap";
import { useStudyStore } from "@/hooks/use-study-store";
import { hasFeature } from "@/lib/billing/plans";
import { countDueTomorrow } from "@/lib/plan";
import { SCENARIOS } from "@/lib/content/scenarios";
import type { SessionRecapData } from "@/lib/ai/coach";
import { forCode } from "@/lib/content/vehicle";
import { categoryName } from "@/lib/content/categories";
import { shuffle, cn } from "@/lib/utils";

export function ScenarioPlayer() {
  const { state, recordScenarioAttempt, recordSession } = useStudyStore();
  const [queue] = React.useState(() =>
    shuffle(forCode(SCENARIOS, state.onboarding?.vehicleCode)).map((s) => ({
      ...s,
      choices: shuffle(s.choices),
    })),
  );
  const startRef = React.useRef(Date.now());
  const cpStartRef = React.useRef(state.cp);
  const [i, setI] = React.useState(0);
  const [chosen, setChosen] = React.useState<(string | null)[]>(() =>
    new Array(queue.length).fill(null),
  );
  const sessionRecorded = React.useRef(false);

  if (!hasFeature(state.tier, "scenarios")) {
    return (
      <div className="mx-auto max-w-md py-10">
        <Paywall
          feature="scenarios"
          title="Scenarios are a Premium feature"
          description="Branching, real-world situational practice — traffic circles, hazards, dead robots — is where the rules click. Unlock the full scenario library with Premium."
          cta="Unlock scenarios"
          icon={<Sparkles className="h-6 w-6" />}
        />
      </div>
    );
  }

  const correctCount = chosen.reduce((n, cid, idx) => {
    const c = queue[idx].choices.find((ch) => ch.id === cid);
    return n + (c?.correct ? 1 : 0);
  }, 0);

  if (i >= queue.length) {
    const wrongCats = queue
      .filter((sc, idx) => {
        const c = sc.choices.find((ch) => ch.id === chosen[idx]);
        return !c?.correct;
      })
      .map((sc) => categoryName(sc.categoryId));
    return (
      <Summary
        correct={correctCount}
        total={queue.length}
        cpEarned={state.cp - cpStartRef.current}
        recap={{
          mode: "scenarios",
          correct: correctCount,
          total: queue.length,
          weakCategories: [...new Set(wrongCats)].slice(0, 2),
          dueTomorrow: countDueTomorrow(state),
        }}
      />
    );
  }

  const sc = queue[i];
  const chosenId = chosen[i];
  const revealed = chosenId !== null;
  const isLast = i + 1 >= queue.length;

  function choose(choiceId: string) {
    if (chosen[i] !== null) return; // already answered
    const choice = sc.choices.find((c) => c.id === choiceId)!;
    setChosen((prev) => {
      const copy = [...prev];
      copy[i] = choiceId;
      return copy;
    });
    recordScenarioAttempt({
      scenarioId: sc.id,
      categoryId: sc.categoryId,
      choiceId,
      correct: choice.correct,
    });
  }

  function goPrev() {
    setI((x) => Math.max(0, x - 1));
  }
  function goNext() {
    if (chosen[i] === null) return; // can't advance until answered
    if (isLast) {
      if (!sessionRecorded.current) {
        recordSession("scenarios", Math.round((Date.now() - startRef.current) / 1000));
        sessionRecorded.current = true;
      }
      setI(queue.length);
    } else {
      setI((x) => x + 1);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <Link href="/study" className="text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="h-5 w-5" />
        </Link>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${((i + (revealed ? 1 : 0)) / queue.length) * 100}%` }}
          />
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {i + 1}/{queue.length}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2 sm:gap-3">
        <NavButton dir="prev" onClick={goPrev} disabled={i === 0} />

        <div key={sc.id} className="mx-auto min-w-0 max-w-2xl flex-1 animate-fade-in">
          <div className="flex items-center gap-3">
            <Badge variant="accent" className="gap-1">
              <CategoryIcon id={sc.categoryId} className="h-3 w-3" /> {categoryName(sc.categoryId)}
            </Badge>
            {(sc.image || sc.sign) && (
              <SignVisual image={sc.image} sign={sc.sign} alt={sc.title} className="h-12 w-12" />
            )}
          </div>

          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">{sc.title}</h1>
          <p className="mt-2 leading-relaxed text-muted-foreground">{sc.situation}</p>
          <p className="mt-4 font-medium text-foreground">{sc.prompt}</p>

          <div className="mt-5 space-y-3">
            {sc.choices.map((choice) => {
              const isChosen = chosenId === choice.id;
              const showAs = revealed
                ? choice.correct
                  ? "correct"
                  : isChosen
                    ? "wrong"
                    : "muted"
                : "default";
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
                      <div
                        className={cn(
                          "flex-1 rounded-lg border p-3 text-sm",
                          choice.correct
                            ? "border-success/30 bg-success/[0.05]"
                            : "border-warning/30 bg-warning/[0.05]",
                        )}
                      >
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
        </div>

        <NavButton dir="next" onClick={goNext} disabled={!revealed} finish={isLast} />
      </div>
    </div>
  );
}

function NavButton({
  dir,
  onClick,
  disabled,
  finish,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
  finish?: boolean;
}) {
  const Icon = dir === "prev" ? ChevronLeft : finish ? Check : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous scenario" : finish ? "Finish" : "Next scenario"}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        disabled
          ? "cursor-not-allowed border-border/40 text-muted-foreground/30"
          : dir === "next"
            ? "press border-primary bg-primary text-primary-foreground hover:brightness-110"
            : "press border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function Summary({
  correct,
  total,
  cpEarned,
  recap,
}: {
  correct: number;
  total: number;
  cpEarned: number;
  recap: SessionRecapData;
}) {
  return (
    <div className="mx-auto max-w-md py-10">
      <Card className="animate-scale-in p-8 text-center">
        <p className="font-display text-4xl font-semibold tabular">
          {correct}
          <span className="text-muted-foreground">/{total}</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">scenarios judged correctly</p>
        {cpEarned > 0 && (
          <div className="mt-3 flex justify-center">
            <Badge variant="default" className="gap-1 font-mono text-sm">
              <Zap className="h-3.5 w-3.5" /> +{cpEarned} CP
            </Badge>
          </div>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard" className={cn(buttonVariants())}>
            Back to dashboard
          </Link>
        </div>
      </Card>
      <SessionRecap data={recap} className="mt-5" />
    </div>
  );
}
