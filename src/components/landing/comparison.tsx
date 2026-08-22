"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { EXAM_FORMAT } from "@/lib/constants";

type CellValue = boolean | string;

const ROWS: { feature: string; values: [CellValue, CellValue, CellValue] }[] = [
  { feature: "Free to start", values: [true, true, false] },
  { feature: "Personalised AI diagnostic", values: [true, false, false] },
  { feature: "Readiness score & pass prediction", values: [true, false, false] },
  { feature: "Spaced repetition that adapts to you", values: [true, "Some", false] },
  { feature: "AI tutor that explains your mistakes", values: [true, false, false] },
  { feature: "Scenario-based judgement training", values: [true, false, "Some"] },
  {
    feature: `Full ${EXAM_FORMAT.totalQuestions}-question mock exam`,
    values: [true, "Some", false],
  },
  { feature: "Targets your weakest categories", values: [true, false, false] },
  { feature: "Driver's (yard) test prep", values: [true, false, "Varies"] },
  { feature: "10-minute daily study plan", values: [true, false, false] },
];

function Cell({ value }: { value: CellValue }) {
  // aria-label on a bare lucide <svg> is ignored by most screen readers; the
  // sr-only text node is what actually reads out.
  if (value === true)
    return (
      <>
        <Check className="mx-auto h-[18px] w-[18px] text-success" strokeWidth={3} aria-hidden />
        <span className="sr-only">Yes</span>
      </>
    );
  if (value === false)
    return (
      <>
        <X className="mx-auto h-[18px] w-[18px] text-danger" strokeWidth={2.6} aria-hidden />
        <span className="sr-only">No</span>
      </>
    );
  return <span className="text-sm text-muted-foreground">{value}</span>;
}

/** Four comparison columns cannot fit a phone readably, so the table scrolls
 *  inside its own pane on small screens. Scrolling inside a pane is invisible
 *  to page-level overflow checks AND invisible to thumbs unless it is signed —
 *  so the feature column pins (rows keep their meaning mid-swipe) and edge
 *  fades appear only while there is more table in that direction. */
export function Comparison() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });

  const sync = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setFade({ left: el.scrollLeft > 8, right: max > 8 && el.scrollLeft < max - 8 });
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync]);

  // The pinned column paints an opaque page-coloured plate so scrolled cells
  // slide beneath it rather than through it — which also means the zebra tint
  // and row-hover do not apply to it (they are translucency effects).
  const stickyCell =
    "sticky left-0 z-10 bg-background transition-colors duration-200";

  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16">
      <div className="mb-10 max-w-[620px]">
        <span className="text-[13px] font-medium uppercase tracking-[0.12em] text-primary">
          How we compare
        </span>
        <h2 className="mt-3 text-balance font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
          Everything the free apps and books leave out.
        </h2>
      </div>

      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={sync}
          role="region"
          aria-label="Feature comparison — scrolls horizontally"
          tabIndex={0}
          className="overflow-x-auto focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
        >
          {/* Narrower floor below sm: tighter gutters buy back ~100px of the
              viewport so a competitor column peeks in at 390px instead of
              hiding entirely past the fade. */}
          <table className="w-full min-w-[580px] border-separate border-spacing-0 text-left sm:min-w-[680px]">
            <thead>
              <tr>
                <th
                  className={`${stickyCell} rounded-tl-2xl px-4 py-4 text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground sm:px-5`}
                >
                  Feature
                </th>
                <th className="rounded-t-2xl border-b-2 border-accent bg-primary/[0.07] px-4 py-4 text-center font-display text-[15px] font-semibold sm:px-5">
                  K53 Mentor AI
                </th>
                <th className="px-4 py-4 text-center text-[15px] font-medium text-muted-foreground sm:px-5">
                  Free apps
                </th>
                <th className="px-4 py-4 text-center text-[15px] font-medium text-muted-foreground sm:px-5">
                  Study book
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => {
                const last = i === ROWS.length - 1;
                const alt = i % 2 === 1 ? "bg-card/30" : "";
                return (
                  <tr key={row.feature} className="group">
                    <td
                      className={`${stickyCell} border-t border-border/40 px-4 py-3.5 text-[0.95rem] font-medium sm:px-5`}
                    >
                      {row.feature}
                    </td>
                    <td
                      className={`bg-primary/[0.07] px-4 py-3.5 text-center transition-colors duration-200 group-hover:bg-primary/[0.13] ${last ? "rounded-b-2xl" : ""}`}
                    >
                      <Cell value={row.values[0]} />
                    </td>
                    <td className={`border-t border-border/40 px-4 py-3.5 text-center transition-colors duration-200 group-hover:bg-foreground/[0.035] ${alt}`}>
                      <Cell value={row.values[1]} />
                    </td>
                    <td className={`border-t border-border/40 px-4 py-3.5 text-center transition-colors duration-200 group-hover:bg-foreground/[0.035] ${alt}`}>
                      <Cell value={row.values[2]} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Edge fades: the scroll affordance. Each renders only while table
            remains hidden past that edge, so the final swipe lands on a clean,
            unfaded table and reads as complete. */}
        {fade.left && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-8 rounded-tl-2xl bg-gradient-to-r from-background to-transparent"
          />
        )}
        {fade.right && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-8 rounded-tr-2xl bg-gradient-to-l from-background to-transparent"
          />
        )}
      </div>
    </section>
  );
}
