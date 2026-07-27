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
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
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
    return () => cancelAnimationFrame(raf);
  }, [value, inView]);

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
