import * as React from "react";
import { cn } from "@/lib/utils";

export const Chip = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
>(({ className, active, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
      active
        ? "border-primary/60 bg-primary/10 text-primary"
        : "border-border/60 bg-card/50 text-muted-foreground backdrop-blur-sm hover:border-primary/40 hover:text-foreground",
      className,
    )}
    {...props}
  />
));
Chip.displayName = "Chip";
