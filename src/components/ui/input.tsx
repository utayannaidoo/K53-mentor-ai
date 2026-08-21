import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
      className={cn(
        // text-base (16px), not text-sm: iOS Safari auto-zooms any input with
        // a font under 16px when focused, and the viewport is locked at
        // initialScale 1 — every login/tutor/search focus zoomed the page.
        "flex h-11 w-full rounded-lg border border-input bg-card/70 px-3.5 py-2 text-base text-foreground caret-primary shadow-sm backdrop-blur-sm transition-[border-color,box-shadow,background-color] duration-200 ease-soft placeholder:text-muted-foreground/60 hover:border-border focus-visible:border-primary focus-visible:bg-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    {...props}
  />
));
Input.displayName = "Input";
