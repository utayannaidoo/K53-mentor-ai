"use client";

import * as React from "react";
import { Check } from "lucide-react";

const STEPS = [
  {
    n: "01",
    title: "Diagnose",
    body: "A 15-question adaptive assessment finds exactly where you stand — no more guessing what to study.",
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
    body: "Walk into the 68-question mock, then the real test, consistently clearing the line.",
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

    let frame = 0;
    const onScroll = () => {
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
    return () => {
      window.removeEventListener("scroll", onScroll);
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
      setMockScore(62);
      return;
    }
    let raf = 0;
    const start = window.setTimeout(() => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / 1600);
        setMockScore(Math.round(62 * (1 - Math.pow(1 - p, 3))));
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
      <div className="mx-auto max-w-[1120px] px-6 pt-[12vh] lg:pt-[16vh]">
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
        className="relative mx-auto h-[380vh] -mt-10 max-w-[1120px] scroll-mt-20 px-6 lg:-mt-12"
      >
        {/* pt offsets the floating nav (~4.5rem) so the steps + panel sit in the
            centre of the *visible* area, not the full viewport (which the nav
            overlaps at the top). */}
        <div className="sticky top-0 flex h-screen flex-col justify-center pt-[4.5rem]">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-14">
            <div className="flex w-full flex-1 flex-col gap-2">
              {STEPS.map((s, i) => {
                const on = i === active;
                return (
                  <div
                    key={s.n}
                    className="flex gap-4 rounded-2xl px-4 py-3 transition-[opacity,background,box-shadow] duration-500 ease-soft"
                    style={{
                      opacity: on ? 1 : 0.42,
                      background: on ? "hsl(var(--card)/0.55)" : "transparent",
                      boxShadow: on
                        ? "inset 0 0 0 1px hsl(0 0% 100%/0.08), inset 3px 0 0 hsl(var(--primary))"
                        : "none",
                    }}
                  >
                    <span className="pt-1 font-mono text-[13px] font-semibold text-primary">{s.n}</span>
                    <div>
                      <h3 className="font-display text-[17px] font-semibold tracking-[-0.01em]">
                        {s.title}
                      </h3>
                      <p className="mt-1 text-[0.9rem] leading-[1.45] text-muted-foreground">
                        {s.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative h-[280px] w-full flex-1 lg:h-[320px]">
            {/* 0 — practice question */}
            <div
              className={`${PANEL} rounded-[22px] p-6 ${active === 0 ? "translate-y-0" : "translate-y-[22px]"}`}
              style={{
                opacity: active === 0 ? 1 : 0,
                pointerEvents: active === 0 ? "auto" : "none",
              }}
            >
              <div className="font-mono text-xs font-medium text-primary">QUESTION 5 / 15</div>
              <p className="mt-3 font-display text-[17px] font-semibold leading-[1.4]">
                A flashing red robot at an intersection means you must…
              </p>
              <div className="mt-4 flex flex-col gap-2.5">
                <div className="cursor-pointer rounded-xl bg-muted/60 px-[15px] py-[13px] text-[0.92rem] shadow-[inset_0_0_0_1px_hsl(0_0%_100%/0.06)] transition-transform duration-200 ease-soft hover:scale-[1.03]">
                  Slow down and proceed with caution
                </div>
                <div className="cursor-pointer rounded-xl bg-primary/15 px-[15px] py-[13px] text-[0.92rem] text-primary shadow-[inset_0_0_0_1.5px_hsl(var(--primary)/0.5)] transition-transform duration-200 ease-soft hover:scale-[1.03]">
                  Stop, then proceed when safe
                </div>
                <div className="cursor-pointer rounded-xl bg-muted/60 px-[15px] py-[13px] text-[0.92rem] shadow-[inset_0_0_0_1px_hsl(0_0%_100%/0.06)] transition-transform duration-200 ease-soft hover:scale-[1.03]">
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
                <div className="flex cursor-pointer items-center gap-3 rounded-xl bg-success/12 p-[13px] transition-transform duration-200 ease-soft hover:scale-[1.03]">
                  <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-success text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-[0.92rem] text-muted-foreground line-through">
                    Review 8 due flashcards
                  </span>
                </div>
                <div className="flex cursor-pointer items-center gap-3 rounded-xl bg-muted/55 p-[13px] transition-transform duration-200 ease-soft hover:scale-[1.03]">
                  <span className="h-[22px] w-[22px] shrink-0 rounded-full shadow-[inset_0_0_0_2px_hsl(var(--primary)/0.5)]" />
                  <span className="text-[0.92rem]">Practise: Road signs (your weakest)</span>
                </div>
                <div className="flex cursor-pointer items-center gap-3 rounded-xl bg-muted/55 p-[13px] transition-transform duration-200 ease-soft hover:scale-[1.03]">
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
                    className={`flex-1 cursor-pointer rounded-[10px] py-2.5 text-xs font-semibold transition-transform duration-200 ease-soft hover:scale-110 ${b.cls}`}
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
              <div className="mt-[18px] font-mono text-[56px] font-semibold leading-none tracking-[-0.03em] text-success">
                {mockScore}<span className="text-2xl text-muted-foreground">/68</span>
              </div>
              <p className="mt-2 text-[0.95rem] text-muted-foreground">
                51 needed to pass · you&apos;re consistently clearing it
              </p>
              <div className="mt-[18px] h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full w-[91%] origin-left rounded-full bg-gradient-to-r from-primary to-success"
                  style={{
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
