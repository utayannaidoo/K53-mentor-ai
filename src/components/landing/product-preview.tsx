"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, CornerDownRight, RotateCw, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SignVisual } from "@/components/shared/sign-visual";
import { signImg } from "@/lib/content/signs";
import { useDataSaver } from "@/hooks/use-data-saver";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * "Try it" section: a self-contained, clickable slice of the real product —
 * no store, no API, hardcoded demo content. The hero card shows the outcome;
 * this proves the mechanics feel good before asking for a signup.
 */

const LETTERS = ["A", "B", "C", "D"];

// Real bank content (q_sign_yield), copied so this stays dependency-free.
const DEMO_QUESTION = {
  image: signImg("yield"),
  prompt: "This triangular sign with the point facing down means:",
  options: [
    "Stop completely before the line",
    "Yield — give right of way to other traffic and pedestrians",
    "No entry for any vehicle",
    "You have right of way",
  ],
  correctIndex: 1,
  explanation:
    "A yield (give-way) sign means you do not have to stop if the way is clear, but you must give right of way to crossing traffic and pedestrians and be ready to stop.",
};

const DEMO_CARD = {
  front: "What is the minimum following distance under the two-second rule?",
  back: "At least 2 seconds behind the vehicle ahead in dry conditions — double it to 4 seconds in rain or poor visibility.",
};

const DEMO_TUTOR_Q = "Why did I get the yield sign question wrong?";
const DEMO_TUTOR_A =
  "Good question! A yield sign doesn't always mean stop — that's the trap. It means give right of way: slow down, and only stop if crossing traffic or pedestrians make it necessary. Examiners love testing the stop-vs-yield difference, so let's drill a few more of these.";

type Tab = "practice" | "flashcard" | "tutor";

