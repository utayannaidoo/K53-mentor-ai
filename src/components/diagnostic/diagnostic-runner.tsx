"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { SignVisual } from "@/components/shared/sign-visual";
import { CategoryIcon } from "@/components/shared/category-icon";
import { CATEGORIES } from "@/lib/content/categories";
import { sampleDiagnostic } from "@/lib/diagnostic/select";
import { scoreDiagnostic } from "@/lib/diagnostic/scoring";
import { useStudyStore } from "@/hooks/use-study-store";
import { cn } from "@/lib/utils";

const LETTERS = ["A", "B", "C", "D"];

export function DiagnosticRunner() {
  const router = useRouter();
  const { state, recordQuestionAttempt, recordDiagnostic } = useStudyStore();

  const [questions] = React.useState(() => sampleDiagnostic(state.attempts));
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [responses, setResponses] = React.useState<
    { questionId: string; categoryId: (typeof CATEGORIES)[number]["id"]; correct: boolean; selectedIndex: number }[]
  >([]);
  const [phase, setPhase] = React.useState<"quiz" | "analyzing">("quiz");
  const [lit, setLit] = React.useState(0);

  const current = questions[index];
  const total = questions.length;

  function answer(optionIndex: number) {
    if (selected !== null) return;
    setSelected(optionIndex);
    const correct = optionIndex === current.correctIndex;
    const response = {
      questionId: current.id,
      categoryId: current.categoryId,
      correct,
      selectedIndex: optionIndex,
    };
    recordQuestionAttempt({ ...response, context: "diagnostic" });
    const nextResponses = [...responses, response];
    setResponses(nextResponses);

    window.setTimeout(() => {
      setSelected(null);
      if (index + 1 >= total) {
        setPhase("analyzing");
        window.setTimeout(() => {
          const result = scoreDiagnostic(nextResponses);
          recordDiagnostic(result);
          router.push("/diagnostic/results");
        }, 3000);
      } else {
        setIndex((i) => i + 1);
      }
    }, 280);
  }

  // Sequentially "light up" categories during analysis.
  React.useEffect(() => {
    if (phase !== "analyzing") return;
    const id = window.setInterval(() => {
      setLit((n) => Math.min(n + 1, CATEGORIES.length));
    }, 320);
    return () => window.clearInterval(id);
  }, [phase]);

  if (phase === "analyzing") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">
          Analysing your answers across 7 categories…
        </h1>
        <p className="mt-2 text-muted-foreground">Building your personalised plan</p>
        <div className="mt-8 grid max-w-md grid-cols-4 gap-3 sm:grid-cols-7">
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.id}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-300",
                i < lit
                  ? "border-primary bg-primary/10 text-primary scale-100"
                  : "border-border bg-card text-muted-foreground/40 scale-95",
              )}
            >
              <CategoryIcon id={cat.id} className="h-5 w-5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background bg-app">
      <header className="flex items-center justify-between px-6 py-5">
        <Logo />
        <span className="font-mono text-sm text-muted-foreground">
          {index + 1}/{total}
        </span>
      </header>

      <div className="mx-auto w-full max-w-xl px-6">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <div key={current.id} className="w-full max-w-xl animate-fade-in">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Question {index + 1}
          </p>
          {(current.image || current.sign) && (
            <div className="mt-4">
              <SignVisual image={current.image} sign={current.sign} alt="Road sign" className="h-20 w-20" />
            </div>
          )}
          <h1 className="mt-3 text-balance font-display text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
            {current.prompt}
          </h1>

          <div className="mt-6 space-y-3">
            {current.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => answer(i)}
                disabled={selected !== null}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 bg-card p-4 text-left transition-all",
                  selected === i
                    ? "border-primary bg-primary/[0.04]"
                    : "border-border hover:border-primary/40",
                  selected !== null && selected !== i && "opacity-50",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-colors",
                    selected === i ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                  )}
                >
                  {LETTERS[i]}
                </span>
                <span className="text-foreground">{opt}</span>
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            No pressure — there&apos;s no fail here, just useful signal.
          </p>
        </div>
      </div>
    </div>
  );
}
