"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CornerDownRight, RotateCw, Sparkles } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Paywall } from "@/components/app/paywall";
import { SignVisual } from "@/components/shared/sign-visual";
import { CategoryIcon } from "@/components/shared/category-icon";
import { useStudyStore } from "@/hooks/use-study-store";
import { selectFlashcardQueue } from "@/lib/plan";
import { QUESTIONS } from "@/lib/content/questions";
import { forCode } from "@/lib/content/vehicle";
import { orderByFreshness, withShuffledOptions } from "@/lib/diagnostic/select";
import { categoryName } from "@/lib/content/categories";
import { RATING_LABEL } from "@/lib/srs/sm2";
import { track } from "@/lib/analytics";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { Question, SrsRating } from "@/types";

const LETTERS = ["A", "B", "C", "D"];
const RATINGS: SrsRating[] = ["again", "good", "easy"];

/**
 * The guided first session: right after signup, instead of dropping a new
 * learner onto the raw dashboard, walk them through the product's core loop —
 * 3 real flashcards (with the spaced-repetition promise explained), 2 real
 * practice questions (with the tutor stepping in on a wrong answer), then the
 * upgrade moment. Everything here is real study: reviews and answers count.
 */
export function GuidedSession() {
  const router = useRouter();
  const { state, readiness, reviewCard, recordQuestionAttempt, recordSession, completeGuided } =
    useStudyStore();
  const startRef = React.useRef(Date.now());
  const [step, setStep] = React.useState(0); // 0 intro · 1 cards · 2 questions · 3 paywall

  const [cards] = React.useState(() => selectFlashcardQueue(state, { limit: 3 }));
  const [questions] = React.useState<Question[]>(() => {
    const focus = state.onboarding?.worryCategories?.[0] ?? readiness.weakCategories[0] ?? null;
    const bank = forCode(QUESTIONS, state.onboarding?.vehicleCode);
    const pool = focus ? bank.filter((q) => q.categoryId === focus) : bank;
    return orderByFreshness(pool.length >= 2 ? pool : bank, state.attempts)
      .slice(0, 2)
      .map(withShuffledOptions);
  });

  function finish(to: string) {
    completeGuided();
    recordSession("questions", Math.round((Date.now() - startRef.current) / 1000));
    router.push(to);
  }

  function advance(from: number) {
    track("guided_step_completed", { step: from });
    if (from + 1 === 3) track("guided_paywall_shown", { readiness: readiness.readiness });
    setStep(from + 1);
  }

  const firstName = state.profile?.name?.split(" ")[0];

  return (
    <div className="flex min-h-dvh flex-col bg-background bg-app">
      <header className="flex items-center justify-between px-6 py-5">
        <Logo />
        {step < 3 && (
          <button
            type="button"
            onClick={() => finish("/dashboard")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Skip tour
          </button>
        )}
      </header>

      {/* Progress */}
      <div className="mx-auto w-full max-w-lg px-6">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center px-6 py-8">
        <div key={step} className="w-full max-w-lg animate-fade-in">
          {step === 0 && (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-8 w-8" />
              </div>
              <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
                {firstName ? `Nice one, ${firstName}.` : "Nice one."} Your plan is live.
              </h1>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                You&apos;re at <span className="font-semibold text-primary">{readiness.readiness}% readiness</span>.
                Before you explore on your own, here&apos;s a 2-minute guided first session — the
                exact loop that gets learners to a pass.
              </p>
              <Button size="xl" className="mt-8 w-full sm:w-auto" onClick={() => advance(0)}>
                Show me <ArrowRight />
              </Button>
            </div>
          )}

          {step === 1 && <GuidedCards cards={cards} reviewCard={reviewCard} onDone={() => advance(1)} />}
          {step === 2 && (
            <GuidedQuestions
              questions={questions}
              recordQuestionAttempt={recordQuestionAttempt}
              onDone={() => advance(2)}
            />
          )}

          {step === 3 && (
            <div>
              <Paywall
                feature="guided_session"
                title="That's the loop. Ready to run it daily?"
                description={`You're at ${readiness.readiness}% readiness. The free trial gives you a taste — Premium runs this exact loop at full volume every day until you pass.`}
                cta="Unlock my full plan"
              />
              <button
                type="button"
                onClick={() => finish("/dashboard")}
                className="mx-auto mt-5 block text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Continue with the free trial for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GuidedCards({
  cards,
  reviewCard,
  onDone,
}: {
  cards: ReturnType<typeof selectFlashcardQueue>;
  reviewCard: (id: string, rating: SrsRating) => void;
  onDone: () => void;
}) {
  const [i, setI] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const card = cards[i];

  React.useEffect(() => {
    if (!card) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card]);
  if (!card) return null;

  function rate(r: SrsRating) {
    if (r === "again") haptics.error();
    else haptics.success();
    reviewCard(card.id, r);
    setFlipped(false);
    if (i + 1 >= cards.length) onDone();
    else setI(i + 1);
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">
        Step 1 · Flashcards
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
        Your memory, on a schedule
      </h1>
      <p className="mt-2 text-muted-foreground">
        Rate each card honestly — the app decides exactly when to show it again so it sticks.
        Try these {cards.length}:
      </p>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="press mt-5 flex min-h-[200px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-soft hover:border-primary/40"
      >
        <Badge variant="secondary" className="gap-1">
          <CategoryIcon id={card.categoryId} className="h-3 w-3" />
          {flipped ? "Answer" : categoryName(card.categoryId)}
        </Badge>
        {!flipped && (card.image || card.sign) && (
          <SignVisual image={card.image} sign={card.sign} alt={categoryName(card.categoryId)} className="h-16 w-16" />
        )}
        <p className={cn("text-balance leading-snug", flipped ? "text-sm" : "font-display text-lg font-semibold tracking-tight")}>
          {flipped ? card.back : card.front}
        </p>
        {!flipped && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <RotateCw className="h-3.5 w-3.5" /> Tap to reveal
          </span>
        )}
      </button>

      <div className="mt-4 min-h-[56px]">
        {flipped && (
          <div className="grid grid-cols-3 gap-2 animate-fade-in">
            {RATINGS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => rate(r)}
                className={cn(
                  "press rounded-xl border-2 bg-card py-2.5 text-sm font-semibold",
                  r === "again" && "border-danger/40 text-danger hover:bg-danger/10",
                  r === "good" && "border-primary/40 text-primary hover:bg-primary/10",
                  r === "easy" && "border-success/40 text-success hover:bg-success/10",
                )}
              >
                {RATING_LABEL[r]}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-center font-mono text-xs text-muted-foreground">
        {i + 1}/{cards.length}
      </p>
    </div>
  );
}

function GuidedQuestions({
  questions,
  recordQuestionAttempt,
  onDone,
}: {
  questions: Question[];
  recordQuestionAttempt: (a: {
    questionId: string;
    categoryId: Question["categoryId"];
    correct: boolean;
    selectedIndex: number;
    context: "practice";
  }) => void;
  onDone: () => void;
}) {
  const [i, setI] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [tutorShown, setTutorShown] = React.useState(0); // typewriter progress
  const q = questions[i];

  React.useEffect(() => {
    if (!q) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const answered = selected !== null;
  const isCorrect = answered && selected === q?.correctIndex;
  const tutorLine = q
    ? `Don't stress — this one catches a lot of learners. ${q.explanation} Whenever an answer surprises you, I'm one tap away to explain it differently.`
    : "";

  // The tutor "types" its explanation after a wrong answer — the aha moment.
  React.useEffect(() => {
    if (!answered || isCorrect) return;
    const id = window.setInterval(() => {
      setTutorShown((n) => (n >= tutorLine.length ? n : n + 3));
    }, 18);
    return () => window.clearInterval(id);
  }, [answered, isCorrect, tutorLine.length]);

  if (!q) return null;

  function choose(idx: number) {
    if (answered) return;
    if (idx === q.correctIndex) haptics.success();
    else haptics.error();
    setSelected(idx);
    recordQuestionAttempt({
      questionId: q.id,
      categoryId: q.categoryId,
      correct: idx === q.correctIndex,
      selectedIndex: idx,
      context: "practice",
    });
  }

  function next() {
    setSelected(null);
    setTutorShown(0);
    if (i + 1 >= questions.length) onDone();
    else setI(i + 1);
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">
        Step 2 · Practice
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
        Questions that explain themselves
      </h1>
      <p className="mt-2 text-muted-foreground">
        Every answer comes with the why — and the AI tutor steps in when something doesn&apos;t click.
      </p>

      <div key={q.id} className="mt-5 animate-fade-in">
        <Badge variant="secondary" className="gap-1">
          <CategoryIcon id={q.categoryId} className="h-3 w-3" /> {categoryName(q.categoryId)}
        </Badge>
        {(q.image || q.sign) && (
          <div className="mt-3">
            <SignVisual image={q.image} sign={q.sign} alt={categoryName(q.categoryId)} className="h-16 w-16" />
          </div>
        )}
        <h2 className="mt-3 text-balance font-display text-lg font-semibold leading-snug tracking-tight">
          {q.prompt}
        </h2>

        <div className="mt-4 space-y-2.5">
          {q.options.map((opt, idx) => {
            const showCorrect = answered && idx === q.correctIndex;
            const showWrong = answered && selected === idx && !isCorrect;
            return (
              <button
                key={idx}
                type="button"
                disabled={answered}
                onClick={() => choose(idx)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl border-2 bg-card p-3.5 text-left text-sm transition-all",
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
                  {showCorrect ? <Check className="h-3.5 w-3.5" /> : LETTERS[idx]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {answered && isCorrect && (
          <div className="mt-3 flex gap-2 animate-fade-in">
            <CornerDownRight className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex-1 rounded-lg border border-success/30 bg-success/[0.05] p-3 text-sm leading-relaxed">
              <span className="font-semibold text-success">Correct. </span>
              {q.explanation}
            </div>
          </div>
        )}

        {/* Wrong answer → the tutor introduces itself */}
        {answered && !isCorrect && (
          <div className="mt-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Your AI tutor
              </p>
            </div>
            <p className="mt-2 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed">
              {tutorLine.slice(0, tutorShown)}
              {tutorShown < tutorLine.length && (
                <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-primary/60 align-middle" />
              )}
            </p>
          </div>
        )}

        {answered && (
          <Button size="lg" className="mt-5 w-full" onClick={next}>
            {i + 1 >= questions.length ? "Finish the tour" : "Next question"} <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
