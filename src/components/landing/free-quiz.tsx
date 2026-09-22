"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, CornerDownRight, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SignVisual } from "@/components/shared/sign-visual";
import { EXAM_FORMAT, SECTION_LABEL, SECTION_OF, type ExamSection } from "@/lib/constants";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { Question } from "@/types";

/**
 * Ten real questions, no account.
 *
 * This is the link-in-bio destination for social traffic. Someone arriving from
 * a video about one road sign will not create an account to find out whether
 * they know the rest, so the proof has to come first and the ask second.
 *
 * The payoff screen is a per-section breakdown rather than a bare score,
 * because the per-section rule is the thing learners get wrong about this test
 * and the thing this product models honestly: you can clear the overall mark
 * and still fail on one section. Ten questions cannot predict a real result,
 * and the copy says so — the diagnostic is what does that.
 */

const LETTERS = ["A", "B", "C", "D"];
const QUIZ_SIZE = 10;

/** Roughly the real paper's shape (28 signs / 28 rules / 8 controls), at 1/6 scale. */
const MIX: Record<ExamSection, number> = { signs: 4, rules: 4, controls: 2 };

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickQuestions(pool: Question[]): Question[] {
  const bySection = new Map<ExamSection, Question[]>();
  for (const q of pool) {
    const section = SECTION_OF[q.categoryId];
    const arr = bySection.get(section) ?? [];
    arr.push(q);
    bySection.set(section, arr);
  }

  const picked: Question[] = [];
  for (const [section, want] of Object.entries(MIX) as [ExamSection, number][]) {
    picked.push(...shuffle(bySection.get(section) ?? []).slice(0, want));
  }

  // Top up from whatever is left if a section came up short, so the quiz is
  // always QUIZ_SIZE long even as the starter pack changes shape.
  if (picked.length < QUIZ_SIZE) {
    const taken = new Set(picked.map((q) => q.id));
    picked.push(...shuffle(pool.filter((q) => !taken.has(q.id))).slice(0, QUIZ_SIZE - picked.length));
  }
  return shuffle(picked).slice(0, QUIZ_SIZE);
}

type Answer = { question: Question; selected: number };

