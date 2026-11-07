"use client";

import * as React from "react";
import { AdUnit } from "@/components/ads/ad-unit";
import { publicVisitorSeesAds } from "@/lib/ads";
import { STORAGE_KEY } from "@/lib/store/storage-key";

/**
 * An ad on the public pages (home, guides, road signs, question lists).
 *
 * These pages mount no study store, which is what keeps the question bank off
 * them, so the plan comes from what this browser has cached. They are also
 * statically cached, so the slot renders nothing on the server and decides after
 * mount. The rule itself lives in `publicVisitorSeesAds`.
 */
export function PublicAdSlot({ className }: { className?: string }) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    let stateBlob: string | null = null;
    try {
      stateBlob = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage itself can throw: private mode, blocked site data.
    }
    setShow(publicVisitorSeesAds(stateBlob, document.cookie));
  }, []);

  if (!show) return null;
  return <AdUnit removeAdsHref="/pricing" className={className} />;
}
