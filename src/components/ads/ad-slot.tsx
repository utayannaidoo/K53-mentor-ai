"use client";

import * as React from "react";
import Link from "next/link";
import { useStudyStore } from "@/hooks/use-study-store";
import { showsAds } from "@/lib/billing/plans";
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
 * One ad unit for free-plan learners.
 *
 * Renders nothing for paid plans, and nothing in production until AdSense is
 * configured. In development an unconfigured slot shows a labelled placeholder
 * so the layout can be reviewed without an AdSense account.
 *
 * Ads are requested non-personalised. Learners here can be 16 or 17, and there
 * is no consent banner; contextual ads need neither. Serving personalised ads
 * would need a consent flow first.
 */
export function AdSlot({ className }: { className?: string }) {
  const { state, ready, accountHydrated } = useStudyStore();
  const ref = React.useRef<HTMLModElement>(null);
  // Wait for the account: before hydration a subscriber can look free for a
  // moment, and an ad request made then cannot be taken back.
  const show = ready && accountHydrated && showsAds(state.tier);

  React.useEffect(() => {
    if (!show || !isAdsConfigured) return;
    const el = ref.current;
    // AdSense marks a filled unit; pushing twice for one <ins> throws.
    if (!el || el.dataset.adsbygoogleStatus) return;
    try {
      ensureAdScript();
      const queue = (window.adsbygoogle = window.adsbygoogle || []);
      queue.requestNonPersonalizedAds = 1;
      queue.push({});
    } catch {
      // An ad that fails to load must never break a study page.
    }
  }, [show]);

  if (!show) return null;
  if (!isAdsConfigured && process.env.NODE_ENV === "production") return null;

  return (
    <aside aria-label="Advertisement" className={cn("mx-auto w-full max-w-5xl", className)}>
      <div className="mb-1.5 flex items-center justify-between text-2xs text-muted-foreground">
        <span className="uppercase tracking-wide">Advertisement</span>
        <Link href="/account/billing?buy=premium" className="font-medium text-primary hover:underline">
          Remove ads
        </Link>
      </div>
      {/* Height is reserved so a late-filling ad never shifts the page. */}
      <div className="min-h-[100px] overflow-hidden rounded-xl border border-border/60 bg-muted/30">
        {isAdsConfigured ? (
          <ins
            ref={ref}
            className="adsbygoogle block"
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={ADSENSE_SLOT_APP}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className="flex min-h-[100px] items-center justify-center text-xs text-muted-foreground">
            Ad placeholder (set NEXT_PUBLIC_ADSENSE_CLIENT to serve real ads)
          </div>
        )}
      </div>
    </aside>
  );
}
