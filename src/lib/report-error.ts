/**
 * Fire-and-forget client error reporting to /api/log. Deduped per message
 * and capped per page load so a render loop can't flood the endpoint.
 */

const seen = new Set<string>();
let budget = 5;

export function reportError(
  error: unknown,
  source: "window" | "promise" | "boundary" = "window",
): void {
  if (typeof window === "undefined" || budget <= 0) return;
  const err = error instanceof Error ? error : new Error(String(error ?? "Unknown error"));
  const message = err.message.slice(0, 500);
  if (!message || seen.has(message)) return;
  seen.add(message);
  budget -= 1;

  const body = JSON.stringify({
    message,
    stack: err.stack?.slice(0, 4000),
    url: window.location.pathname,
    source,
  });
  try {
    // sendBeacon survives page unloads; fetch keepalive is the fallback.
    if (!navigator.sendBeacon?.("/api/log", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/log", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* reporting must never throw */
  }
}
