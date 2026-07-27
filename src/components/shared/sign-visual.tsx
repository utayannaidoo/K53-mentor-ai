"use client";

import * as React from "react";
import Image from "next/image";
import type { SignKey } from "@/types";
import { SignGlyph } from "./sign-glyph";
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
}: {
  image?: string;
  sign?: SignKey;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = React.useState(false);

  // An image served from cache can finish before React attaches onLoad, which
  // would leave the shimmer up forever.
  React.useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [image]);

  if (image) {
    return (
      <span
        className={cn(
          "relative inline-flex aspect-square h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-sm",
          className,
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
          width={160}
          height={160}
          sizes="80px"
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
