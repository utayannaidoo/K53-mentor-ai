"use client";

import * as React from "react";
import Link from "next/link";
import { X, ArrowRight, Clock, FileText, CheckCircle2, XCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MasteryBar } from "@/components/ui/mastery-bar";
import { Paywall } from "@/components/app/paywall";
import { SignGlyph } from "@/components/shared/sign-glyph";
import { ScoreRing } from "@/components/ui/score-ring";
import { useStudyStore } from "@/hooks/use-study-store";
import { sampleMockExam } from "@/lib/diagnostic/select";
import { EXAM_FORMAT } from "@/lib/constants";
import { CATEGORIES, categoryName } from "@/lib/content/categories";
import { cn } from "@/lib/utils";
import type { CategoryId, CategoryScore, Question } from "@/types";

const LETTERS = ["A", "B", "C", "D"];
const EXAM_SECONDS = 60 * 60;

export function MockExam() {
  const { state, recordMockExam, recordSession } = useStudyStore();
  const [phase, setPhase] = React.useState<"intro" | "exam" | "results">("intro");
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [answers, setAnswers] = React.useState<number[]>([]);
  const [i, setI] = React.useState(0);
  const [secondsLeft, setSecondsLeft] = React.useState(EXAM_SECONDS);
  const startRef = React.useRef(0);

  const freeUsedUp = state.tier === "free" && state.mockExams.length >= 1;

  const submit = React.useCallback(() => {
    const correct = questions.reduce((n, q, idx) => n + (answers[idx] === q.correctIndex ? 1 : 0), 0);
    const perCategory: Partial<Record<CategoryId, CategoryScore>> = {};
    for (const cat of CATEGORIES) {
      const idxs = questions.map((q, idx) => ({ q, idx })).filter((x) => x.q.categoryId === cat.id);
      if (!idxs.length) continue;
      const c = idxs.filter((x) => answers[x.idx] === x.q.correctIndex).length;
      perCategory[cat.id] = { correct: c, total: idxs.length, score: Math.round((c / idxs.length) * 100) };
    }
    const passed = correct >= EXAM_FORMAT.passMark;
    const durationSeconds = Math.round((Date.now() - startRef.current) / 1000);
    recordMockExam({ score: correct, total: questions.length, passed, perCategory, durationSeconds });
    recordSession("mock", durationSeconds);
    setPhase("results");
  }, [answers, questions, recordMockExam, recordSession]);

  // Countdown timer.
  React.useEffect(() => {
    if (phase !== "exam") return;
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [phase, secondsLeft, submit]);

  function start() {
    const qs = sampleMockExam(EXAM_FORMAT.totalQuestions);
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(-1));
    setI(0);
    setSecondsLeft(EXAM_SECONDS);
    startRef.current = Date.now();
    setPhase("exam");
  }

  if (freeUsedUp && phase === "intro") {
    return (
      <div className="mx-auto max-w-md py-10">
        <Paywall
          title="You've used your free mock exam"
          description="The free plan includes one full mock exam. Premium gives you unlimited 68-question mock exams to test your readiness as often as you like."
          cta="Unlock unlimited mocks"
        />
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-lg py-10">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">Full mock exam</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {EXAM_FORMAT.totalQuestions} questions, just like the real test. You need{" "}
            {EXAM_FORMAT.passMark} correct to pass. The clock starts when you begin.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
            <Stat label="Questions" value={`${EXAM_FORMAT.totalQuestions}`} />
            <Stat label="To pass" value={`${EXAM_FORMAT.passMark}`} />
            <Stat label="Time" value="60 min" />
          </div>
          <Button size="xl" className="mt-7 w-full" onClick={start}>
            Start mock exam <ArrowRight />
          </Button>
          <Link href="/study" className="mt-3 inline-block text-sm text-muted-foreground hover:text-foreground">
            Not now
          </Link>
        </Card>
      </div>
    );
  }

  if (phase === "results") {
    const last = state.mockExams[state.mockExams.length - 1];
    if (!last) return null;
    const wrong = questions
      .map((q, idx) => ({ q, idx }))
      .filter((x) => answers[x.idx] !== x.q.correctIndex);
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="p-8 text-center">
          <ScoreRing
            value={Math.round((last.score / last.total) * 100)}
            size={180}
            label={`${last.score}/${last.total}`}
            tone={last.passed ? "success" : "warning"}
          />
          <div className="mt-4">
            <Badge variant={last.passed ? "success" : "warning"} className="text-sm">
              {last.passed ? "You passed 🎉" : `${EXAM_FORMAT.passMark - last.score} short of passing`}
            </Badge>
          </div>
        </Card>

        <Card className="mt-5 p-6">
          <h2 className="font-display text-lg font-semibold">By category</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {(Object.keys(last.perCategory) as CategoryId[]).map((cat) => (
              <MasteryBar
                key={cat}
                label={categoryName(cat)}
                value={last.perCategory[cat]!.score}
                count={`${last.perCategory[cat]!.correct}/${last.perCategory[cat]!.total}`}
              />
            ))}
          </div>
        </Card>

        {wrong.length > 0 && (
          <Card className="mt-5 p-6">
            <h2 className="font-display text-lg font-semibold">Review your mistakes ({wrong.length})</h2>
            <ul className="mt-4 space-y-4">
              {wrong.slice(0, 15).map(({ q, idx }) => (
                <li key={`${q.id}-${idx}`} className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium text-foreground">{q.prompt}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" /> {q.options[q.correctIndex]}
                  </p>
                  {answers[idx] >= 0 && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <XCircle className="h-4 w-4 text-warning" /> You chose: {q.options[answers[idx]]}
                    </p>
                  )}
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{q.explanation}</p>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => setPhase("intro")}>Take another</Button>
          <Link href="/dashboard" className={cn(buttonVariants())}>Back to dashboard</Link>
        </div>
      </div>
    );
  }

  // Exam phase
  const q = questions[i];
  const answered = answers[i] >= 0;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  function choose(optionIndex: number) {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[i] = optionIndex;
      return copy;
    });
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col">
      <div className="flex items-center gap-3">
        <button onClick={submit} className="text-muted-foreground hover:text-foreground" aria-label="Submit and exit">
          <X className="h-5 w-5" />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${((i + 1) / questions.length) * 100}%` }} />
        </div>
        <span className={cn("flex items-center gap-1 font-mono text-xs", secondsLeft < 300 ? "text-danger" : "text-muted-foreground")}>
          <Clock className="h-3.5 w-3.5" /> {mm}:{ss}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">Question {i + 1} of {questions.length}</span>
        <button onClick={submit} className="text-xs font-medium text-primary hover:underline">Submit now</button>
      </div>

      <div key={i} className="mt-5 animate-fade-in">
        {q.sign && (
          <div className="mb-4">
            <SignGlyph sign={q.sign} className="h-20 w-20" />
          </div>
        )}
        <h1 className="text-balance font-display text-xl font-semibold leading-snug tracking-tight">{q.prompt}</h1>
        <div className="mt-5 space-y-3">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => choose(idx)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 bg-card p-4 text-left transition-all",
                answers[i] === idx ? "border-primary bg-primary/[0.04]" : "border-border hover:border-primary/40",
              )}
            >
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-semibold", answers[i] === idx ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}>
                {LETTERS[idx]}
              </span>
              <span className="text-foreground">{opt}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          {i > 0 && (
            <Button variant="outline" size="lg" onClick={() => setI((x) => x - 1)}>
              Back
            </Button>
          )}
          {i + 1 < questions.length ? (
            <Button size="lg" className="flex-1" disabled={!answered} onClick={() => setI((x) => x + 1)}>
              Next <ArrowRight />
            </Button>
          ) : (
            <Button size="lg" className="flex-1" onClick={submit}>
              Submit exam
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <p className="tabular font-mono text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
