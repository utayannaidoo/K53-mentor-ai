"use client";

import * as React from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

/**
 * Eases content in as it scrolls into view. Purely presentational — the
 * children are always in the DOM (accessible + crawlable); only opacity /
 * transform animate. Respects reduced-motion via the global CSS guard.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [ref, shown] = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}
      className={cn(
        "transition-all duration-700 ease-glass will-change-[opacity,transform] motion-reduce:transition-none",
        shown ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-6 blur-[6px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
