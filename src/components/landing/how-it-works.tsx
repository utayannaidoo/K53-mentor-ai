"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { EXAM_FORMAT } from "@/lib/constants";

/**
 * The illustrative mock score on the "Pass" step. A number, not a ratio: the
 * denominator, the "needed to pass" line and the bar below all read it from
 * EXAM_FORMAT, so the panel cannot end up quoting an exam the app doesn't sit.
 * It said 62/68 for months while the real paper — and every in-app screen — was
 * 64 questions.
 */
const DEMO_MOCK_SCORE = 58;
const BOARD_QUERY =
  "(min-width: 1024px) and (min-height: 500px), (min-width: 768px) and (min-height: 600px)";

const STEPS = [
  {
    n: "01",
    title: "Diagnose",
    body: "A 15-question assessment finds exactly where you stand — no more guessing what to study.",
  },
  {
    n: "02",
    title: "Plan",
    body: "We build a 10-minute daily plan around your weakest categories, refreshed every session.",
  },
  {
    n: "03",
    title: "Practise",
    body: "Flashcards, scenarios and questions with an AI tutor on call to explain the why.",
  },
  {
    n: "04",
    title: "Pass",
    body: `Walk into the ${EXAM_FORMAT.totalQuestions}-question mock, then the real test, consistently clearing the line.`,
  },
];

const PANEL =
  "glass-2 absolute inset-0 m-auto flex h-fit max-h-full flex-col justify-center transition-[opacity,transform] duration-500 ease-glass";

