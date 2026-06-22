"use client";

import { LogoMark } from "@/components/shared/logo";

export function PageLoader() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background bg-app">
      <LogoMark className="h-12 w-12 animate-pulse" />
      <div className="flex gap-1.5">
        <Dot />
        <Dot delay="150ms" />
        <Dot delay="300ms" />
      </div>
    </div>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="h-2 w-2 animate-pulse rounded-full bg-primary/50"
      style={{ animationDelay: delay }}
    />
  );
}
