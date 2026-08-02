"use client";

import * as React from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

/**
 * Counts up to `value` once it scrolls into view (cubic ease-out over 1.2s),
 * matching the landing design's stat reveals. Respects reduced-motion by
 * jumping straight to the final value.
 */
export function CountUp({
  value,
  suffix = "",
  prefix = "",
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  // Starts at the FINAL value, not 0. These are the credibility numbers — "15
  // question diagnostic", "64 question mock", "7 K53 categories" — and starting
  // at 0 put a row of zeros in the server-rendered HTML, which is what a non-JS
  // crawler and anyone on a slow connection actually saw. The animation is now
  // a hydration-only flourish: it rewinds to 0 the moment it can, then counts.
  const [display, setDisplay] = React.useState(value);

  React.useEffect(() => {
    if (!inView) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    setDisplay(0);
    let raf = 0;
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Background tabs throttle rAF to a standstill; don't leave the stat on 0.
    const failsafe = window.setTimeout(() => setDisplay(value), duration + 400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
    };
  }, [value, inView]);

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
