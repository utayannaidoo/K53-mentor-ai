"use client";

import * as React from "react";

/**
 * Code-split wrapper around the Markdown renderer.
 *
 * react-markdown + remark-gfm cost ~45KB gzipped, and the tutor page was the
 * heaviest route in the app because of them — paid by every learner opening
 * the chat before a single reply exists to render. The renderer now arrives
 * as its own chunk, fetched in parallel with hydration.
 *
 * While it loads, the raw text renders in the same bubble styles: replies are
 * short prose, so the plain-text stand-in reads correctly and simply upgrades
 * to bold/lists when the chunk lands. No blank bubble, no layout shift beyond
 * inline formatting.
 */
const Markdown = React.lazy(() =>
  import("@/components/tutor/markdown").then((m) => ({ default: m.Markdown })),
);

export function MarkdownLazy({ children }: { children: string }) {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-2 text-sm leading-relaxed text-foreground">
          <p className="whitespace-pre-wrap">{children}</p>
        </div>
      }
    >
      <Markdown>{children}</Markdown>
    </React.Suspense>
  );
}
