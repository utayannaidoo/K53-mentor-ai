"use client";

import * as React from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";

/**
 * A Link that reports which landing CTA was tapped.
 *
 * The marketing sections are server components; this tiny island is the only
 * client code they need to attribute top-of-funnel clicks ("hero" vs "nav" vs
 * "cta_band" vs a specific pricing card). Without it the funnel's first
 * measured step sat deep inside onboarding, so no landing section's
 * contribution could be compared.
 */
export function TrackedLink({
  location,
  href,
  children,
  className,
  ariaLabel,
}: {
  location: string;
  href: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={() => track("cta_clicked", { location })}
    >
      {children}
    </Link>
  );
}
