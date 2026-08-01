"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X, Check, ChevronLeft, ChevronRight, CornerDownRight, SearchX, Sparkles, Target, Zap } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Paywall } from "@/components/app/paywall";
import { TrialEndCard } from "@/components/app/trial-end-card";
import { sourceFor } from "@/lib/content/provenance";
import { SignVisual, SignPreload } from "@/components/shared/sign-visual";
import { signQuestionAlt } from "@/lib/content/sign-alt";
import { CategoryIcon } from "@/components/shared/category-icon";
import { SessionRecap } from "@/components/study/session-recap";
import { SecondOpinion } from "@/components/study/second-opinion";
import { SpeakButton } from "@/components/study/speak-button";
import { useStudyStore } from "@/hooks/use-study-store";
import { countDueTomorrow } from "@/lib/plan";
import type { SessionRecapData } from "@/lib/ai/coach";
import { forCode } from "@/lib/content/vehicle";
import { useContentPool } from "@/components/content/content-provider";
import {
  easyFirst,
  orderByFreshness,
  subjectOf,
  takeDistinctSubjects,
  withShuffledOptions,
} from "@/lib/diagnostic/select";
import { dueMistakes } from "@/lib/learning/mistakes";
import { abilityByCategory, interleave, withinReach } from "@/lib/learning/ability";
import { TrialMeter } from "@/components/app/trial-meter";
import { categoryName } from "@/lib/content/categories";
import { STUDY_SESSION_SIZE, studyCodeOf } from "@/lib/billing/plans";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { CategoryId, Question } from "@/types";

const LETTERS = ["A", "B", "C", "D"];

/**
 * Mistakes to lead a session with. Enough that review is felt, few enough that
 * a session still teaches something new — a queue of nothing but past failures
 * is demoralising, and new material is what moves readiness.
 */
const MISTAKES_PER_SESSION = 3;

