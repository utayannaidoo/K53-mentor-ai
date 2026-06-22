import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight floating glass tooltip (CSS-only, no positioning library).
 * Appears on hover/focus of its child as a `glass-2` floater that scales in.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
}) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "glass-2 pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 scale-95 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-2xs font-medium text-foreground opacity-0 shadow-float transition-all duration-150 ease-soft group-hover/tt:scale-100 group-hover/tt:opacity-100 group-focus-within/tt:scale-100 group-focus-within/tt:opacity-100",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          className,
        )}
      >
        {content}
      </span>
    </span>
  );
}