export function HowItWorks() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [active, setActive] = React.useState(0);
  const [mockScore, setMockScore] = React.useState(0);

  React.useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const board = window.matchMedia(BOARD_QUERY);

    let frame = 0;
    const onScroll = () => {
      if (!board.matches) {
        setActive(0);
        return;
      }
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = section.getBoundingClientRect();
        const total = section.offsetHeight - window.innerHeight;
        const prog = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
        // Map the four steps into the first 80% of the scroll; the last 20%
        // holds on "Pass" so the final step stays centred well before the
        // section begins to unpin (otherwise it's only centred at the very
        // edge, where the sticky releases and the block drifts upward).
        const stepped = Math.min(1, prog / 0.8);
        const idx = Math.min(STEPS.length - 1, Math.floor(stepped * STEPS.length + 0.0001));

        setActive((cur) => (cur === idx ? cur : idx));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    board.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      board.removeEventListener("change", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Count the mock-exam score up from 0 once the user reaches the Pass step,
  // synced to the progress bar's 0.55s delay; resets when they scroll away.
  React.useEffect(() => {
    if (active !== 3) {
      setMockScore(0);
      return;
    }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setMockScore(DEMO_MOCK_SCORE);
      return;
    }
    let raf = 0;
    const start = window.setTimeout(() => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / 1600);
        setMockScore(Math.round(DEMO_MOCK_SCORE * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, 550);
    return () => {
      clearTimeout(start);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [active]);

  return (
    <>
      <div className="mx-auto max-w-[1120px] px-6 pt-16 board:pt-[16vh]">
        <div className="mb-6 max-w-[560px]">
          <span className="text-[13px] font-medium uppercase tracking-[0.12em] text-primary">
            How it works
          </span>
          <h2 className="mt-2.5 max-w-[520px] text-balance font-display text-[clamp(1.7rem,3.2vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
            A loop that bends study time toward your weak spots.
          </h2>
        </div>
      </div>

      <section
        ref={sectionRef}
        id="how"
        className="relative mx-auto max-w-[1120px] scroll-mt-20 px-6 pb-16 board:-mt-12 board:h-[300vh] board:pb-0"
      >
        {/* Phones use ordinary document flow: all four steps remain readable
            without spending extra viewports on a scroll-driven presentation.
            The board breakpoint earns the sticky treatment because it has room
            for the list and visual panel side by side. Its top padding clears
            the floating navigation. */}
        <div className="flex flex-col justify-start board:sticky board:top-0 board:h-dvh board:justify-center board:pt-[4.5rem]">
          <div className="flex flex-col items-center gap-4 board:flex-row board:gap-14">
            <div className="flex w-full flex-none flex-col gap-2 board:flex-1">
              {STEPS.map((s, i) => {
                const on = i === active;
                return (
                  <div
                    key={s.n}
                    className={`flex gap-4 rounded-2xl bg-card/40 px-4 py-3 shadow-[inset_3px_0_0_hsl(var(--primary))] transition-[opacity,background,box-shadow] duration-500 ease-soft board:py-3 ${
                      on
                        ? "board:bg-card/[0.55] board:opacity-100 board:shadow-[inset_0_0_0_1px_hsl(0_0%_100%/0.08),inset_3px_0_0_hsl(var(--primary))]"
                        : "board:bg-transparent board:opacity-[0.42] board:shadow-none"
                    }`}
                  >
                    <span className="pt-1 font-mono text-[13px] font-semibold text-primary">{s.n}</span>
                    <div>
                      <h3 className="font-display text-[17px] font-semibold tracking-[-0.01em]">
                        {s.title}
                      </h3>
                      {/* Keep every description available in both layouts. On
                          the animated board, row emphasis and the adjacent
                          panel communicate the active step without hiding copy. */}
                      <div className="max-h-none overflow-hidden opacity-100">
                        <p className="mt-1 text-[0.9rem] leading-[1.45] text-muted-foreground">
                          {s.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* The visual panels are board-only. Phones just saw the real
                interactive product preview above, so repeating four decorative
                simulations here added length without adding understanding.
                348px fits the tallest panel at the narrow board breakpoint. */}
            <div className="relative hidden h-[348px] w-full flex-none board:block board:flex-1">
            {/* 0 — practice question */}
            <div
              className={`${PANEL} rounded-[22px] p-5 board:p-6 ${active === 0 ? "translate-y-0" : "translate-y-[22px]"}`}
              style={{
                opacity: active === 0 ? 1 : 0,
                pointerEvents: active === 0 ? "auto" : "none",
              }}
            >
              <div className="font-mono text-xs font-medium text-primary">QUESTION 5 / 15</div>
              <p className="mt-3 font-display text-[17px] font-semibold leading-[1.4]">
                A flashing red robot at an intersection means you must…
              </p>
              <div className="mt-4 flex flex-col gap-2 board:gap-2.5">
                <div className="rounded-xl bg-muted/60 px-[15px] py-2.5 text-[0.92rem] shadow-[inset_0_0_0_1px_hsl(0_0%_100%/0.06)] board:py-[13px]">
                  Slow down and proceed with caution
                </div>
                <div className="rounded-xl bg-primary/15 px-[15px] py-2.5 text-[0.92rem] text-primary shadow-[inset_0_0_0_1.5px_hsl(var(--primary)/0.5)] board:py-[13px]">
                  Stop, then proceed when safe
                </div>
                <div className="rounded-xl bg-muted/60 px-[15px] py-2.5 text-[0.92rem] shadow-[inset_0_0_0_1px_hsl(0_0%_100%/0.06)] board:py-[13px]">
                  Maintain your speed
                </div>
              </div>
            </div>

            {/* 1 — today's plan */}
            <div
              className={`${PANEL} rounded-[22px] p-6 ${active === 1 ? "translate-y-0" : "translate-y-[22px]"}`}
              style={{
                opacity: active === 1 ? 1 : 0,
                pointerEvents: active === 1 ? "auto" : "none",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[15px] font-semibold">Today&apos;s plan</span>
                <span className="font-mono text-xs font-medium text-muted-foreground">10 min</span>
              </div>
              <div className="mt-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-3 rounded-xl bg-success/12 p-[13px]">
                  <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-success text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-[0.92rem] text-muted-foreground line-through">
                    Review 8 due flashcards
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-muted/55 p-[13px]">
                  <span className="h-[22px] w-[22px] shrink-0 rounded-full shadow-[inset_0_0_0_2px_hsl(var(--primary)/0.5)]" />
                  <span className="text-[0.92rem]">Practise: Road signs (your weakest)</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-muted/55 p-[13px]">
                  <span className="h-[22px] w-[22px] shrink-0 rounded-full shadow-[inset_0_0_0_2px_hsl(var(--border))]" />
                  <span className="text-[0.92rem]">1 hazard scenario</span>
                </div>
              </div>
            </div>

            {/* 2 — flashcard */}
            <div
              className={`${PANEL} items-center gap-4 rounded-[22px] p-7 text-center ${active === 2 ? "translate-y-0" : "translate-y-[22px]"}`}
              style={{
                opacity: active === 2 ? 1 : 0,
                pointerEvents: active === 2 ? "auto" : "none",
              }}
            >
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-primary">
                Flashcard · Signs
              </span>
              <p className="font-display text-[22px] font-semibold leading-[1.3]">
                What does a triangular sign with a red border warn of?
              </p>
              <div className="flex w-full gap-2">
                {[
                  { label: "Again", cls: "bg-danger/15 text-danger" },
                  { label: "Hard", cls: "bg-warning/15 text-warning" },
                  { label: "Good", cls: "bg-primary/15 text-primary" },
                  { label: "Easy", cls: "bg-success/15 text-success" },
                ].map((b) => (
                  <span
                    key={b.label}
                    className={`flex-1 rounded-[10px] py-2.5 text-xs font-semibold ${b.cls}`}
                  >
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

            {/* 3 — mock exam passed */}
            <div
              className={`${PANEL} items-stretch rounded-[22px] p-7 text-center ${active === 3 ? "translate-y-0" : "translate-y-[22px]"}`}
              style={{
                opacity: active === 3 ? 1 : 0,
                pointerEvents: active === 3 ? "auto" : "none",
              }}
            >
              <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-success/15 px-4 py-2 text-[13px] font-semibold text-success">
                <Check className="h-[15px] w-[15px]" strokeWidth={3} />
                Mock exam passed
              </span>
              <div className="mt-[18px] font-mono text-[44px] font-semibold leading-none tracking-[-0.03em] text-success board:text-[56px]">
                {mockScore}
                <span className="text-2xl text-muted-foreground">
                  /{EXAM_FORMAT.totalQuestions}
                </span>
              </div>
              <p className="mt-2 text-[0.95rem] text-muted-foreground">
                Every section clears its own pass mark · you&apos;re consistently clearing them
              </p>
              <div className="mt-[18px] h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full origin-left rounded-full bg-gradient-to-r from-primary to-success"
                  style={{
                    // The bar is the score, so derive it. Hardcoded at 91% it
                    // was the one place the old 62/68 survived a denominator
                    // change without looking wrong.
                    width: `${(DEMO_MOCK_SCORE / EXAM_FORMAT.totalQuestions) * 100}%`,
                    transform: active === 3 ? "scaleX(1)" : "scaleX(0)",
                    transition: "transform 1.6s ease-out 0.55s",
                  }}
                />
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