export function ProductPreview() {
  const [tab, setTab] = React.useState<Tab>("practice");
  const interacted = React.useRef(false);

  function noteInteraction(t: Tab) {
    if (interacted.current) return;
    interacted.current = true;
    track("landing_preview_interacted", { tab: t });
  }

  return (
    <section className="px-6 py-20 sm:py-24">
      {/* Mobile: centered stack. Desktop: copy + controls left, live demo right,
          so the whole moment fits one screen instead of a tall column. */}
      <div className="mx-auto max-w-[1120px] text-center lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12 lg:text-left">
        <div className="lg:flex lg:flex-col lg:items-start">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Try it now</p>
          <h2 className="mt-2 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            This is what studying feels like
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground lg:mx-0">
            No signup needed — answer a real K53 question, flip a flashcard, ask the AI tutor.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
            <Chip active={tab === "practice"} onClick={() => setTab("practice")}>
              Practice question
            </Chip>
            <Chip active={tab === "flashcard"} onClick={() => setTab("flashcard")}>
              Flashcard
            </Chip>
            <Chip active={tab === "tutor"} onClick={() => setTab("tutor")}>
              AI tutor
            </Chip>
          </div>

          <div className="hidden lg:mt-10 lg:block">
            <Link href="/onboarding" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
              Start free assessment <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-2 text-xs text-muted-foreground">Free · no credit card · 5 minutes</p>
          </div>
        </div>

        <div>
          {/* Device-ish frame */}
          <div
            key={tab}
            className="glass-2 mx-auto mt-6 w-full max-w-md animate-fade-in rounded-2xl border border-border p-5 text-left shadow-[0_24px_60px_-24px_hsl(var(--shadow)/0.4)] sm:p-6 lg:mt-0 lg:ml-auto lg:mr-0"
          >
            {tab === "practice" && <DemoQuestion onInteract={() => noteInteraction("practice")} />}
            {tab === "flashcard" && <DemoFlashcard onInteract={() => noteInteraction("flashcard")} />}
            {tab === "tutor" && <DemoTutor onInteract={() => noteInteraction("tutor")} />}
          </div>

          <div className="lg:hidden">
            <Link href="/onboarding" className={cn(buttonVariants({ size: "lg" }), "mt-8 gap-2")}>
              Start free assessment <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-2 text-xs text-muted-foreground">Free · no credit card · 5 minutes</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoQuestion({ onInteract }: { onInteract: () => void }) {
  const [selected, setSelected] = React.useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === DEMO_QUESTION.correctIndex;

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          Road signs
        </span>
        {/* Readiness ticks up the moment you answer — the core loop in one glance. */}
        <div className="flex items-center gap-2">
          <span className="text-2xs text-muted-foreground">Readiness</span>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
              style={{ width: answered ? (isCorrect ? "72%" : "66%") : "64%" }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <SignVisual image={DEMO_QUESTION.image} alt="Yield sign" className="h-16 w-16" />
      </div>
      <p className="mt-3 font-display text-lg font-semibold leading-snug tracking-tight">
        {DEMO_QUESTION.prompt}
      </p>

      <div className="mt-4 space-y-2.5">
        {DEMO_QUESTION.options.map((opt, idx) => {
          const isThis = selected === idx;
          const showCorrect = answered && idx === DEMO_QUESTION.correctIndex;
          const showWrong = answered && isThis && !isCorrect;
          return (
            <button
              key={idx}
              type="button"
              disabled={answered}
              onClick={() => {
                onInteract();
                setSelected(idx);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl border-2 bg-card p-3 text-left text-sm transition-all",
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
                {showCorrect ? <Check className="h-3.5 w-3.5" /> : LETTERS[idx]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-3 flex gap-2 animate-fade-in">
          <CornerDownRight className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="flex-1 rounded-lg border border-success/30 bg-success/[0.05] p-3 text-sm leading-relaxed">
            <span className={cn("font-semibold", isCorrect ? "text-success" : "text-warning")}>
              {isCorrect ? "Correct. " : "The correct answer. "}
            </span>
            {DEMO_QUESTION.explanation}
          </div>
        </div>
      )}
    </div>
  );
}

function DemoFlashcard({ onInteract }: { onInteract: () => void }) {
  const [flipped, setFlipped] = React.useState(false);
  const [rated, setRated] = React.useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          onInteract();
          setFlipped((f) => !f);
        }}
        className="flex min-h-[190px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/40"
      >
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          {flipped ? "Answer" : "Following distance"}
        </span>
        <p
          className={cn(
            "text-balance leading-snug",
            flipped ? "text-sm text-foreground" : "font-display text-lg font-semibold tracking-tight",
          )}
        >
          {flipped ? DEMO_CARD.back : DEMO_CARD.front}
        </p>
        {!flipped && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <RotateCw className="h-3.5 w-3.5" /> Tap to reveal
          </span>
        )}
      </button>

      <div className="mt-4 min-h-[64px]">
        {flipped && !rated && (
          <div className="grid grid-cols-3 gap-2 animate-fade-in">
            {(
              [
                ["Again", "border-danger/40 text-danger"],
                ["Good", "border-primary/40 text-primary"],
                ["Easy", "border-success/40 text-success"],
              ] as const
            ).map(([label, style]) => (
              <button
                key={label}
                type="button"
                onClick={() => setRated(label)}
                className={cn(
                  "rounded-xl border-2 bg-card py-2.5 text-sm font-semibold transition-colors",
                  style,
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {rated && (
          <p className="rounded-lg bg-primary/[0.06] px-3 py-2.5 text-center text-sm text-foreground animate-fade-in">
            Scheduled — you&apos;ll see this card again in{" "}
            <span className="font-semibold text-primary">
              {rated === "Again" ? "10 minutes" : rated === "Good" ? "3 days" : "7 days"}
            </span>
            . That&apos;s spaced repetition doing the remembering for you.
          </p>
        )}
      </div>
    </div>
  );
}

function DemoTutor({ onInteract }: { onInteract: () => void }) {
  const [dataSaver] = useDataSaver();
  const [asked, setAsked] = React.useState(false);
  const [shown, setShown] = React.useState(0);

  // Typewriter reveal (skipped entirely in data-saver mode).
  React.useEffect(() => {
    if (!asked) return;
    if (dataSaver) {
      setShown(DEMO_TUTOR_A.length);
      return;
    }
    const id = window.setInterval(() => {
      setShown((n) => {
        if (n >= DEMO_TUTOR_A.length) {
          window.clearInterval(id);
          return n;
        }
        return n + 3;
      });
    }, 24);
    return () => window.clearInterval(id);
  }, [asked, dataSaver]);

  return (
    <div className="flex min-h-[280px] flex-col">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <p className="text-sm font-semibold">Your AI tutor</p>
      </div>

      <div className="flex-1 space-y-3 py-4">
        {!asked ? (
          <>
            <p className="text-sm text-muted-foreground">
              Stuck on anything, any time — ask in plain language:
            </p>
            <button
              type="button"
              onClick={() => {
                onInteract();
                setAsked(true);
              }}
              className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-left text-sm font-medium transition-colors hover:border-primary/40"
            >
              &ldquo;{DEMO_TUTOR_Q}&rdquo;
            </button>
          </>
        ) : (
          <>
            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                {DEMO_TUTOR_Q}
              </p>
            </div>
            <div className="flex justify-start">
              <p className="max-w-[90%] rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-sm leading-relaxed">
                {DEMO_TUTOR_A.slice(0, shown)}
                {shown < DEMO_TUTOR_A.length && (
                  <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-primary/60 align-middle" />
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
