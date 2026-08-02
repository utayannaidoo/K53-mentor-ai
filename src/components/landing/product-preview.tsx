"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, CornerDownRight, RotateCw, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SignVisual } from "@/components/shared/sign-visual";
import { signImg } from "@/lib/content/signs";
import { bestQuestionFor } from "@/lib/ai/keyword-search";
import { useDataSaver } from "@/hooks/use-data-saver";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * "Try it" section: a self-contained, clickable slice of the real product —
 * no store, no API. The practice and flashcard demos use fixed content; the
 * tutor answers real questions from the bundled starter pack. The hero card
 * shows the outcome; this proves the mechanics feel good before asking for a
 * signup.
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
    "A yield sign means give right of way: slow down, and stop only if crossing traffic or pedestrians make it necessary.",
};

const DEMO_CARD = {
  front: "What is the minimum following distance under the two-second rule?",
  back: "At least 2 seconds behind the vehicle ahead in dry conditions — double it to 4 seconds in rain or poor visibility.",
};

/** Starter prompt — the answer now comes from real content, not a script. */
const DEMO_TUTOR_Q = "Why did I get the yield sign question wrong?";

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
    /* Scroll hold. The section is worth a beat of attention — it is the only
       place on the page where the product is actually usable — so on a screen
       with room for it the whole thing pins for about two-thirds of a viewport
       of scrolling before releasing. Below `board` (phones, short windows) it
       scrolls past normally: pinning a section that doesn't fit its viewport
       traps the reader instead of holding them.
       The track must not sit inside a transformed ancestor, which is why the
       page renders this section without a `Reveal` wrapper. */
    <div className="board:h-[165vh]">
      <div className="board:sticky board:top-0 board:flex board:h-dvh board:items-center">
        <section className="w-full px-6 py-20 sm:py-24 board:py-0">
          {/* Mobile: centered stack (copy → tabs → demo → CTA). Desktop: the live
              demo leads on the LEFT, copy/tabs/CTA on the right. */}
          <div className="mx-auto flex max-w-[1120px] flex-col text-center lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:text-left">
            <div className="order-2 lg:order-1">
              {/* Device-ish frame. The height is FIXED so neither switching tabs
                  nor answering the question resizes it — a growing card used to
                  shove the rest of the page down mid-interaction.
                  It is sized to sit beside the copy column rather than tower
                  over it: at 620px the frame was 240px taller than the text it
                  is paired with, which pushed its own bottom edge — where the
                  answer explanation appears — below the fold. Each demo now
                  fits the frame outright on a desktop column; the internal
                  scroller only earns its keep on a narrow phone. */}
              <div
                key={tab}
                className="glass-2 mx-auto mt-6 flex h-[540px] w-full max-w-md animate-fade-in flex-col overflow-hidden rounded-2xl border border-border p-5 text-left shadow-[0_24px_60px_-24px_hsl(var(--shadow)/0.4)] sm:p-6 lg:mt-0 lg:ml-0 lg:h-[500px]"
              >
                {tab === "practice" && (
                  <DemoQuestion onInteract={() => noteInteraction("practice")} />
                )}
                {tab === "flashcard" && (
                  <DemoFlashcard onInteract={() => noteInteraction("flashcard")} />
                )}
                {tab === "tutor" && <DemoTutor onInteract={() => noteInteraction("tutor")} />}
              </div>
            </div>

            <div className="order-1 lg:order-2 lg:flex lg:flex-col lg:items-start">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Try it now
              </p>
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
                <p className="mt-2 text-xs text-muted-foreground">
                  Free · no credit card · 5 minutes
                </p>
              </div>
            </div>

            <div className="order-3 lg:hidden">
              <Link href="/onboarding" className={cn(buttonVariants({ size: "lg" }), "mt-8 gap-2")}>
                Start free assessment <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-2 text-xs text-muted-foreground">Free · no credit card · 5 minutes</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function DemoQuestion({ onInteract }: { onInteract: () => void }) {
  const scroller = React.useRef<HTMLDivElement>(null);
  const [selected, setSelected] = React.useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === DEMO_QUESTION.correctIndex;

  // The frame can't grow, so on a narrow phone the explanation may land just
  // below the fold of the scroll area — bring it into view inside the card
  // (never by scrolling the page, which is what the old growing card did).
  React.useEffect(() => {
    if (!answered) return;
    const el = scroller.current;
    if (!el) return;
    const smooth = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(
      () => el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" }),
      60,
    );
    return () => window.clearTimeout(id);
  }, [answered]);

  return (
    <div ref={scroller} className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
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

      {/* Sign beside the prompt rather than stacked above it — the same
          information in ~50px less height, which is what buys the explanation
          its place inside the frame. */}
      <div className="mt-3.5 flex items-start gap-3">
        <SignVisual
          image={DEMO_QUESTION.image}
          alt="Yield sign"
          className="h-12 w-12 shrink-0"
        />
        <p className="font-display text-base font-semibold leading-snug tracking-tight">
          {DEMO_QUESTION.prompt}
        </p>
      </div>

      <div className="mt-3.5 space-y-2">
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
                "flex w-full items-center gap-2.5 rounded-xl border-2 bg-card px-3 py-2.5 text-left text-sm leading-snug transition-all",
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
        <div className="mt-2.5 flex gap-2 animate-fade-in">
          <CornerDownRight className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="flex-1 rounded-lg border border-success/30 bg-success/[0.05] p-2.5 text-sm leading-snug">
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
    <div className="flex min-h-0 flex-1 flex-col">
      <button
        type="button"
        onClick={() => {
          onInteract();
          setFlipped((f) => !f);
        }}
        className="flex min-h-[190px] w-full flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/40"
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

      <div className="mt-4 min-h-[64px] shrink-0">
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

/** Questions a visitor may ask before we ask them to sign up. */
const DEMO_TUTOR_LIMIT = 2;

type DemoTurn = { role: "user" | "tutor"; text: string };

/**
 * Answer from the bundled starter pack — the same content a signed-out visitor
 * is already entitled to.
 *
 * Two deliberate constraints.
 *
 * Not `localTutorReply`: that resolves ids against the full bank, so calling it
 * here would hand every anonymous landing-page visitor the entire paid question
 * and flashcard set, defeating the entitlement check on /api/content/pack. The
 * matching logic is identical; only the pool is smaller.
 *
 * And imported on first ask rather than at module scope: statically importing
 * the starter pack put 31KB on the landing page's first load, for a demo most
 * visitors never open. This app targets prepaid connections and ships a
 * data-saver mode — it does not get to spend that on a maybe.
 */
async function demoReply(question: string): Promise<string> {
  const { STARTER_QUESTIONS } = await import("@/lib/content/starter");
  const hit = bestQuestionFor(question, STARTER_QUESTIONS);
  if (hit) {
    const prefix = /why/i.test(question) ? "Good question — here's the reasoning. " : "";
    return `${prefix}${hit.explanation}\n\nThe answer is “${hit.options[hit.correctIndex]}”. Want another example?`;
  }
  return "I'm your K53 tutor — ask me about any road sign, rule, intersection or following-distance question and I'll break it down. What would you like to understand?";
}

/**
 * A real tutor, not a recording. The section promises a clickable slice of the
 * product, so it has to accept an actual question.
 *
 * No API call, no key, no session, no rate limit and nothing to abuse — but the
 * answers are real verified explanations rather than one hardcoded paragraph,
 * so the demo can't be more impressive than the product.
 */
function DemoTutor({ onInteract }: { onInteract: () => void }) {
  const [dataSaver] = useDataSaver();
  const [turns, setTurns] = React.useState<DemoTurn[]>([]);
  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const [shown, setShown] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const asked = turns.filter((t) => t.role === "user").length;
  const spent = asked >= DEMO_TUTOR_LIMIT;
  const last = turns[turns.length - 1];
  const typing = last?.role === "tutor" ? last.text : null;

  async function ask(question: string) {
    const text = question.trim();
    if (!text || thinking || spent) return;
    onInteract();
    setInput("");
    setShown(0);
    setTurns((t) => [...t, { role: "user", text }]);
    setThinking(true);
    const reply = await demoReply(text);
    setThinking(false);
    setTurns((t) => [...t, { role: "tutor", text: reply }]);
  }

  // Typewriter reveal of the newest tutor turn (skipped in data-saver mode).
  React.useEffect(() => {
    if (typing === null) return;
    if (dataSaver) {
      setShown(typing.length);
      return;
    }
    const id = window.setInterval(() => {
      setShown((n) => {
        if (n >= typing.length) {
          window.clearInterval(id);
          return n;
        }
        return n + 3;
      });
    }, 24);
    return () => window.clearInterval(id);
  }, [typing, dataSaver]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [turns, shown]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-border pb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <p className="text-sm font-semibold">Your AI tutor</p>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto py-4">
        {turns.length === 0 && (
          <>
            <p className="text-sm text-muted-foreground">
              Stuck on anything, any time — ask in plain language:
            </p>
            <button
              type="button"
              onClick={() => ask(DEMO_TUTOR_Q)}
              className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-left text-sm font-medium transition-colors hover:border-primary/40"
            >
              &ldquo;{DEMO_TUTOR_Q}&rdquo;
            </button>
          </>
        )}

        {turns.map((turn, i) =>
          turn.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                {turn.text}
              </p>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <p className="max-w-[90%] whitespace-pre-line rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-sm leading-relaxed">
                {i === turns.length - 1 ? turn.text.slice(0, shown) : turn.text}
                {i === turns.length - 1 && shown < turn.text.length && (
                  <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-primary/60 align-middle" />
                )}
              </p>
            </div>
          ),
        )}

        {thinking && (
          <div className="flex justify-start">
            <p className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground">
              Thinking…
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border pt-3">
        {spent ? (
          <Link
            href="/onboarding"
            className={cn(buttonVariants({ size: "sm" }), "w-full rounded-xl")}
          >
            Keep asking — start free <ArrowRight />
          </Link>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2"
          >
            <label htmlFor="demo-tutor-input" className="sr-only">
              Ask the K53 tutor a question
            </label>
            <input
              id="demo-tutor-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={300}
              placeholder="Ask anything about the K53…"
              className="min-w-0 flex-1 rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className={cn(
                buttonVariants({ size: "sm" }),
                "shrink-0 rounded-xl disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              Ask
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
