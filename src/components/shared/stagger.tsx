"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Reveals its direct children in sequence as the group scrolls into view —
 * a single IntersectionObserver fires once, then each child eases up with an
 * incrementing delay so cards/rows "flow" in rather than popping together.
 *
 * Children stay in the DOM at all times (accessible + crawlable); only
 * opacity/transform animate. Reduced-motion shows everything instantly.
 *
 * `className` is applied to the wrapper, so pass the grid/flex layout here and
 * the original items as children — each is wrapped in a reveal element that
 * becomes the layout item.
 */
export function Stagger({
  children,
  className,
  step = 70,
  start = 0,
  itemClassName,
}: {
  children: React.ReactNode;
  className?: string;
  /** Delay between consecutive children, ms. */
  step?: number;
  /** Delay before the first child, ms. */
  start?: number;
  /** Extra classes for each item wrapper (e.g. to preserve grid display). */
  itemClassName?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const items = React.Children.toArray(children);

  return (
    <div ref={ref} className={className}>
      {items.map((child, i) => (
        <div
          key={i}
          style={{ transitionDelay: shown ? `${start + i * step}ms` : "0ms" }}
          className={cn(
            "transition-all duration-700 ease-glass will-change-[opacity,transform] motion-reduce:transition-none",
            shown ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-6 blur-[6px]",
            itemClassName,
          )}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