export function QuestionPractice() {
  const sp = useSearchParams();
  const categoryParam = (sp.get("category") as CategoryId | null) ?? undefined;
  const { state, recordQuestionAttempt, recordSession, usageFor } = useStudyStore();
  const { questions: bank, full } = useContentPool();

  const cap = usageFor("questions");
  const remaining = Number.isFinite(cap.cap) ? Math.max(0, cap.cap - cap.used) : STUDY_SESSION_SIZE;
  const limit = Math.max(1, Math.min(remaining, STUDY_SESSION_SIZE));

  function buildQueue(): Question[] {
    const base = categoryParam ? bank.filter((q) => q.categoryId === categoryParam) : bank;
    const pool = forCode(base, studyCodeOf(state));

    // Mistakes lead. `orderByFreshness` alone sorts least-recently-seen first,
    // which pushes a question you just got wrong to the *back* of the rotation —
    // the one item you've proven you don't know is the one it hides. Re-testing
    // it is the whole point of practising, so it goes in front.
    const byId = new Map(pool.map((q) => [q.id, q]));
    const mistakes = dueMistakes(state)
      .map((m) => byId.get(m.questionId))
      .filter((q): q is Question => Boolean(q))
      .slice(0, Math.min(MISTAKES_PER_SESSION, Math.max(0, limit - 1)));
    const mistakeIds = new Set(mistakes.map((q) => q.id));

    // Difficulty ladder: keep new material at or just above what this learner
    // is currently getting right in that category, rather than serving the
    // whole pool regardless of whether they're drowning or bored.
    const ability = abilityByCategory(state.attempts);
    let ordered = orderByFreshness(
      withinReach(
        pool.filter((q) => !mistakeIds.has(q.id)),
        ability,
      ),
      state.attempts,
    );
    // Self-declared beginners open their first-ever session with easy questions.
    if (state.onboarding?.knowledgeLevel === "beginner" && state.attempts.length === 0) {
      ordered = easyFirst(ordered);
    }

    // Seed the subject set with the mistakes so the filler can't ask about the
    // same road sign twice in one session.
    const seen = new Set(mistakes.map(subjectOf));
    const fresh = takeDistinctSubjects(ordered, Math.max(0, limit - mistakes.length), seen);

    // Interleave only when the session spans categories — inside a single
    // category there is nothing to interleave, and the learner chose that focus.
    const queue = [...mistakes, ...fresh];
    return (categoryParam ? queue : interleave(queue)).map(withShuffledOptions);
  }

  const [queue, setQueue] = React.useState<Question[]>(buildQueue);
  const startRef = React.useRef(Date.now());
  const cpStartRef = React.useRef(state.cp);
  const [i, setI] = React.useState(0);
  const [answers, setAnswers] = React.useState<(number | null)[]>(() =>
    new Array(queue.length).fill(null),
  );
  const sessionRecorded = React.useRef(false);

  // Must sit with the other hooks, above the early returns below — the cap
  // paywall, the empty state and the summary all return before the question
  // renders, and a hook declared after them would run conditionally.
  // This measures thinking (question shown → answer tapped), not page load.
  const shownAt = React.useRef<number>(Date.now());
  React.useEffect(() => {
    shownAt.current = Date.now();
  }, [i]);

  /**
   * The full bank arrives after mount, so a queue built while the pool is still
   * the bundled starter pack is a placeholder — it draws new material from ~100
   * items instead of the whole bank, and it cannot contain a mistake that isn't
   * in the starter pack at all, which is most of them.
   *
   * Rebuild once when the pool upgrades, and only while the session is still
   * untouched: swapping the queue under someone mid-answer would lose their
   * place, and every answer is already recorded either way.
   */
  const builtFromFullPool = React.useRef(full);
  React.useEffect(() => {
    if (!full || builtFromFullPool.current) return;
    if (answers.some((a) => a !== null)) return;
    builtFromFullPool.current = true;
    const next = buildQueue();
    setQueue(next);
    setAnswers(new Array(next.length).fill(null));
    setI(0);
    // buildQueue reads the render's state and pool by design; re-running it on
    // every state change would reshuffle the session under the learner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  // Start a fresh session in place. "Practice more" used to link back to this
  // same route, but navigating to the URL you're already on doesn't remount
  // the component — so it looked dead. Rebuild the queue from current state
  // (orderByFreshness now deprioritises the questions just answered) and reset
  // the per-session state instead.
  function restart() {
    const next = buildQueue();
    setQueue(next);
    setAnswers(new Array(next.length).fill(null));
    startRef.current = Date.now();
    cpStartRef.current = state.cp;
    sessionRecorded.current = false;
    setI(0);
  }

  if (Number.isFinite(cap.cap) && cap.used >= cap.cap) {
    return (
      <div className="mx-auto max-w-md py-10">
        {state.tier === "free" ? (
          <TrialEndCard feature="questions" />
        ) : (
          <Paywall
            feature="questions"
            title="You've hit today's questions"
            description="Your plan's daily question sessions are done — they reset tomorrow. Premium Plus removes the limit entirely."
            cta="See plans"
          />
        )}
      </div>
    );
  }

  // No questions matched — an unknown ?category=, or a category with nothing
  // left for this licence code. Without this the summary below renders for an
  // empty queue and congratulates the learner on a "0/0, 0% accuracy" session
  // they never sat, recap and all.
  if (queue.length === 0) {
    return (
      <div className="mx-auto max-w-md py-10">
        <EmptyState
          icon={<SearchX className="h-6 w-6" />}
          title="No questions here yet"
          description={
            categoryParam
              ? "That category has nothing for your licence code right now. Try another one — or practise across everything."
              : "We couldn't build a session from that link. Try practising across all categories."
          }
          action={
            <Link href="/study/questions" className={cn(buttonVariants({ size: "sm" }))}>
              Practise all categories
            </Link>
          }
        />
      </div>
    );
  }

  const correctCount = answers.reduce<number>(
    (n, a, idx) => n + (a !== null && a === queue[idx].correctIndex ? 1 : 0),
    0,
  );

  if (i >= queue.length) {
    const seconds = Math.round((Date.now() - startRef.current) / 1000);
    const wrongByCat = new Map<CategoryId, number>();
    queue.forEach((q, idx) => {
      if (answers[idx] !== q.correctIndex) {
        wrongByCat.set(q.categoryId, (wrongByCat.get(q.categoryId) ?? 0) + 1);
      }
    });
    const weakCategories = [...wrongByCat.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([c]) => categoryName(c));
    return (
      <Summary
        correct={correctCount}
        total={queue.length}
        seconds={seconds}
        cpEarned={state.cp - cpStartRef.current}
        onPracticeMore={restart}
        trialNearEnd={state.tier === "free" && Number.isFinite(cap.cap) && cap.cap - cap.used <= 2}
        recap={{
          mode: "questions",
          correct: correctCount,
          total: queue.length,
          seconds,
          weakCategories,
          dueTomorrow: countDueTomorrow(state),
        }}
      />
    );
  }

  const q = queue[i];
  const selected = answers[i];
  const answered = selected !== null;
  const isCorrect = answered && selected === q.correctIndex;
  const answeredCount = answers.filter((a) => a !== null).length;
  const runningAcc = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : null;
  const isLast = i + 1 >= queue.length;

  function choose(optionIndex: number) {
    if (answers[i] !== null) return; // already answered — don't re-record
    // Acknowledge the tap physically before the visual result lands.
    if (optionIndex === q.correctIndex) haptics.success();
    else haptics.error();
    setAnswers((prev) => {
      const copy = [...prev];
      copy[i] = optionIndex;
      return copy;
    });
    recordQuestionAttempt({
      questionId: q.id,
      categoryId: q.categoryId,
      correct: optionIndex === q.correctIndex,
      selectedIndex: optionIndex,
      context: "practice",
      ms: Date.now() - shownAt.current,
    });
  }

  function goPrev() {
    setI((x) => Math.max(0, x - 1));
  }
  function goNext() {
    if (answers[i] === null) return; // can't advance until answered
    if (isLast) {
      haptics.celebrate();
      if (!sessionRecorded.current) {
        recordSession("questions", Math.round((Date.now() - startRef.current) / 1000));
        sessionRecorded.current = true;
      }
      setI(queue.length);
    } else {
      setI((x) => x + 1);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <Link href="/study" className="text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="h-5 w-5" />
        </Link>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${((i + (answered ? 1 : 0)) / queue.length) * 100}%` }}
          />
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {i + 1}/{queue.length}
        </span>
      </div>

      <TrialMeter feature="questions" className="mx-auto mt-3 max-w-xl" />

      {runningAcc !== null && (
        <div className="mx-auto mt-3 flex max-w-xl items-center justify-end gap-1 text-xs text-muted-foreground">
          <Target className="h-3.5 w-3.5" /> {runningAcc}% so far
        </div>
      )}

      <div className="mt-5 flex items-center gap-2 sm:gap-3">
        <NavButton dir="prev" onClick={goPrev} disabled={i === 0} />

        <div key={q.id} className="mx-auto min-w-0 max-w-xl flex-1 animate-fade-in">
          <Badge variant="secondary" className="gap-1">
            <CategoryIcon id={q.categoryId} className="h-3 w-3" /> {categoryName(q.categoryId)}
          </Badge>
          {(q.image || q.sign) && (
            <div className="mt-4">
              <SignVisual image={q.image} sign={q.sign} alt={signQuestionAlt(q.image, q.categoryId)} className="h-20 w-20" priority />
            </div>
          )}
          {/* Fetch the next question's sign while this one is being answered,
              so advancing never lands on an empty image card. */}
          <SignPreload image={queue[i + 1]?.image} />
          <div className="mt-3 flex items-start gap-2">
            <h1 className="text-balance font-display text-xl font-semibold leading-snug tracking-tight">
              {q.prompt}
            </h1>
            <SpeakButton
              className="mt-0.5"
              label="Read the question and options aloud"
              text={`${q.prompt}. ${q.options.map((o, idx) => `${LETTERS[idx]}. ${o}`).join(". ")}`}
            />
          </div>

          <div className="mt-5 space-y-3">
            {q.options.map((opt, idx) => {
              const isThis = selected === idx;
              const showCorrect = answered && idx === q.correctIndex;
              const showWrong = answered && isThis && !isCorrect;
              return (
                <div key={idx}>
                  <button
                    onClick={() => choose(idx)}
                    disabled={answered}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border-2 bg-card p-4 text-left transition-all",
                      !answered && "press hover:border-primary/40",
                      showCorrect && "border-success bg-success/[0.06]",
                      showWrong && "border-warning bg-warning/[0.06]",
                      !showCorrect && !showWrong && "border-border",
                      answered && !showCorrect && !showWrong && "opacity-60",
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

                  {/* Reasoning, shown directly beneath the correct answer */}
                  {showCorrect && (
                    <div className="ml-5 mt-2 flex gap-2 animate-fade-in">
                      <CornerDownRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 rounded-lg border border-success/30 bg-success/[0.05] p-3 text-sm leading-relaxed text-foreground">
                        <span className={cn("font-semibold", isCorrect ? "text-success" : "text-warning")}>
                          {isCorrect ? "Correct. " : "The correct answer. "}
                        </span>
                        {q.explanation}
                        {!isCorrect && (
                          <>
                            <Link
                              href={`/tutor?question=${q.id}`}
                              className="mt-2 flex items-center gap-1.5 font-medium text-primary hover:underline"
                            >
                              <Sparkles className="h-4 w-4" /> Ask the tutor why
                            </Link>
                            <SecondOpinion key={q.id} question={q} chosenIndex={selected} />
                          </>
                        )}
                        <p className="mt-2 text-2xs text-muted-foreground">
                          Based on: {sourceFor(q)} ·{" "}
                          <Link href="/sources" className="underline hover:text-foreground">
                            our sources
                          </Link>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <NavButton dir="next" onClick={goNext} disabled={!answered} finish={isLast} />
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
      aria-label={dir === "prev" ? "Previous question" : finish ? "Finish" : "Next question"}
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
  seconds,
  cpEarned,
  recap,
  onPracticeMore,
  trialNearEnd,
}: {
  correct: number;
  total: number;
  seconds: number;
  cpEarned: number;
  recap: SessionRecapData;
  onPracticeMore: () => void;
  trialNearEnd?: boolean;
}) {
  const acc = total ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="mx-auto max-w-md py-10">
      <Card className="animate-scale-in p-8 text-center">
        <p className="font-display text-4xl font-semibold tabular">
          {correct}
          <span className="text-muted-foreground">/{total}</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{acc}% accuracy this session</p>
        {cpEarned > 0 && (
          <div className="mt-3 flex justify-center">
            <Badge variant="default" className="gap-1 font-mono text-sm">
              <Zap className="h-3.5 w-3.5" /> +{cpEarned} CP
            </Badge>
          </div>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={onPracticeMore}>
            Practice more
          </Button>
          <Link href="/dashboard" className={cn(buttonVariants())}>
            Back to dashboard
          </Link>
        </div>
      </Card>
      <SessionRecap data={recap} className="mt-5" />
      {/* Conversion moment lands right here, while the session result is fresh,
          instead of ambushing the learner on their next visit. */}
      {trialNearEnd && (
        <div className="mt-5">
          <TrialEndCard compact feature="questions" />
        </div>
      )}
    </div>
  );
}
