"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X, RotateCw, CheckCircle2, Sparkles, PartyPopper, Zap, Mic, MicOff } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSpeechInput } from "@/hooks/use-speech-input";
import { SpeakButton } from "@/components/study/speak-button";
import { EmptyState } from "@/components/ui/empty-state";
import { SessionProgress } from "@/components/ui/session-progress";
import { Paywall } from "@/components/app/paywall";
import { TrialEndCard } from "@/components/app/trial-end-card";
import { TrialMeter } from "@/components/app/trial-meter";
import { SignVisual, SignPreload } from "@/components/shared/sign-visual";
import { CategoryIcon } from "@/components/shared/category-icon";
import { SessionRecap } from "@/components/study/session-recap";
import { NextStepCard } from "@/components/study/next-step-card";
import { useStudyStore } from "@/hooks/use-study-store";
import { countDueTomorrow } from "@/lib/plan";
import { nextStepAfterFlashcards, type CategoryMisses } from "@/lib/learning/next-step";
import { selectFlashcardQueue } from "@/lib/plan.queue";
import { useContentPool } from "@/components/content/content-provider";
import type { SessionRecapData } from "@/lib/ai/coach";
import { STUDY_SESSION_SIZE } from "@/lib/billing/plans";
import { initialCardState, isLeech, previewIntervals, RATING_LABEL } from "@/lib/srs/sm2";
import { categoryName } from "@/lib/content/categories";
import { haptics } from "@/lib/haptics";
import { formatDuration, cn } from "@/lib/utils";
import type { CategoryId, SrsRating } from "@/types";

const RATING_ORDER: SrsRating[] = ["again", "hard", "good", "easy"];
const RATING_STYLE: Record<SrsRating, string> = {
  again: "border-danger/40 text-danger hover:bg-danger/10",
  hard: "border-warning/40 text-warning hover:bg-warning/10",
  good: "border-primary/40 text-primary hover:bg-primary/10",
  easy: "border-success/40 text-success hover:bg-success/10",
};

