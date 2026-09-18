"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SchoolTab {
  href: string;
  label: string;
  /** Active when the path equals this or starts with `${match}/`. */
  match: string;
  /**
   * Active only on an exact match. The diary lives at `/schools` itself, the
   * prefix of every other tab, so a prefix match would light it up everywhere.
   */
  exact?: boolean;
}

/**
 * The instructor's whole navigation.
 *
 * A bottom bar and nothing else: this is used one-handed, in a car, on a
 * phone. The learner app carries six destinations and is already tight at
 * 360px, so this one is capped at four and grows by replacing, not appending.
 *
 * The only client component in the shell — it exists because an active tab
 * needs the current path, and for no other reason.
 */
export function SchoolTabs({ tabs }: { tabs: SchoolTab[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="School sections"
      className="glass-panel fixed inset-x-0 bottom-0 z-40 border-t border-border/50 pb-[max(0px,env(safe-area-inset-bottom))]"
    >
      <ul className="mx-auto flex max-w-3xl">
        {tabs.map((tab) => {
          const active =
            pathname === tab.match || (!tab.exact && pathname.startsWith(`${tab.match}/`));
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 px-2 py-2 text-2xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-0.5 w-6 rounded-full transition-colors",
                    active ? "bg-primary" : "bg-transparent",
                  )}
                />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
