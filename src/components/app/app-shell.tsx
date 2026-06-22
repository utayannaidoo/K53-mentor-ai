"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  LineChart,
  Car,
  MessageSquareText,
  Settings,
  Flame,
  Sparkles,
  Lock,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PageLoader } from "@/components/shared/page-loader";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useStudyStore } from "@/hooks/use-study-store";
import { hasFeature } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  match: (path: string) => boolean;
  lockedForFree?: boolean;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard, match: (p) => p === "/dashboard" },
  { href: "/study", label: "Study", icon: GraduationCap, match: (p) => p.startsWith("/study") },
  { href: "/tutor", label: "Tutor", icon: MessageSquareText, match: (p) => p.startsWith("/tutor") },
  { href: "/dashboard/progress", label: "Progress", icon: LineChart, match: (p) => p === "/dashboard/progress" },
  { href: "/licence-prep", label: "Licence Prep", icon: Car, match: (p) => p.startsWith("/licence-prep"), lockedForFree: true },
  { href: "/account", label: "Account", icon: Settings, match: (p) => p.startsWith("/account") },
];

const MOBILE_NAV = NAV.filter((n) =>
  ["/dashboard", "/study", "/tutor", "/dashboard/progress", "/account"].includes(n.href),
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, isAuthed, state } = useStudyStore();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (ready && !isAuthed) router.replace("/login");
  }, [ready, isAuthed, router]);

  if (!ready || !isAuthed) {
    return <PageLoader />;
  }

  const isPlus = state.tier === "premium_plus";
  const firstName = state.profile?.name?.split(" ")[0] ?? "Learner";

  return (
    <div className="flex min-h-dvh bg-background bg-app">
      {/* Desktop sidebar */}
      <aside className="glass-panel sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r px-3 py-4 shadow-[10px_0_30px_-22px_hsl(var(--shadow)/0.5)] md:flex">
        <Link href="/dashboard" className="px-2 py-1">
          <Logo />
        </Link>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = item.match(pathname);
            const locked = item.lockedForFree && !hasFeature(state.tier, "licencePrep");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "press flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  active
                    ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.18)]"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <item.icon className="h-[1.15rem] w-[1.15rem]" />
                <span className="flex-1">{item.label}</span>
                {locked && <Lock className="h-3.5 w-3.5 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {!isPlus && (
          <Link
            href="/account/billing"
            className="mt-4 block rounded-xl border border-primary/20 bg-primary/[0.06] p-4 backdrop-blur-md transition-colors hover:bg-primary/10"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" /> Upgrade
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {state.tier === "free"
                ? "Unlock the tutor, scenarios & unlimited practice."
                : "Get driver's-licence prep & advanced analytics."}
            </p>
          </Link>
        )}
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-panel sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 sm:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <LogoMark className="h-8 w-8" />
          </div>
          <p className="hidden text-sm text-muted-foreground md:block">
            Good to see you, <span className="font-medium text-foreground">{firstName}</span>
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="accent" className="gap-1">
              <Flame className="h-3 w-3" />
              {state.streak.current} {state.streak.current === 1 ? "day" : "days"}
            </Badge>
            <ThemeToggle />
            <Link href="/account" aria-label="Account">
              <Avatar name={state.profile?.name ?? "Learner"} className="h-8 w-8" />
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-10">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="glass-panel fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t md:hidden">
        {MOBILE_NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-2xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/** Shared section header used across app pages. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
