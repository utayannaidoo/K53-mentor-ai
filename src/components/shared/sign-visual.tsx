"use client";

import * as React from "react";
import Image from "next/image";
import type { SignKey } from "@/types";
import { SignGlyph } from "./sign-glyph";
// The dimensions projection, NOT signs.ts: this component renders inside
// every study surface (practice, mocks, flashcards, scenarios, diagnostics),
// and importing the catalogue here shipped its full ~140KB of names and
// meanings with each of those routes for the sake of one lookup.
import { signImageDimensions } from "@/lib/content/signs-dimensions";
import { cn } from "@/lib/utils";

/**
 * Preferred way to show a road sign in study content: renders the real
 * extracted image when `image` is set, otherwise falls back to the inline
 * SVG glyph. Signs sit on a white card in both themes (they are designed to
 * be read on a light background).
 *
 * The card holds a shimmer until the PNG decodes, so a slow first load reads
 * as "loading" instead of an empty white square. Pass `priority` when the sign
 * is on screen the moment the card mounts (the question you are answering) —
 * the default lazy load waits for an intersection callback, which is exactly
 * the delay that made a fresh question look blank.
 */
export function SignVisual({
  image,
  sign,
  alt = "Road sign",
  className,
  priority,
  detail,
}: {
  image?: string;
  sign?: SignKey;
  alt?: string;
  className?: string;
  priority?: boolean;
  /**
   * Render large enough to read fine print on the sign itself.
   *
   * The default 80px thumbnail is right for a symbol in a disc or a triangle,
   * and wrong for a sign shown with its qualifier plate — "06:30–09:00", "For
   * 2km", "15 MAX". `object-contain` renders those at roughly 14% of full size,
   * putting the plate text a couple of pixels high and making any question
   * about what it says unanswerable.
   *
   * Opt-in per question (`Question.imageDetail`) rather than inferred from the
   * image, because the deciding factor is whether the *question* asks the
   * reader to read the sign, and aspect ratio predicts that badly in both
   * directions: the "15 MAX" plate is nearly square and still unreadable, while
   * plenty of tall marking strips are perfectly clear small.
   */
  detail?: boolean;
}) {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = React.useState(false);

  // An image served from cache can finish before React attaches onLoad, which
  // would leave the shimmer up forever.
  React.useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [image]);

  if (image) {
    const dims = signImageDimensions(image);

    return (
      <span
        className={cn(
          "relative inline-flex aspect-square h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-sm",
          className,
          // Last, so it beats the caller's h-20 w-20 for the few signs that
          // genuinely cannot be read at that size.
          detail && "aspect-auto h-40 w-auto min-w-20 max-w-full sm:h-52",
        )}
      >
        {/* Span-based shimmer rather than <Skeleton>: this wrapper is a span
            (phrasing content), so a div inside it would be invalid nesting. */}
        {!loaded && (
          <span aria-hidden className="absolute inset-0 overflow-hidden bg-muted">
            <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.35] to-transparent" />
          </span>
        )}
        <Image
          ref={imgRef}
          src={image}
          alt={alt}
          width={dims?.w ?? 160}
          height={dims?.h ?? 160}
          sizes={detail ? "208px" : "80px"}
          priority={priority}
          onLoad={() => setLoaded(true)}
          // Even a failed load should drop the shimmer — alt text beats a
          // permanent loading state.
          onError={() => setLoaded(true)}
          className={cn(
            "h-full w-full object-contain transition-opacity duration-300 ease-soft motion-reduce:transition-none",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      </span>
    );
  }
  if (sign) return <SignGlyph sign={sign} className={className} />;
  return null;
}

/**
 * Warms the browser cache for a sign the learner is about to reach (the next
 * question in the queue). Renders nothing visible; `priority` emits the same
 * preload the visible <SignVisual> will request, so the swap is instant.
 */
export function SignPreload({ image }: { image?: string }) {
  if (!image) return null;
  return (
    <span aria-hidden className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
      <Image src={image} alt="" width={160} height={160} sizes="80px" priority />
    </span>
  );
}
