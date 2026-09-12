"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { track } from "@/lib/analytics";
import { cn, glass, shuffle } from "@/lib/utils";
import type { CategoryId, Question } from "@/types";

const QUIZ_LENGTH = 5;

/**
 * Five real questions at the foot of a guide.
 *
 * Organic search is the one channel that already brings learners in, and a
 * guide reader who wants practice had only a text link. This lets them feel
 * the product in place, then offers the starting check.
 *
 * Draws from the bundled starter pack — the content any signed-out visitor is
 * already entitled to — learner's scope only, and imports it on mount rather
 * than at module scope so the guide's first load stays light.
 */
export function GuideQuiz({ slug, categories }: { slug: string; categories?: CategoryId[] }) {
  const [questions, setQuestions] = React.useState<Question[] | null>(null);
  const [index, setIndex] = React.useState(0);
  const [picked, setPicked] = React.useState<number | null>(null);
  const [correct, setCorrect] = React.useState(0);
  const tracked = React.useRef(false);

  React.useEffect(() => {
    let live = true;
    import("@/lib/content/starter").then(({ STARTER_QUESTIONS }) => {
      if (!live) return;
      const pool = STARTER_QUESTIONS.filter(
        (q) => q.scope === "learners" && (!categories || categories.includes(q.categoryId)),
      );
      // Sampled after mount, never during render, so the static page and the
      // hydrated one agree.
      setQuestions(shuffle(pool).slice(0, QUIZ_LENGTH));
    });
    return () => {
      live = false;
    };
    // categories is a literal per guide page; re-sampling on identity would
    // reshuffle mid-quiz for nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!questions) {
    return (
      <div className={cn(glass, "rounded-2xl border p-6")} aria-busy="true">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-5 w-3/4" />
        <Skeleton className="mt-4 h-11 w-full" />
        <Skeleton className="mt-2 h-11 w-full" />
      </div>
    );
  }
  if (questions.length === 0) return null;

  const done = index >= questions.length;
  const q = questions[Math.min(index, questions.length - 1)];

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correctIndex) setCorrect((n) => n + 1);
    if (!tracked.current) {
      tracked.current = true;
      track("landing_preview_interacted", { tab: `guide_quiz_${slug}` });
    }
  }

  function nextQuestion() {
    setPicked(null);
    setIndex((n) => n + 1);
  }

  return (
    <section aria-labelledby={`quiz-${slug}`} className={cn(glass, "rounded-2xl border p-6")}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={`quiz-${slug}`} className="font-display text-lg font-semibold tracking-tight">
          Try {questions.length} questions on this
        </h2>
        {!done && (
          <span className="font-mono text-xs text-muted-foreground">
            {index + 1}/{questions.length}
          </span>
        )}
      </div>

      {done ? (
        <div className="mt-4">
          <p className="text-base font-medium text-foreground">
            You got {correct} of {questions.length}.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            The real test needs about 80% in every section, and one topic is only part of it. The
            free starting check samples all three sections and shows which one to fix first.
          </p>
          <Link
            href="/onboarding"
            onClick={() => track("cta_clicked", { location: `guide_quiz_${slug}` })}
            className={cn(buttonVariants({ size: "lg" }), "mt-5 w-full gap-2 sm:w-auto")}
          >
            Get my section scores <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">Free · no card · about 5 minutes</p>
        </div>
      ) : (
        <div className="mt-4">
          {q.image && (
            // eslint-disable-next-line @next/next/no-img-element -- static sign PNGs, already sized
            <img src={q.image} alt="" width={88} height={88} className="mb-3 h-[88px] w-[88px] object-contain" />
          )}
          <p className="text-base font-medium leading-snug text-foreground">{q.prompt}</p>
          <div className="mt-4 space-y-2">
            {q.options.map((option, i) => {
              const isAnswer = i === q.correctIndex;
              const state =
                picked === null ? "idle" : isAnswer ? "right" : i === picked ? "wrong" : "muted";
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => choose(i)}
                  disabled={picked !== null}
                  className={cn(
                    "press flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ease-soft",
                    state === "idle" && "border-border bg-card/60 hover:border-primary/40",
                    state === "right" && "border-success/60 bg-success/10 text-foreground",
                    state === "wrong" && "border-danger/60 bg-danger/10 text-foreground",
                    state === "muted" && "border-border/60 text-muted-foreground",
                  )}
                >
                  <span>{option}</span>
                  {state === "right" && <Check className="h-4 w-4 shrink-0 text-success" aria-label="Correct answer" />}
                  {state === "wrong" && <X className="h-4 w-4 shrink-0 text-danger" aria-label="Your answer" />}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="mt-4" aria-live="polite">
              <p className="text-sm leading-relaxed text-muted-foreground">{q.explanation}</p>
              <button
                type="button"
                onClick={nextQuestion}
                className={cn(buttonVariants({ variant: "outline" }), "mt-4 gap-2")}
              >
                {index + 1 === questions.length ? "See my score" : "Next question"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
