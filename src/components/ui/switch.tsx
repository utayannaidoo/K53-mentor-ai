"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Tactile glass toggle — the knob springs across, the track eases its colour. */
export function Switch({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-300 ease-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25",
        checked ? "border-primary/50 bg-primary" : "border-border bg-muted",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-spring",
          checked ? "translate-x-[1.25rem]" : "translate-x-0",
        )}
      />
    </button>
  );
}
