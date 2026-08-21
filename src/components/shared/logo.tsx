import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        {/* Road in true perspective — wide at the base, converging to a
            vanishing point just past the last centreline dash. */}
        <path
          d="M6.5 20.75 10.4 5.2M17.5 20.75 13.6 5.2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 16.75v3"
          stroke="hsl(var(--accent))"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M12 11.25v2"
          stroke="hsl(var(--accent))"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M12 6.9v1.2"
          stroke="hsl(var(--accent))"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  withText = true,
  textClassName,
}: {
  className?: string;
  withText?: boolean;
  /**
   * Extra classes for the wordmark alone. Exists so a caller can drop the text
   * at a breakpoint without losing the mark — the marketing nav does this below
   * `xs`, where the wordmark and the CTA cluster cannot both fit the pill.
   */
  textClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {withText && (
        <span
          className={cn(
            "font-display text-[1.05rem] font-semibold tracking-tight text-foreground",
            textClassName,
          )}
        >
          {APP_NAME}
        </span>
      )}
    </span>
  );
}
