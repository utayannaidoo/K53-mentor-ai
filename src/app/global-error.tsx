"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

/**
 * Last-resort boundary: replaces the root layout when even it crashes, so it
 * must render its own <html>/<body> and stay dependency-free (no theme, no
 * store — those may be what broke).
 */
export default function GlobalError({
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
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#F8F5EC", color: "#1D2724" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Something went wrong</h1>
          <p style={{ marginTop: 8, maxWidth: 360, fontSize: 14, color: "#5B665F" }}>
            The app hit an unexpected error. Your study progress is safe.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 24, background: "#2C5F4F", color: "#fff", border: 0, borderRadius: 10, padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
