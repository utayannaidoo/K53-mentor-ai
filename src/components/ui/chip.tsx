import * as React from "react";
import { cn } from "@/lib/utils";

export const Chip = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
>(({ className, active, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    // Every Chip is a toggle — study-mode tabs, worry categories, sign filters.
    // Without this the selected state was colour-only, so a screen reader heard
    // a row of identical buttons and no indication of which was on.
    aria-pressed={active}
    className={cn(
      // max-sm floor: chips are primary toggles on phones (study filters,
      // tutor prompt strips, onboarding picks) and a ~32px pill fails every
      // touch-target guideline with thumbs. Desktop keeps the compact pill.
      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 max-sm:min-h-[44px]",
      active
        ? "border-primary/60 bg-primary/10 text-primary"
        : "border-border/60 bg-card/50 text-muted-foreground backdrop-blur-sm hover:border-primary/40 hover:text-foreground",
      className,
    )}
    {...props}
  />
));
Chip.displayName = "Chip";
