"use client";

import * as React from "react";
import Link from "next/link";
import { ADSENSE_CLIENT, ADSENSE_SCRIPT_SRC, ADSENSE_SLOT_APP, isAdsConfigured } from "@/lib/ads";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>> & { requestNonPersonalizedAds?: number };
  }
}

/**
 * Load the AdSense script once, and only for a browser that is actually going
 * to show an ad. Subscribers never request it: "no ads" means no ad network on
 * the page at all, not a hidden slot.
 */
function ensureAdScript() {
  if (document.querySelector(`script[src^="${ADSENSE_SCRIPT_SRC}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `${ADSENSE_SCRIPT_SRC}?client=${ADSENSE_CLIENT}`;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}

/**
 * Height held for the ad before it fills. A phone is usually served a 250-280px
 * rectangle, a wider column a shorter banner.
 */
const RESERVED_HEIGHT = "min-h-[250px] sm:min-h-[100px]";

/**
 * One ad unit, with no opinion on who should see it. `AdSlot` (signed-in app)
 * and `PublicAdSlot` (marketing pages) decide that, and render this only once
 * they have. This file must stay free of the study store, because the public
 * pages import it and the store reaches the whole question bank.
 *
 * Renders nothing in production until AdSense is configured. In development an
 * unconfigured unit shows a labelled placeholder so the layout can be reviewed
 * without an AdSense account.
 *
 * The ad is requested only when the unit nears the viewport. Most visitors to
 * the home page never scroll past the hero, and field LCP is already about 4s,
 * so a slot nobody reaches should cost them nothing and not count as an
 * impression nobody saw.
 *
 * Ads are requested non-personalised. Learners here can be 16 or 17, and there
 * is no consent banner; contextual ads need neither. Serving personalised ads
 * would need a consent flow first.
 */
export function AdUnit({
  removeAdsHref,
  className,
}: {
  /** Where "Remove ads" goes: billing for a learner, pricing for a stranger. */
  removeAdsHref: string;
  className?: string;
}) {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const insRef = React.useRef<HTMLModElement>(null);

  React.useEffect(() => {
    const frame = frameRef.current;
    const ins = insRef.current;
    if (!isAdsConfigured || !frame || !ins) return;

    const request = () => {
      // AdSense marks a filled unit; pushing twice for one <ins> throws.
      if (ins.dataset.adsbygoogleStatus) return;
      try {
        ensureAdScript();
        const queue = (window.adsbygoogle = window.adsbygoogle || []);
        queue.requestNonPersonalizedAds = 1;
        queue.push({});
      } catch {
        // An ad that fails to load must never break the page around it.
      }
    };

    if (typeof IntersectionObserver === "undefined") {
      request();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        request();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  if (!isAdsConfigured && process.env.NODE_ENV === "production") return null;

  return (
    // A group, not an <aside>: a page can carry two of these, and two identically
    // named complementary landmarks inside <main> are what axe flags.
    // The whole slot collapses when Google has no ad to serve, so a learner never
    // sees an empty labelled box.
    <div
      role="group"
      aria-label="Advertisement"
      className={cn(
        "mx-auto w-full max-w-5xl has-[ins[data-ad-status=unfilled]]:hidden",
        className,
      )}
    >
      <div className="mb-1.5 flex items-center justify-between text-2xs text-muted-foreground">
        <span className="uppercase tracking-wide">Advertisement</span>
        <Link href={removeAdsHref} className="font-medium text-primary hover:underline">
          Remove ads
        </Link>
      </div>
      <div
        ref={frameRef}
        className={cn(
          "overflow-hidden rounded-xl border border-border/60 bg-muted/30",
          RESERVED_HEIGHT,
        )}
      >
        {isAdsConfigured ? (
          // Full-width responsive stays off: it widens the ad past its parent to
          // the screen edges, and this frame's overflow-hidden would clip it. A
          // clipped ad is a policy problem, not just an ugly one.
          <ins
            ref={insRef}
            className="adsbygoogle block"
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={ADSENSE_SLOT_APP}
            data-ad-format="auto"
            data-full-width-responsive="false"
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center px-4 text-center text-xs text-muted-foreground",
              RESERVED_HEIGHT,
            )}
          >
            Ad placeholder (set the NEXT_PUBLIC_ADSENSE_* values to serve real ads)
          </div>
        )}
      </div>
    </div>
  );
}
