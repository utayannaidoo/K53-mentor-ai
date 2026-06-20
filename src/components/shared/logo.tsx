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
        {/* Stylised road vanishing to a point — "the way forward" */}
        <path
          d="M8.5 21 11 3.5a1 1 0 0 1 2 0L15.5 21"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M12 7.5v2M12 12.5v2M12 17.5v1.5"
          stroke="hsl(var(--accent))"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  withText = true,
}: {
  className?: string;
  withText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {withText && (
        <span className="font-display text-[1.05rem] font-semibold tracking-tight text-foreground">
          {APP_NAME}
        </span>
      )}
    </span>
  );
}
