"use client";

import { CloudDownload, Check, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContentPool } from "@/components/content/content-provider";

/**
 * "Download for offline" — the manual half of the content sync.
 *
 * Devices normally sync in the background on first load, but not when data
 * saver is on: this app is built for prepaid connections, and spending someone's
 * bundle on a ~1MB download they did not ask for is exactly the behaviour the
 * data-saver switch exists to prevent. Without a control here, those learners
 * would sit on the starter pack permanently with no way out and no explanation.
 */
export function OfflinePackRow() {
  const { full, status, sync } = useContentPool();

  const syncing = status === "syncing";

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-start gap-2">
        <CloudDownload className="mt-0.5 h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Full question bank</p>
          <p className="text-sm text-muted-foreground">
            {full
              ? "Saved to this device — you can study without a connection."
              : status === "error"
                ? "Couldn't download. You can still study the starter set."
                : "Download once to study everything offline. About 1 MB."}
          </p>
        </div>
      </div>
      {full ? (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-primary" /> Saved
        </span>
      ) : (
        <Button variant="outline" size="sm" className="gap-2" onClick={sync} disabled={syncing}>
          {syncing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Downloading…
            </>
          ) : status === "error" ? (
            <>
              <RefreshCw className="h-4 w-4" /> Retry
            </>
          ) : (
            <>
              <CloudDownload className="h-4 w-4" /> Download
            </>
          )}
        </Button>
      )}
    </div>
  );
}
