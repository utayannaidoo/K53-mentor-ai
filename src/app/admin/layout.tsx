import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminEmail } from "@/lib/partners/admin-auth";
import { cn } from "@/lib/utils";

/**
 * The admin area's only gate.
 *
 * `notFound()` rather than a redirect to /login: /admin should not advertise
 * that it exists to a learner who wanders into it, and there is nothing useful
 * for them to sign in *as*. Every child page and every server action in
 * `actions.ts` re-checks independently — this layout decides what is drawn, not
 * what may be done.
 */
export const metadata: Metadata = {
  title: "Partner admin",
  robots: { index: false, follow: false },
};

// The whole area reads live money. A cached render would show an owner a payout
// queue that was already paid.
export const dynamic = "force-dynamic";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/schools", label: "Schools" },
  { href: "/admin/payouts", label: "Payouts" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const email = await adminEmail();
  if (!email) notFound();
  return (
    <div className="bg-app min-h-dvh">
      <header className="glass-panel sticky top-0 z-30 border-b border-border/50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="font-display text-sm font-semibold tracking-tight">
            Partner admin
          </Link>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Admin sections">
            {TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors",
                  "hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
          <p className="ml-auto truncate text-2xs text-muted-foreground">{email}</p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
