"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

/** Route-level error boundary: report it, keep the shell, offer a retry. */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, "boundary");
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        That page hit an error. Your progress is safe — it saves as you study.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Try again
        </button>
        {/* A retry rerenders the same tree — which cannot recover the case where
            the running JS itself is stale (an installed PWA restored across a
            redeploy, holding chunks the server no longer serves). Only a full
            browser reload refetches the current build, so it gets its own
            always-present escape hatch. */}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/70"
        >
          Reload app
        </button>
      </div>
    </div>
  );
}