export function FreeQuiz() {
  const [questions, setQuestions] = React.useState<Question[] | null>(null);
  const [answers, setAnswers] = React.useState<Answer[]>([]);
  const [selected, setSelected] = React.useState<number | null>(null);

  // Picked after mount, not during render: the sample is random, and a random
  // sample chosen on the server never matches the one the client would choose.
  // Imported here rather than at module scope for the same reason the landing
  // demo does it — the pack is ~31KB that only this page needs.
  React.useEffect(() => {
    let live = true;
    void import("@/lib/content/starter").then(({ STARTER_QUESTIONS }) => {
      if (live) setQuestions(pickQuestions(STARTER_QUESTIONS));
    });
    return () => {
      live = false;
    };
  }, []);

  const index = answers.length;
  const done = questions !== null && index >= questions.length;
  const current = questions?.[index];

  const score = answers.filter((a) => a.selected === a.question.correctIndex).length;

  React.useEffect(() => {
    if (done) track("free_quiz_completed", { score, total: QUIZ_SIZE });
  }, [done, score]);

  if (!questions) {
    return (
      <div className="glass-2 flex h-[520px] items-center justify-center rounded-2xl border border-border">
        <p className="text-sm text-muted-foreground">Loading your questions…</p>
      </div>
    );
  }

  if (done) return <Results answers={answers} />;
  if (!current) return null;

  const answered = selected !== null;
  const isCorrect = selected === current.correctIndex;

  return (
    <div className="glass-2 rounded-2xl border border-border p-5 sm:p-6">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">
          Question {index + 1} of {questions.length}
        </span>
        <span className="text-muted-foreground">
          {SECTION_LABEL[SECTION_OF[current.categoryId]]}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${(index / questions.length) * 100}%` }}
        />
      </div>

      <div className="mt-5 flex items-start gap-3">
        {current.image && (
          <SignVisual image={current.image} alt="" className="h-16 w-16 shrink-0" />
        )}
        <h2 className="font-display text-lg font-semibold leading-snug tracking-tight">
          {current.prompt}
        </h2>
      </div>

      <div className="mt-4 space-y-2">
        {current.options.map((opt, idx) => {
          const isThis = selected === idx;
          const showCorrect = answered && idx === current.correctIndex;
          const showWrong = answered && isThis && !isCorrect;
          return (
            <button
              key={idx}
              type="button"
              disabled={answered}
              onClick={() => setSelected(idx)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl border-2 bg-card px-3 py-3 text-left text-sm leading-snug transition-all",
                !answered && "hover:border-primary/40",
                showCorrect && "border-success bg-success/[0.06]",
                showWrong && "border-warning bg-warning/[0.06]",
                !showCorrect && !showWrong && "border-border",
                answered && !showCorrect && !showWrong && "opacity-60",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-semibold",
                  showCorrect && "border-success bg-success text-white",
                  showWrong && "border-warning bg-warning text-white",
                  !showCorrect && !showWrong && "border-border text-muted-foreground",
                )}
              >
                {showCorrect ? (
                  <Check className="h-3.5 w-3.5" />
                ) : showWrong ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  LETTERS[idx]
                )}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <>
          <div className="mt-3 flex animate-fade-in gap-2">
            <CornerDownRight className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex-1 rounded-lg border border-success/30 bg-success/[0.05] p-3 text-sm leading-snug">
              <span className={cn("font-semibold", isCorrect ? "text-success" : "text-warning")}>
                {isCorrect ? "Correct. " : "Not quite. "}
              </span>
              {current.explanation}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setAnswers((a) => [...a, { question: current, selected }]);
              setSelected(null);
            }}
            className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full gap-2")}
          >
            {index + 1 === questions.length ? "See your result" : "Next question"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

function Results({ answers }: { answers: Answer[] }) {
  const score = answers.filter((a) => a.selected === a.question.correctIndex).length;

  const sections = (Object.keys(EXAM_FORMAT.sections) as ExamSection[])
    .map((section) => {
      const inSection = answers.filter((a) => SECTION_OF[a.question.categoryId] === section);
      const right = inSection.filter((a) => a.selected === a.question.correctIndex).length;
      return { section, right, total: inSection.length };
    })
    .filter((s) => s.total > 0);

  // The real paper's per-section bar, applied to this much smaller sample. Named
  // "below the bar" rather than "failed" throughout: ten questions is a signal,
  // not a verdict, and overclaiming here would be the same mistake the apps
  // that score on the total alone make.
  const weakest = sections.reduce((worst, s) =>
    s.right / s.total < worst.right / worst.total ? s : worst,
  );
  const allStrong = sections.every((s) => s.right / s.total >= 0.8);

  return (
    <div className="glass-2 rounded-2xl border border-border p-6 text-center sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">Your result</p>
      <p className="mt-2 font-display text-5xl font-bold tracking-tight">
        {score}
        <span className="text-2xl text-muted-foreground">/{answers.length}</span>
      </p>

      <div className="mt-6 space-y-3 text-left">
        {sections.map(({ section, right, total }) => {
          const strong = right / total >= 0.8;
          return (
            <div key={section} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-sm text-muted-foreground">
                {SECTION_LABEL[section]}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", strong ? "bg-success" : "bg-warning")}
                  style={{ width: `${(right / total) * 100}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right font-mono text-sm tabular-nums">
                {right}/{total}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-4 text-left text-sm leading-relaxed">
        {allStrong ? (
          <>
            <strong>Strong across all three sections.</strong> Worth knowing that the real paper is{" "}
            {EXAM_FORMAT.totalQuestions} questions and you have to clear the mark in{" "}
            <em>every</em> section separately — {EXAM_FORMAT.sections.signs.pass}/
            {EXAM_FORMAT.sections.signs.questions} on signs alone. Ten questions is a good sign,
            not a prediction.
          </>
        ) : (
          <>
            <strong>{SECTION_LABEL[weakest.section]} is your weakest section here.</strong> That
            matters more than the total: on the real test you must reach the pass mark in every
            section separately, so {weakest.right}/{weakest.total} on one section can fail you
            even with a good overall score.
          </>
        )}
      </div>

      <Link href="/onboarding" className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full gap-2")}>
        Get your real readiness score <ArrowRight className="h-4 w-4" />
      </Link>
      <p className="mt-2 text-xs text-muted-foreground">
        15 adaptive questions · free · no card needed
      </p>
    </div>
  );
}
