"use client";

import * as React from "react";

/**
 * `new Date().getFullYear()` in a server component freezes at whatever the
 * build machine's clock said, so a site not redeployed after New Year shows a
 * stale © year. The server render emits the build-time year passed as a prop
 * (keeping SSR/CSR markup identical — no hydration mismatch), then useEffect
 * corrects it to the visitor's live year once mounted.
 */
export function CopyrightYear({ year }: { year: number }) {
  const [current, setCurrent] = React.useState(year);
  React.useEffect(() => {
    const now = new Date().getFullYear();
    setCurrent((prev) => (prev === now ? prev : now));
  }, []);
  return <>{current}</>;
}
