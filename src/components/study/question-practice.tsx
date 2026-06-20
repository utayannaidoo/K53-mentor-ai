"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X, Check, ArrowRight, Sparkles, Target } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Paywall } from "@/components/app/paywall";
import { SignGlyph } from "@/components/shared/sign-glyph";
import { CategoryIcon } from "@/components/shared/category-icon";
import { useStudyStore } from "@/hooks/use-study-store";
import { QUESTIONS, questionsByCategory } from "@/lib/content/questions";
import { categoryName } from "@/lib/content/categories";
import { shuffle, cn } from "@/lib/utils";
import type { CategoryId, Question } from "@/types";

const LETTERS = ["A", "B", "C", "D"];

export function QuestionPractice() {
  const sp = useSearchParams();
  const categoryParam = (sp.get("category") as CategoryId | null) ?? undefined;
  const { recordQuestionAttempt, recordSession, usageFor } = useStudyStore();

  const cap = usageFor("questions");
  const remaining = Number.isFinite(cap.cap) ? Math.max(0, cap.cap - cap.used) : 12;
  const limit = Math.max(1, Math.min(remaining, 12));

  const [queue] = React.useState<Question[]>(() => {
    const pool = categoryParam ? questionsByCategory(categoryParam) : QUESTIONS;
    return shuffle(pool).slice(0, limit);
  });
  const startRef = React.useRef(Date.now());
  const [i, setI] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [correctCount, setCorrectCount] = React.useState(0);

  if (Number.isFinite(cap.cap) && cap.used >= cap.cap) {
    return (
      <div className="mx-auto max-w-md py-10">
        <Paywall
          title="You've hit today's free questions"
          description={`The free plan includes ${cap.cap} practice questions a day. Premium unlocks unlimited practice across every category.`}
          cta="Go unlimited"
        />
      </div>
    );
  }

  if (i >= queue.length) {
    return <Summary correct={correctCount} total={queue.length} seconds={Math.round((Date.now() - startRef.current) / 1000)} />;
  }

  const q = queue[i];
  const answered = selected !== null;
  const isCorrect = selected === q.correctIndex;

  function choose(optionIndex: number) {
    if (answered) return;
    setSelected(optionIndex);
    const correct = optionIndex === q.correctIndex;
    if (correct) setCorrectCount((c) => c + 1);
    recordQuestionAttempt({
      questionId: q.id,
      categoryId: q.categoryId,
      correct,
      selectedIndex: optionIndex,
      context: "practice",
    });
  }

  function next() {
    setSelected(null);
    const nextI = i + 1;
    if (nextI >= queue.length) {
      recordSession("questions", Math.round((Date.now() - startRef.current) / 1000));
    }
    setI(nextI);
  }

  const runningAcc = i > 0 ? Math.round((correctCount / i) * 100) : null;

  return (
    <div className="mx-auto flex max-w-xl flex-col">
      <div className="flex items-center gap-3">
        <Link href="/study" className="text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="h-5 w-5" />
        </Link>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${(i / queue.length) * 100}%` }} />
        </div>
        <span className="font-mono text-xs text-muted-foreground">{i + 1}/{queue.length}</span>
      </div>

      {runningAcc !== null && (
        <div className="mt-3 flex items-center justify-end gap-1 text-xs text-muted-foreground">
          <Target className="h-3.5 w-3.5" /> {runningAcc}% so far
        </div>
      )}

      <div key={q.id} className="mt-5 animate-fade-in">
        <Badge variant="secondary" className="gap-1">
          <CategoryIcon id={q.categoryId} className="h-3 w-3" /> {categoryName(q.categoryId)}
        </Badge>
        {q.sign && (
          <div className="mt-4">
            <SignGlyph sign={q.sign} className="h-20 w-20" />
          </div>
        )}
        <h1 className="mt-3 text-balance font-display text-xl font-semibold leading-snug tracking-tight">
          {q.prompt}
        </h1>

        <div className="mt-5 space-y-3">
          {q.options.map((opt, idx) => {
            const isThis = selected === idx;
            const showCorrect = answered && idx === q.correctIndex;
            const showWrong = answered && isThis && !isCorrect;
            return (
              <button
                key={idx}
                onClick={() => choose(idx)}
                disabled={answered}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 bg-card p-4 text-left transition-all",
                  !answered && "hover:border-primary/40",
                  showCorrect && "border-success bg-success/[0.06]",
                  showWrong && "border-warning bg-warning/[0.06]",
                  !showCorrect && !showWrong && "border-border",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-semibold",
                    showCorrect && "border-success bg-success text-white",
                    showWrong && "border-warning bg-warning text-white",
                    !showCorrect && !showWrong && "border-border text-muted-foreground",
                  )}
                >
                  {showCorrect ? <Check className="h-4 w-4" /> : LETTERS[idx]}
                </span>
                <span className="text-foreground">{opt}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-5 animate-fade-in rounded-xl border border-border bg-muted/40 p-4">
            <p className={cn("text-sm font-semibold", isCorrect ? "text-success" : "text-warning")}>
              {isCorrect ? "Correct" : "Not quite"}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{q.explanation}</p>
            {!isCorrect && (
              <Link
                href={`/tutor?question=${q.id}`}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <Sparkles className="h-4 w-4" /> Ask the tutor why
              </Link>
            )}
          </div>
        )}

        {answered && (
          <Button size="lg" className="mt-5 w-full" onClick={next}>
            {i + 1 >= queue.length ? "Finish" : "Next question"} <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}

function Summary({ correct, total, seconds }: { correct: number; total: number; seconds: number }) {
  const acc = total ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="mx-auto max-w-md py-10">
      <Card className="animate-scale-in p-8 text-center">
        <p className="font-display text-4xl font-semibold tabular">
          {correct}<span className="text-muted-foreground">/{total}</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{acc}% accuracy this session</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/study/questions" className={cn(buttonVariants({ variant: "outline" }))}>
            Practice more
          </Link>
          <Link href="/dashboard" className={cn(buttonVariants())}>
            Back to dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
