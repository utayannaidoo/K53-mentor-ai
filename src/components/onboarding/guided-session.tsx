"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CheckCircle2, CornerDownRight, RotateCw } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignVisual } from "@/components/shared/sign-visual";
import { CategoryIcon } from "@/components/shared/category-icon";
import { NaviAvatar } from "@/components/shared/navi-avatar";
import { useStudyStore } from "@/hooks/use-study-store";
import { forCode } from "@/lib/content/vehicle";
import { useContentPool } from "@/components/content/content-provider";
import { studyCodeOf } from "@/lib/billing/plans";
import { orderByFreshness, withShuffledOptions } from "@/lib/diagnostic/select";
import { categoryName } from "@/lib/content/categories";
import { track } from "@/lib/analytics";
import { haptics } from "@/lib/haptics";
import { cn, glassFloat, glassSubtle } from "@/lib/utils";
import type { Flashcard, Question } from "@/types";

const LETTERS = ["A", "B", "C", "D"];

/**
 * Learners who defer the starting check get a tiny, real study loop: one
 * question and one flashcard, then Navi opens the Study menu. The first answer
 * therefore has a purpose — it demonstrates how the app adapts — without
 * pretending one answer is a readiness score.
 */
export function GuidedSession() {
  const router = useRouter();
  const {
    state,
    recordQuestionAttempt,
    reviewCard,
    recordSession,
    completeGuided,
    completeFirstRunTour,
  } = useStudyStore();
  const { questions: questionBank, flashcards: flashcardBank } = useContentPool();
  const startRef = React.useRef(Date.now());
  const completedRef = React.useRef(false);
  const [step, setStep] = React.useState(0); // intro · question · flashcard · study tour

  const [question] = React.useState<Question | null>(() => {
    const bank = forCode(questionBank, studyCodeOf(state));
    const fresh = orderByFreshness(bank, state.attempts)[0];
    return fresh ? withShuffledOptions(fresh) : null;
  });

  const [flashcard] = React.useState<Flashcard | null>(() => {
    const bank = forCode(flashcardBank, studyCodeOf(state));
    return bank[0] ?? null;
  });

  function goToToday() {
    completeGuided();
    completeFirstRunTour();
    router.push("/dashboard");
  }

  function completeQuestion() {
    recordSession("questions", Math.max(1, Math.round((Date.now() - startRef.current) / 1000)));
    setStep(2);
  }

  function completePractice() {
    if (completedRef.current) return;
    completedRef.current = true;
    recordSession("flashcards", Math.max(1, Math.round((Date.now() - startRef.current) / 1000)));
    track("guided_practice_completed", { questions: 1, flashcards: 1 });
    setStep(3);
  }

  function goToStudyTour() {
    completeGuided();
    router.push("/study?tour=1");
  }

  const firstName = state.profile?.name?.split(" ")[0];

  return (
    <div className="flex min-h-dvh flex-col bg-background bg-app">
      <header className="flex items-center justify-between px-6 py-5">
        <Logo />
        {step < 3 && (
          <Button variant="ghost" size="sm" onClick={goToToday} className="text-muted-foreground">
            Go to Today
          </Button>
        )}
      </header>

      <div className="mx-auto w-full max-w-lg px-6">
        <div
          role="progressbar"
          aria-label="First practice progress"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={step + 1}
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-glass"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center px-6 py-8">
        <div key={step} className="w-full max-w-lg animate-fade-in">
          {step === 0 && (
            <div className="text-center">
              <NaviAvatar priority className="mx-auto h-20 w-20" />
              <h1 className="mt-6 text-balance font-display text-3xl font-semibold tracking-tight">
                {firstName ? `Your plan is live, ${firstName}` : "Your plan is live"}
              </h1>
              <p className="mx-auto mt-3 max-w-md text-balance text-muted-foreground">
                Navi will take you through one real question and one flashcard. You&apos;ll see how
                practice works, while your readiness stays unmeasured until the starting check.
              </p>
              <Button size="xl" className="mt-8 w-full sm:w-auto" onClick={() => setStep(1)}>
                Start a quick practice preview <ArrowRight />
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">About 2 minutes</p>
            </div>
          )}

          {step === 1 && (
            question ? (
              <GuidedQuestion
                question={question}
                recordQuestionAttempt={recordQuestionAttempt}
                onDone={completeQuestion}
              />
            ) : (
              <div className={cn(glassFloat, "rounded-2xl border p-6 text-center")}>
                <h1 className="font-display text-2xl font-semibold tracking-tight">
                  Your plan is ready
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We couldn&apos;t load a starter question on this device, but your full study plan is
                  available now.
                </p>
                <Button size="lg" className="mt-6 w-full" onClick={goToStudyTour}>
                  Explore Study <ArrowRight />
                </Button>
              </div>
            )
          )}

          {step === 2 && (
            flashcard ? (
              <GuidedFlashcard flashcard={flashcard} reviewCard={reviewCard} onDone={completePractice} />
            ) : (
              <div className={cn(glassFloat, "rounded-2xl border p-6 text-center")}>
                <h1 className="font-display text-2xl font-semibold tracking-tight">Your Study menu is ready</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We couldn&apos;t load a starter flashcard on this device, but Navi can still show you every study mode.
                </p>
                <Button size="lg" className="mt-6 w-full" onClick={goToStudyTour}>
                  Explore Study with Navi <ArrowRight />
                </Button>
              </div>
            )
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/12 text-success">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="mt-6 text-balance font-display text-3xl font-semibold tracking-tight">
                That&apos;s your study loop
              </h1>
              <p className="mx-auto mt-3 max-w-md text-balance text-muted-foreground">
                Answer, understand why, recall it, then rate it. Your first practice data is saved;
                now Navi will show you exactly where each study tool lives.
              </p>
              <div className={cn(glassSubtle, "mx-auto mt-6 max-w-sm rounded-xl border px-4 py-3 text-sm")}>
                Your first question and flashcard have been saved to your progress.
              </div>
              <Button size="xl" className="mt-6 w-full sm:w-auto" onClick={goToStudyTour}>
                Explore Study with Navi <ArrowRight />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function GuidedQuestion({
  question,
  recordQuestionAttempt,
  onDone,
}: {
  question: Question;
  recordQuestionAttempt: (attempt: {
    questionId: string;
    categoryId: Question["categoryId"];
    correct: boolean;
    selectedIndex: number;
    context: "practice";
    ms?: number;
  }) => void;
  onDone: () => void;
}) {
  const [selected, setSelected] = React.useState<number | null>(null);
  const startedAt = React.useRef(Date.now());
  const answered = selected !== null;
  const isCorrect = answered && selected === question.correctIndex;

  function choose(index: number) {
    if (answered) return;
    if (index === question.correctIndex) haptics.success();
    else haptics.error();
    setSelected(index);
    recordQuestionAttempt({
      questionId: question.id,
      categoryId: question.categoryId,
      correct: index === question.correctIndex,
      selectedIndex: index,
      context: "practice",
      ms: Math.max(0, Date.now() - startedAt.current),
    });
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">Your first question</p>
      <h1 className="mt-2 text-balance font-display text-2xl font-semibold tracking-tight">
        Learn from every answer
      </h1>
      <p className="mt-2 text-muted-foreground">
        Pick the answer you think is right. You&apos;ll always see the explanation.
      </p>

      <div className="mt-5">
        <Badge variant="secondary" className="gap-1">
          <CategoryIcon id={question.categoryId} className="h-3 w-3" />
          {categoryName(question.categoryId)}
        </Badge>
        {(question.image || question.sign) && (
          <div className="mt-3">
            <SignVisual image={question.image} sign={question.sign} alt={categoryName(question.categoryId)} className="h-24 w-24" detail={question.imageDetail} priority />
          </div>
        )}
        <h2 className="mt-3 text-balance font-display text-lg font-semibold leading-snug tracking-tight">
          {question.prompt}
        </h2>

        <div className="mt-4 space-y-2.5">
          {question.options.map((option, index) => {
            const showCorrect = answered && index === question.correctIndex;
            const showWrong = answered && selected === index && !isCorrect;
            return (
              <button
                key={index}
                type="button"
                disabled={answered}
                onClick={() => choose(index)}
                className={cn(
                  "flex min-h-12 w-full items-center gap-2.5 rounded-xl border-2 bg-card p-3.5 text-left text-sm transition-colors duration-200 ease-soft",
                  !answered && "press hover:border-primary/40",
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
                  {showCorrect ? <Check className="h-3.5 w-3.5" /> : LETTERS[index]}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-3 animate-fade-in">
            <div className={cn(glassSubtle, "flex gap-2 rounded-xl border p-3 text-sm leading-relaxed")}>
              <CornerDownRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                <span className={cn("font-semibold", isCorrect ? "text-success" : "text-warning")}>
                  {isCorrect ? "Correct. " : "Not quite. "}
                </span>
                {question.explanation}
              </p>
            </div>
            <Button size="lg" className="mt-5 w-full" onClick={onDone}>
              Finish first practice <ArrowRight />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function GuidedFlashcard({
  flashcard,
  reviewCard,
  onDone,
}: {
  flashcard: Flashcard;
  reviewCard: (cardId: string, rating: "again" | "good") => void;
  onDone: () => void;
}) {
  const [revealed, setRevealed] = React.useState(false);
  const ratedRef = React.useRef(false);

  function rate(rating: "again" | "good") {
    if (ratedRef.current) return;
    ratedRef.current = true;
    if (rating === "good") haptics.success();
    else haptics.error();
    reviewCard(flashcard.id, rating);
    onDone();
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">Your first flashcard</p>
      <h1 className="mt-2 text-balance font-display text-2xl font-semibold tracking-tight">
        Recall first, then rate it
      </h1>
      <p className="mt-2 text-muted-foreground">
        Flashcards use your own judgement to decide when an idea should return. Try to answer before you reveal it.
      </p>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => setRevealed(true)}
          disabled={revealed}
          className={cn(
            glassFloat,
            "press flex min-h-60 w-full flex-col items-center justify-center rounded-2xl border p-6 text-center",
            !revealed && "hover:border-primary/40",
          )}
        >
          <Badge variant="secondary" className="gap-1">
            <CategoryIcon id={flashcard.categoryId} className="h-3 w-3" /> {categoryName(flashcard.categoryId)}
          </Badge>
          {(flashcard.image || flashcard.sign) && (
            <SignVisual
              image={flashcard.image}
              sign={flashcard.sign}
              alt={categoryName(flashcard.categoryId)}
              className="mt-4 h-24 w-24"
              priority
            />
          )}
          <p className="mt-4 font-display text-xl font-semibold leading-snug tracking-tight">
            {revealed ? flashcard.back : flashcard.front}
          </p>
          {!revealed && (
            <span className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <RotateCw className="h-3.5 w-3.5" /> Tap to reveal
            </span>
          )}
        </button>

        {revealed && (
          <div className="mt-4 animate-fade-in">
            <p className="text-center text-sm text-muted-foreground">How did that feel to recall?</p>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <Button type="button" variant="outline" onClick={() => rate("again")}>
                Needs another look
              </Button>
              <Button type="button" onClick={() => rate("good")}>
                Got it <Check />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
