"use client";

import { AdUnit } from "@/components/ads/ad-unit";
import { useStudyStore } from "@/hooks/use-study-store";
import { showsAds } from "@/lib/billing/plans";

/**
 * An ad for free-plan learners inside the signed-in app. Renders nothing for
 * paid plans, who then never request the ad script.
 *
 * It stays one ad for as long as it is mounted, so a screen that wants a new ad
 * at a new moment has to mount a new slot (see AppShell, and the session
 * summaries). Never remount one on a timer or per question: refreshing an ad
 * without a real change of page is what AdSense calls invalid inventory.
 */
export function AdSlot({ className }: { className?: string }) {
  const { state, ready, accountHydrated } = useStudyStore();
  // Wait for the account: before hydration a subscriber can look free for a
  // moment, and an ad request made then cannot be taken back.
  if (!ready || !accountHydrated || !showsAds(state.tier)) return null;
  return <AdUnit removeAdsHref="/account/billing?buy=premium" className={className} />;
}
