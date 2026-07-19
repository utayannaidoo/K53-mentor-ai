import { Skeleton } from "@/components/ui/skeleton";
import { LogoMark } from "@/components/shared/logo";

/**
 * Shell-shaped loading state shown while the study store hydrates. Mirrors
 * the AppShell geometry (sidebar rail + topbar + content cards) so the page
 * doesn't flash from a centered spinner to a full layout — better perceived
 * performance on slow connections.
 */
export function AppShellSkeleton() {
  return (
    <div className="flex min-h-dvh bg-background bg-app" aria-busy aria-label="Loading">
      {/* Desktop sidebar rail */}
      <aside className="glass-panel sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r px-3 py-4 md:flex">
        <div className="px-2 py-1">
          <LogoMark className="h-8 w-8" />
        </div>
        <div className="mt-6 flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-panel sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 sm:px-6">
          <Skeleton className="h-4 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </header>
        <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-10">
          <Skeleton className="h-7 w-56" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="mt-4 h-64 w-full rounded-xl" />
        </main>
      </div>
    </div>
  );
}
