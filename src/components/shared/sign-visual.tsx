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
 */
export function SignVisual({
  image,
  sign,
  alt = "Road sign",
  className,
}: {
  image?: string;
  sign?: SignKey;
  alt?: string;
  className?: string;
}) {
  if (image) {
    return (
      <span
        className={cn(
          "inline-flex aspect-square h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-sm",
          className,
        )}
      >
        <Image
          src={image}
          alt={alt}
          width={160}
          height={160}
          sizes="80px"
          className="h-full w-full object-contain"
        />
      </span>
    );
  }
  if (sign) return <SignGlyph sign={sign} className={className} />;
  return null;
}
