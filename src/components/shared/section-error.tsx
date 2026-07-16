"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";
import { cn, glass } from "@/lib/utils";

/**
 * Shared section-level error boundary body. Rendered INSIDE the section
 * layout, so the app shell (sidebar / bottom nav) stays intact and the user
 * can navigate away even when a page crashes.
 */
export function SectionError({
  error,
  reset,
  label,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  label: string;
}) {
  useEffect(() => {
    reportError(error, "boundary");
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6">
      <div className={cn(glass, "max-w-md rounded-2xl p-8 text-center")}>
        <h1 className="font-display text-lg font-semibold tracking-tight">
          {label} hit a snag
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong loading this page. Your progress is safe — it saves as you
          study. You can retry, or use the menu to keep going.
        </p>
        <button
          type="button"
          onClick={reset}
          className="press mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
