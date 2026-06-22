"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X, RotateCw, CheckCircle2, Sparkles, PartyPopper } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Paywall } from "@/components/app/paywall";
import { SignVisual } from "@/components/shared/sign-visual";
import { CategoryIcon } from "@/components/shared/category-icon";
import { useStudyStore } from "@/hooks/use-study-store";
import { selectFlashcardQueue } from "@/lib/plan";
import { initialCardState, previewIntervals, RATING_LABEL } from "@/lib/srs/sm2";
import { categoryName } from "@/lib/content/categories";
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

  const cap = usageFor("flashcards");
  const remaining = Number.isFinite(cap.cap) ? Math.max(0, cap.cap - cap.used) : Infinity;

  const [queue] = React.useState(() =>
    selectFlashcardQueue(state, {
      categoryId: categoryParam,
      limit: Number.isFinite(remaining) ? remaining : undefined,
    }),
  );
  const startRef = React.useRef(Date.now());
  const [i, setI] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [reviewed, setReviewed] = React.useState(0);

  // Daily cap reached (free tier).
  if (Number.isFinite(cap.cap) && cap.used >= cap.cap) {
    return (
      <div className="mx-auto max-w-md py-10">
        <Paywall
          title="You've hit today's free flashcards"
          description={`The free plan includes ${cap.cap} flashcards a day. Upgrade to Premium for unlimited spaced-repetition review.`}
          cta="Go unlimited"
        />
      </div>
    );
  }

  if (queue.length === 0) {
    return <CaughtUp categoryParam={categoryParam} />;
  }

  if (i >= queue.length) {
    return <Completion reviewed={reviewed} seconds={Math.round((Date.now() - startRef.current) / 1000)} />;
  }

  const card = queue[i];
  const cardState = state.cardStates[card.id] ?? initialCardState(card.id);
  const intervals = previewIntervals(cardState);

  function rate(rating: SrsRating) {
    reviewCard(card.id, rating);
    setReviewed((r) => r + 1);
    setFlipped(false);
    const nextI = i + 1;
    if (nextI >= queue.length) {
      recordSession("flashcards", Math.round((Date.now() - startRef.current) / 1000));
    }
    setI(nextI);
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/study" className="text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="h-5 w-5" />
        </Link>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${(i / queue.length) * 100}%` }} />
        </div>
        <span className="font-mono text-xs text-muted-foreground">{i + 1}/{queue.length}</span>
      </div>

      {/* Card */}
      <div className="perspective mt-8">
        <div
          className={cn(
            "relative w-full transition-transform duration-500 [transform-style:preserve-3d]",
            flipped && "rotate-y-180",
          )}
          style={{ minHeight: 340 }}
        >
          {/* Front */}
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-soft backface-hidden"
          >
            <Badge variant="secondary" className="gap-1">
              <CategoryIcon id={card.categoryId} className="h-3 w-3" /> {categoryName(card.categoryId)}
            </Badge>
            {(card.image || card.sign) && <SignVisual image={card.image} sign={card.sign} alt={categoryName(card.categoryId)} className="h-24 w-24" />}
            <p className="font-display text-xl font-semibold leading-snug tracking-tight text-balance">
              {card.front}
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <RotateCw className="h-3.5 w-3.5" /> Tap to reveal
            </span>
          </button>

          {/* Back */}
          <div className="absolute inset-0 flex flex-col rounded-2xl border border-primary/20 bg-card p-8 shadow-soft backface-hidden rotate-y-180">
            <Badge variant="secondary" className="w-fit gap-1">
              <CategoryIcon id={card.categoryId} className="h-3 w-3" /> Answer
            </Badge>
            <p className="mt-4 flex-1 text-lg leading-relaxed text-foreground">{card.back}</p>
            <Link
              href={`/tutor?card=${card.id}`}
              className="mt-3 inline-flex w-fit items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Sparkles className="h-3.5 w-3.5" /> Ask the tutor to explain this
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
                  "flex flex-col items-center gap-0.5 rounded-xl border-2 bg-card py-3 transition-colors",
                  RATING_STYLE[r],
                )}
              >
                <span className="text-sm font-semibold">{RATING_LABEL[r]}</span>
                <span className="font-mono text-2xs text-muted-foreground">{intervals[r]}</span>
              </button>
            ))}
          </div>
        ) : (
          <Button size="lg" className="w-full" onClick={() => setFlipped(true)}>
            Reveal answer
          </Button>
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
          <div className="flex gap-3">
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

function Completion({ reviewed, seconds }: { reviewed: number; seconds: number }) {
  return (
    <div className="mx-auto max-w-md py-10">
      <EmptyState
        icon={<PartyPopper className="h-7 w-7" />}
        title="Session complete"
        description={`You reviewed ${reviewed} ${reviewed === 1 ? "card" : "cards"} in ${formatDuration(seconds)}. Your mastery and readiness just moved.`}
        action={
          <div className="flex gap-3">
            <Link href="/study/flashcards" className={cn(buttonVariants({ variant: "outline" }))}>
              Review more
            </Link>
            <Link href="/dashboard" className={cn(buttonVariants())}>
              Dashboard
            </Link>
          </div>
        }
        className="animate-scale-in"
      />
    </div>
  );
}
