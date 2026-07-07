import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = { title: "Offline" };

/** Service-worker fallback when a page isn't cached and the network is gone. */
export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <WifiOff className="h-6 w-6 text-muted-foreground" />
      </div>
      <h1 className="mt-5 font-display text-xl font-semibold tracking-tight">You&apos;re offline</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        No connection right now. Pages you&apos;ve visited recently still work — your progress is
        saved on this device and syncs when you&apos;re back online.
      </p>
      <Link
        href="/study/flashcards"
        className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Review flashcards
      </Link>
    </div>
  );
}
