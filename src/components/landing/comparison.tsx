"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, X, ChevronsRight } from "lucide-react";
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

/*
 * Four comparison columns cannot fit a phone readably, so below `sm` the table
 * scrolls inside its own pane — and everything about that pane is DETERMINISTIC
 * rather than left to auto-layout:
 *
 *   table-fixed · width = pane + pin + 2·colW · columns: 124 / colW / colW / colW
 *
 * where colW is measured from the pane so that every view is the SAME shape:
 * pinned feature rail · one full comparison column · a 40px peek of the next
 * one. Three rest states (mandatory-snapped, and the exact targets the pill
 * pages through), zero sliced glyphs, zero trailing blankness, and no column
 * wider than its neighbours. On desktop (`sm:` up) none of this engages.
 */

const PIN_W = 124;
/** Space past a full column that invites the next swipe (and, after the last
 *  column, reads as the table's own end margin). */
const PEEK_W = 40;

export function Comparison() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  // Measured, not assumed: the phone geometry depends on the real pane width.
  const [phone, setPhone] = useState<{ active: boolean; colW: number }>({
    active: false,
    colW: 178,
  });
  const [fade, setFade] = useState<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });
  // Whether the pane has hidden columns at all — the chip's render condition,
  // independent of scroll position so it never vanishes mid-comparison.
  const [scrolls, setScrolls] = useState(false);

  // Measurement runs in a LAYOUT effect deliberately: the table mounts at pane
  // width and grows once, before first paint. Growing it after paint made
  // mobile Safari re-snap the freshly widened pane — landing learners at the
  // END of the table instead of its start.
  const layoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  layoutEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const measure = () => {
      if (!mq.matches || !scrollerRef.current) {
        setPhone({ active: false, colW: 178 });
        return;
      }
      const pane = scrollerRef.current.clientWidth;
      setPhone({ active: true, colW: Math.max(150, pane - PIN_W - PEEK_W) });
    };
    measure();
    // Whatever the engine restored or re-snapped during that growth, the pane
    // OPENS on the first view. Now and once more after layout settles.
    const openAtStart = () =>
      scrollerRef.current?.scrollTo({ left: 0, behavior: "auto" });
    openAtStart();
    requestAnimationFrame(openAtStart);
    // A restored bfcache snapshot can land after everything above.
    const onPageshow = (e: PageTransitionEvent) => {
      if (e.persisted) openAtStart();
    };
    window.addEventListener("pageshow", onPageshow);
    mq.addEventListener("change", measure);
    return () => {
      window.removeEventListener("pageshow", onPageshow);
      mq.removeEventListener("change", measure);
    };
  }, []);

  const sync = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setFade({ left: el.scrollLeft > 8, right: max > 8 && el.scrollLeft < max - 8 });
    setScrolls(max > 8);
  }, []);

  // One tap = the next whole-column view; past the last one it returns to the
  // start, so the header chip stays a working control for the table's whole
  // life rather than dying against the end stop. The stops derive from the
  // same measured colW the layout uses, so the button, a finger-flick, and the
  // mandatory snapper all share identical rest states.
  const pageRight = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || !phone.active) return;
    const max = el.scrollWidth - el.clientWidth;
    const stops = [phone.colW, phone.colW * 2].filter((p) => p <= max + 8);
    const next = stops.find((p) => p > el.scrollLeft + 16);
    if (next !== undefined) {
      el.scrollTo({ left: Math.min(next, max), behavior: "smooth" });
    } else {
      // At the end already — loop back to the first column view.
      el.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [phone]);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync, phone]);

  // The pinned column paints an opaque page-coloured plate (with a soft shadow
  // so mid-swipe layering reads as deliberate). Zebra tint and row-hover are
  // translucency effects, so they skip the pin.
  const stickyCell =
    "sticky left-0 z-10 w-[124px] bg-background transition-colors duration-200 shadow-[6px_0_14px_-8px_hsl(var(--foreground)/0.28)] sm:w-auto sm:shadow-none";
  const valueCol = phone.active
    ? { width: phone.colW }
    : undefined;

  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16">
      {/* The scroll hint lives in the header, not floating over the table:
          it labels the pane from outside it, never covers a cell, and is the
          first thing the eye passes on the way into the columns. It stays for
          the table's whole life (while hidden columns exist) and keeps its
          tap-to-page behaviour — past the end it loops back to the start. */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="max-w-[620px]">
          <span className="text-[13px] font-medium uppercase tracking-[0.12em] text-primary">
            How we compare
          </span>
          <h2 className="mt-3 text-balance font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
            Everything the free apps and books leave out.
          </h2>
        </div>

        {scrolls && (
          <button
            type="button"
            onClick={pageRight}
            className="press mb-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3.5 py-2 text-xs font-semibold text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
          >
            Swipe to compare
            <ChevronsRight className="h-4 w-4 text-primary" aria-hidden />
          </button>
        )}
      </div>

      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={sync}
          role="region"
          aria-label="Feature comparison — scrolls sideways to show every column"
          tabIndex={0}
          className="snap-x snap-mandatory overscroll-x-contain overflow-x-auto focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 sm:snap-none"
          style={{ scrollPaddingLeft: PIN_W }}
        >
          {/* Phone geometry lives in the table-fixed widths below (see the note
              above the component); desktop returns to natural auto sizing. */}
          <table
            style={
              phone.active
                ? { width: PIN_W + 3 * phone.colW + PEEK_W }
                : undefined
            }
            className="table-fixed border-separate border-spacing-0 text-left sm:table-auto sm:w-auto sm:min-w-[680px]"
          >
            <thead>
              <tr>
                <th
                  className={`${stickyCell} rounded-tl-2xl px-3 py-4 text-[13px] font-medium uppercase leading-tight tracking-[0.08em] text-muted-foreground sm:px-5`}
                >
                  Feature
                </th>
                <th
                  style={valueCol}
                  className={`snap-start rounded-t-2xl border-b-2 border-accent bg-primary/[0.07] px-3 py-4 text-center font-display text-[15px] font-semibold leading-tight sm:w-auto sm:px-5`}
                >
                  K53 Mentor AI
                </th>
                <th
                  style={valueCol}
                  className={`snap-start px-3 py-4 text-center text-[15px] font-medium leading-tight text-muted-foreground sm:w-auto sm:px-5`}
                >
                  Free apps
                </th>
                <th
                  style={valueCol}
                  className={`snap-start px-3 py-4 text-center text-[15px] font-medium leading-tight text-muted-foreground sm:w-auto sm:px-5`}
                >
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
                      className={`${stickyCell} border-t border-border/40 px-3 py-3.5 text-[0.95rem] font-medium leading-snug sm:px-5`}
                    >
                      {row.feature}
                    </td>
                    <td
                      style={valueCol}
                      className={`bg-primary/[0.07] px-3 py-3.5 text-center transition-colors duration-200 group-hover:bg-primary/[0.13] ${last ? "rounded-b-2xl" : ""}`}
                    >
                      <Cell value={row.values[0]} />
                    </td>
                    <td
                      style={valueCol}
                      className={`border-t border-border/40 px-3 py-3.5 text-center transition-colors duration-200 group-hover:bg-foreground/[0.035] ${alt}`}
                    >
                      <Cell value={row.values[1]} />
                    </td>
                    <td
                      style={valueCol}
                      className={`border-t border-border/40 px-3 py-3.5 text-center transition-colors duration-200 group-hover:bg-foreground/[0.035] ${alt}`}
                    >
                      <Cell value={row.values[2]} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Edge fades render only while table remains hidden past that edge,
            so the final swipe lands on a clean, unfaded pane. */}
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
