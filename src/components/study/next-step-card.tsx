"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowRight, Target } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn, glassSubtle } from "@/lib/utils";

/**
 * The single recommended next activity after a session ends.
 *
 * One band, one action — it answers "what should I do now?" at the exact
 * moment the learner is deciding. It renders only when a rule has real data to
 * cite (see `src/lib/learning/next-step.ts`); a session with nothing to act on
 * shows nothing rather than a filler recommendation.
 */
export function NextStepCard({
  title,
  body,
  href,
  cta,
  className,
  onRepeat,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
  className?: string;
  /**
   * Called instead of navigating when `href` points at the screen this card is
   * already on — finishing a road-signs session suggests drilling road signs.
   * An identical URL never navigates, so the owner of this screen's state must
   * reset it in place (fresh queue / back to intro) or the tap looks dead.
   */
  onRepeat?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Query order is irrelevant to routing, so compare sorted entries rather
  // than raw strings (?mode=drill&section=signs vs ?section=signs&mode=drill).
  const repeatsHere = React.useMemo(() => {
    let target: URL;
    try {
      target = new URL(href, "http://next-step.local");
    } catch {
      return false;
    }
    if (target.pathname !== pathname || !onRepeat) return false;
    const byName = ([a]: [string, string], [b]: [string, string]) => a.localeCompare(b);
    const mine = [...searchParams.entries()].sort(byName);
    const theirs = [...target.searchParams.entries()].sort(byName);
    return (
      mine.length === theirs.length &&
      mine.every(([key, value], idx) => key === theirs[idx][0] && value === theirs[idx][1])
    );
  }, [href, onRepeat, pathname, searchParams]);

  return (
    <section
      aria-label="Recommended next step"
      className={cn(
        glassSubtle,
        "rounded-2xl border p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Target className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Recommended next
          </p>
          <h2 className="mt-1 font-display text-base font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-balance">{body}</p>
        </div>
      </div>
      <Link
        href={href}
        onClick={
          repeatsHere
            ? (event) => {
                event.preventDefault();
                onRepeat?.();
              }
            : undefined
        }
        className={cn(buttonVariants(), "mt-4 w-full sm:w-auto")}
      >
        {cta} <ArrowRight />
      </Link>
    </section>
  );
}