export function FlashcardDeck() {
  const sp = useSearchParams();
  const categoryParam = (sp.get("category") as CategoryId | null) ?? undefined;
  const { state, reviewCard, recordSession, usageFor } = useStudyStore();
  const { flashcards, full } = useContentPool();

  const cap = usageFor("flashcards");
  const remaining = Number.isFinite(cap.cap) ? Math.max(0, cap.cap - cap.used) : Infinity;
  // One session is at most STUDY_SESSION_SIZE cards; the daily cap allows N sessions.
  const sessionLimit = Math.min(remaining, STUDY_SESSION_SIZE);

  const [queue, setQueue] = React.useState(() =>
    selectFlashcardQueue(flashcards, state, {
      categoryId: categoryParam,
      limit: sessionLimit,
    }),
  );
  const startRef = React.useRef(Date.now());
  const cpStartRef = React.useRef(state.cp);
  const [i, setI] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [reviewed, setReviewed] = React.useState(0);
  // Synchronous double-tap lock for the rating row. Flipping the row away
  // stops a mouse double-click, but same-tick bursts (a stuck pointer,
  // keyboard repeat, assistive-tech activation) land before any re-render —
  // each would advance SM-2 twice, double the CP and burn two of the daily
  // allowance for one review. Same pattern as question-practice.tsx and
  // diagnostic-runner.tsx, which document the full failure mode.
  const rating = React.useRef(false);
  React.useEffect(() => {
    // Release the lock once the next card has rendered.
    rating.current = false;
  }, [i]);
  const [againCount, setAgainCount] = React.useState(0);
  // "Again" ratings by category — a cluster in one category is the follow-up
  // recommendation on the completion screen.
  const [againByCat, setAgainByCat] = React.useState<CategoryMisses>({});

  /**
   * The full deck arrives after mount, so a queue built while the pool is still
   * the bundled starter pack silently omits every card outside it — including
   * cards that are genuinely due. That renders "All caught up!" to a learner
   * with reviews waiting, which is the one thing a spaced-repetition product
   * must never say wrongly: they close the app and the schedule slips.
   *
   * Rebuild once when the pool upgrades, and only before the first review, so
   * nobody loses their place mid-session.
   */
  const builtFromFullDeck = React.useRef(full);
  React.useEffect(() => {
    if (!full || builtFromFullDeck.current || reviewed > 0) return;
    builtFromFullDeck.current = true;
    setQueue(selectFlashcardQueue(flashcards, state, { categoryId: categoryParam, limit: sessionLimit }));
    setI(0);
    setFlipped(false);
    // Rebuilding on anything but the pool upgrade would reshuffle the session
    // under the learner as their own review history changes it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  // Start a fresh session in place. "Review more" used to be a link back to
  // this same route, but navigating to the URL you're already on doesn't
  // remount the deck — so it looked dead. Rebuild the queue from current state
  // (reviewed cards now carry future due dates; unseen cards remain) and reset
  // the per-session counters instead.
  function restart() {
    setQueue(selectFlashcardQueue(flashcards, state, { categoryId: categoryParam, limit: sessionLimit }));
    startRef.current = Date.now();
    cpStartRef.current = state.cp;
    setI(0);
    setFlipped(false);
    setReviewed(0);
    setAgainCount(0);
    setAgainByCat({});
    setAttempt("");
  }
  // Active recall: the learner commits to an answer (typed or dictated) before
  // the reveal, so the self-rating is honest. Always optional — never a gate.
  const [attempt, setAttempt] = React.useState("");
  const speech = useSpeechInput((t) => setAttempt((a) => (a ? `${a} ${t}` : t)));

  // Trial (free) or daily (paid) allowance used up — the conversion moment.
  if (Number.isFinite(cap.cap) && cap.used >= cap.cap) {
    return (
      <div className="mx-auto max-w-md py-10">
        {state.tier === "free" ? (
          <TrialEndCard feature="flashcards" />
        ) : (
          <Paywall
            feature="flashcards"
            plan="premium_plus"
            title="You've hit today's flashcards"
            description="Your plan's daily flashcard sessions are done — they reset tomorrow. Premium Plus removes the limit entirely."
            cta="See Premium Plus"
          />
        )}
      </div>
    );
  }

  if (queue.length === 0) {
    return <CaughtUp categoryParam={categoryParam} />;
  }

  if (i >= queue.length) {
    const seconds = Math.round((Date.now() - startRef.current) / 1000);
    return (
      <Completion
        reviewed={reviewed}
        seconds={seconds}
        cpEarned={state.cp - cpStartRef.current}
        onReviewMore={restart}
        trialNearEnd={state.tier === "free" && Number.isFinite(cap.cap) && cap.cap - cap.used <= 2}
        againByCategory={againByCat}
        recap={{
          mode: "flashcards",
          total: reviewed,
          seconds,
          againCount,
          dueTomorrow: countDueTomorrow(state),
        }}
      />
    );
  }

  const card = queue[i];
  const cardState = state.cardStates[card.id] ?? initialCardState(card.id);
  const intervals = previewIntervals(cardState);

  function rate(ratingKind: SrsRating) {
    if (rating.current) return;
    rating.current = true;
    // "Again" is the one rating that means the recall failed — everything else
    // is a successful review, however hard it felt.
    if (ratingKind === "again") haptics.error();
    else haptics.success();
    reviewCard(card.id, ratingKind);
    setReviewed((r) => r + 1);
    if (ratingKind === "again") {
      setAgainCount((n) => n + 1);
      setAgainByCat((prev) => ({
        ...prev,
        [card.categoryId]: (prev[card.categoryId] ?? 0) + 1,
      }));
    }
    setFlipped(false);
    setAttempt("");
    const nextI = i + 1;
    if (nextI >= queue.length) {
      haptics.celebrate();
      recordSession("flashcards", Math.round((Date.now() - startRef.current) / 1000));
    }
    setI(nextI);
  }

  function reveal() {
    haptics.tap();
    setFlipped(true);
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/study" className="text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="h-5 w-5" />
        </Link>
        {/* Reviewed or not, never right or wrong: an "Again" rating is honest
            recall data, not a mistake to mark in red. */}
        <SessionProgress
          completed={i}
          total={queue.length}
          index={i}
          outcomes={queue.map((_, idx) => (idx < i ? "done" : "pending"))}
        />
        <span className="font-mono text-xs text-muted-foreground">{i + 1}/{queue.length}</span>
      </div>

      <TrialMeter feature="flashcards" className="mt-3" />

      {/* Card */}
      <div className="perspective relative mt-8">
        {/* Speaker sits above the flip surface so it doesn't trigger a flip;
            reads whichever side is showing. */}
        <div className="absolute right-3 top-3 z-10">
          <SpeakButton
            text={flipped ? card.back : card.front}
            label={flipped ? "Read the answer aloud" : "Read the card aloud"}
          />
        </div>
        {/* Both faces share one grid cell, so the card sizes to the taller of
            the two rather than a hard-coded 340px: short cards stop carrying
            dead space, and a long answer can't overflow its face. Sizing to the
            taller face (not the visible one) also means the box doesn't resize
            mid-flip. The floor keeps small cards from feeling flimsy. */}
        <div
          className={cn(
            "relative grid min-h-[17rem] w-full transition-transform duration-500 [transform-style:preserve-3d]",
            flipped && "rotate-y-180",
          )}
        >
          {/* Front */}
          <button
            type="button"
            onClick={reveal}
            className="press col-start-1 row-start-1 flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-soft backface-hidden"
          >
            <Badge variant="secondary" className="gap-1">
              <CategoryIcon id={card.categoryId} className="h-3 w-3" /> {categoryName(card.categoryId)}
            </Badge>
            {(card.image || card.sign) && <SignVisual image={card.image} sign={card.sign} alt={categoryName(card.categoryId)} className="h-24 w-24" priority />}
            <SignPreload image={queue[i + 1]?.image} />
            <p className="font-display text-xl font-semibold leading-snug tracking-tight text-balance">
              {card.front}
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <RotateCw className="h-3.5 w-3.5" /> Tap to reveal
            </span>
          </button>

          {/* Back */}
          <div className="col-start-1 row-start-1 flex flex-col rounded-2xl border border-primary/20 bg-card p-8 shadow-soft backface-hidden rotate-y-180">
            <Badge variant="secondary" className="w-fit gap-1">
              <CategoryIcon id={card.categoryId} className="h-3 w-3" /> Answer
            </Badge>
            {attempt.trim() && (
              <div className="mt-3 rounded-lg bg-muted/60 px-3 py-2">
                <p className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Your answer
                </p>
                <p className="mt-0.5 text-sm text-foreground">{attempt}</p>
              </div>
            )}
            <p className="mt-4 flex-1 text-lg leading-relaxed text-foreground">{card.back}</p>
            {/* A leech has been forgotten six times. Showing the same prompt a
                seventh time is not the answer — say so, and point at the one
                thing that might actually shift it. */}
            {isLeech(cardState) && (
              <p className="mt-3 rounded-lg border border-warning/30 bg-warning/[0.06] px-3 py-2 text-xs leading-relaxed text-foreground">
                This one keeps slipping — you&apos;ve forgotten it {cardState.lapses} times.
                Repeating it won&apos;t help much; ask for a different angle or a memory trick.
              </p>
            )}
            <Link
              href={`/tutor?card=${card.id}`}
              className="mt-3 inline-flex w-fit items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Sparkles className="h-3.5 w-3.5" />{" "}
              {isLeech(cardState)
                ? "Give me a memory trick for this"
                : "Ask the tutor to explain this"}
            </Link>
          </div>
        </div>
      </div>

      {/* Rating row */}
      <div className="mt-6 min-h-[76px]">
        {flipped ? (
          <div className="grid grid-cols-4 gap-2 animate-fade-in">
            {RATING_ORDER.map((r) => (
              <button
                key={r}
                onClick={() => rate(r)}
                className={cn(
                  "press flex flex-col items-center gap-0.5 rounded-xl border-2 bg-card py-3",
                  RATING_STYLE[r],
                )}
              >
                <span className="text-sm font-semibold">{RATING_LABEL[r]}</span>
                <span className="font-mono text-2xs text-muted-foreground">{intervals[r]}</span>
              </button>
            ))}
          </div>
        ) : (
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              reveal();
            }}
          >
            <div className="flex items-center gap-2">
              <Input
                value={attempt}
                onChange={(e) => setAttempt(e.target.value)}
                placeholder="Answer in your own words first (optional)"
                className="flex-1"
              />
              {speech.supported && (
                <Button
                  type="button"
                  variant={speech.listening ? "default" : "outline"}
                  size="icon"
                  onClick={speech.toggle}
                  aria-label={speech.listening ? "Stop listening" : "Say your answer"}
                >
                  {speech.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
            </div>
            <Button type="submit" size="lg" className="w-full">
              Reveal answer
            </Button>
          </form>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Rate honestly — it sets when you&apos;ll see this card again.
      </p>
    </div>
  );
}

function CaughtUp({ categoryParam }: { categoryParam?: CategoryId }) {
  return (
    <div className="mx-auto max-w-md py-10">
      <EmptyState
        icon={<CheckCircle2 className="h-6 w-6" />}
        title="All caught up!"
        description={
          categoryParam
            ? "No cards due in this category right now. Spaced repetition will resurface them when it's time."
            : "No flashcards are due right now. Come back later, or drill a specific weak area."
        }
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/study/questions" className={cn(buttonVariants({ variant: "outline" }))}>
              Practice questions
            </Link>
            <Link href="/dashboard" className={cn(buttonVariants())}>
              Dashboard
            </Link>
          </div>
        }
      />
    </div>
  );
}

function Completion({
  reviewed,
  seconds,
  cpEarned,
  recap,
  onReviewMore,
  trialNearEnd,
  againByCategory,
}: {
  reviewed: number;
  seconds: number;
  cpEarned: number;
  recap: SessionRecapData;
  onReviewMore: () => void;
  trialNearEnd?: boolean;
  /** "Again" ratings by category this session — feeds the follow-up. */
  againByCategory: CategoryMisses;
}) {
  // A cluster of "Again" ratings in one category is a real signal; anything
  // less and the session needs no prescription.
  const nextStep = nextStepAfterFlashcards({ againByCategory });
  return (
    <div className="mx-auto max-w-md py-10">
      <EmptyState
        icon={<PartyPopper className="h-7 w-7" />}
        title="Session complete"
        description={`You reviewed ${reviewed} ${reviewed === 1 ? "card" : "cards"} in ${formatDuration(seconds)}. Your mastery and readiness just moved.`}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant={nextStep ? "outline" : "default"} onClick={onReviewMore}>
              Review more
            </Button>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: nextStep ? "outline" : "default" }))}
            >
              Dashboard
            </Link>
          </div>
        }
        className="animate-scale-in"
      />
      {cpEarned > 0 && (
        <div className="mt-4 flex justify-center">
          <Badge variant="default" className="gap-1 font-mono text-sm">
            <Zap className="h-3.5 w-3.5" /> +{cpEarned} CP
          </Badge>
        </div>
      )}
      {nextStep && (
        <NextStepCard
          className="mt-5"
          title={nextStep.title}
          body={nextStep.body}
          href={nextStep.href}
          cta={nextStep.cta}
        />
      )}
      <SessionRecap data={recap} className="mt-5" />
      {/* Conversion moment lands right here, while the session result is fresh. */}
      {trialNearEnd && (
        <div className="mt-5">
          <TrialEndCard compact feature="flashcards" />
        </div>
      )}
    </div>
  );
}
