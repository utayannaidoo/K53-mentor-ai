"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

/** Global listeners: uncaught errors and unhandled rejections → /api/log. */
export function ErrorReporter() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => reportError(e.error ?? e.message, "window");
    const onRejection = (e: PromiseRejectionEvent) => reportError(e.reason, "promise");
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
