"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { localSessionRecap, type SessionRecapData } from "@/lib/ai/coach";
import { cn, glass } from "@/lib/utils";

/**
 * The coach's 2–3 sentence read on the session just finished. Fetches once on
 * mount; any failure falls back to the local template so the end-of-session
 * moment never shows an error.
 */
export function SessionRecap({ data, className }: { data: SessionRecapData; className?: string }) {
  const [text, setText] = React.useState<string | null>(null);
  // The session is over when this mounts — snapshot the stats once.
  const dataRef = React.useRef(data);

  React.useEffect(() => {
    const controller = new AbortController();
    fetch("/api/coach", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "session_recap", data: dataRef.current }),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`coach ${r.status}`))))
      .then((j: { text?: string }) =>
        setText(j.text && typeof j.text === "string" ? j.text : localSessionRecap(dataRef.current)),
      )
      .catch((err: unknown) => {
        if ((err as Error)?.name !== "AbortError") setText(localSessionRecap(dataRef.current));
      });
    return () => controller.abort();
  }, []);

  return (
    <Card className={cn(glass, "p-5 text-left", className)}>
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Sparkles className="h-4 w-4" /> Coach&apos;s recap
      </div>
      {text ? (
        <p className="mt-2 animate-fade-in text-sm leading-relaxed text-foreground">{text}</p>
      ) : (
        <div className="mt-3 space-y-2" aria-label="Writing your recap">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
      )}
    </Card>
  );
}
