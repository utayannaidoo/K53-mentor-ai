import * as React from "react";
import { cn, glass, glassFloat } from "@/lib/utils";

/**
 * The sheet vocabulary, shared by the Progress page's five sections.
 *
 * `TodaySheet` established the rule and the reasoning: a page of cards cannot be
 * fixed by rearranging the cards, because the grid is the problem. A sheet is
 * one bordered object whose sections are separated by rules rather than gaps —
 * no nested bordered box anywhere inside it.
 *
 * Progress differs from Today in one respect only. Today is a single statement
 * and holds to a single sheet; Progress is five separate questions — where you
 * stand, how you study, what you have mastered, where you rank, what you have
 * done — and one sheet three thousand pixels tall is a scroll with no landmarks.
 * So each question gets its own sheet, and the label sits *outside* it, which is
 * what keeps this a document with headings rather than a grid of cards again.
 */

/** A section label. Outside the sheet on purpose — a heading, not a card title. */
export function SheetLabel({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-3 px-1">
      <h2 className="font-display text-2xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {children}
      </h2>
      {aside}
    </div>
  );
}

/**
 * `float` is for the one sheet that leads the page; everything below it is
 * content tier. Two reasons, and they point the same way: adjacent surfaces must
 * sit on different tiers, and `glassFloat` carries a 40px backdrop-blur. One of
 * those on screen is the flagship treatment — five stacked down a long scroll is
 * five compositing layers the blur budget explicitly rules out.
 */
export function Sheet({
  children,
  className,
  float = false,
}: {
  children: React.ReactNode;
  className?: string;
  float?: boolean;
}) {
  return (
    <section
      className={cn(float ? glassFloat : glass, "overflow-hidden rounded-3xl border", className)}
    >
      {children}
    </section>
  );
}

/**
 * A division inside a sheet. `divided` draws the hairline above it; the first
 * band in a sheet omits it so the sheet's own border does that job.
 */
export function Band({
  children,
  className,
  divided = true,
  tone,
}: {
  children: React.ReactNode;
  className?: string;
  divided?: boolean;
  /** An interruption. Inset left rule instead of a border — never a floating card. */
  tone?: "warning" | "primary" | "success";
}) {
  return (
    <div
      className={cn(
        "px-5 py-4 sm:px-6",
        divided && "border-t border-border/50",
        tone === "warning" && "bg-warning/[0.07] shadow-[inset_3px_0_0_hsl(var(--warning))]",
        tone === "primary" && "bg-primary/[0.05] shadow-[inset_3px_0_0_hsl(var(--primary))]",
        tone === "success" && "bg-success/[0.06] shadow-[inset_3px_0_0_hsl(var(--success))]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A heading inside a sheet — quieter than the sheet's own label. */
export function BandTitle({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">{children}</h3>
      {aside}
    </div>
  );
}

/**
 * A qualifying number. Hairline-separated from its neighbours by the parent's
 * `gap-px bg-border/40`, never boxed — see `FigureRow`.
 */
export function Figure({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  tone?: string;
}) {
  return (
    <div className="bg-card/[0.01] px-4 py-4 text-center">
      <p className="text-2xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className={cn("mt-1.5 font-mono text-2xl font-semibold leading-none tabular-nums", tone)}>
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );
}

/** The hairline grid `Figure` expects to sit in. */
export function FigureRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px border-t border-border/50 bg-border/40 sm:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
