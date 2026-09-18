import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SchoolTabs, type SchoolTab } from "@/components/schools/school-tabs";
import type { SchoolContext } from "@/lib/schools/auth";

/**
 * The school workspace chrome.
 *
 * Deliberately not `AppShell`: that component's first line is `useStudyStore()`
 * and it blocks on `accountHydrated`, so reusing it would mount the entire
 * question bank to draw a nav bar. This shell is a server component with one
 * small client island (the tab bar), which is the whole point — the learner app
 * ships content, the school app must ship almost nothing.
 */

/**
 * Grows one slice at a time. Only destinations that exist are listed, because
 * a tab that leads nowhere is worse than a missing tab.
 */
const TABS: SchoolTab[] = [
  { href: "/schools", label: "Diary", match: "/schools", exact: true, also: ["/schools/lessons"] },
  { href: "/schools/learners", label: "Learners", match: "/schools/learners" },
  { href: "/schools/money", label: "Money", match: "/schools/money" },
  {
    href: "/schools/more",
    label: "More",
    match: "/schools/more",
    also: ["/schools/vehicles", "/schools/settings", "/schools/enquiries", "/schools/reports"],
  },
];

export function SchoolShell({
  school,
  children,
}: {
  school: SchoolContext;
  children: React.ReactNode;
}) {
  const trialDaysLeft = school.trialEndsAt
    ? Math.ceil((Date.parse(school.trialEndsAt) - Date.now()) / 86_400_000)
    : null;

  return (
    <div className="bg-app min-h-dvh">
      <header className="glass-panel sticky top-0 z-30 border-b border-border/50">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/schools" className="min-w-0 flex-1 truncate">
            <span className="font-display text-sm font-semibold tracking-tight">{school.name}</span>
          </Link>
          {school.access === "read_only" ? (
            <Badge variant="warning">read-only</Badge>
          ) : school.status === "trialing" && trialDaysLeft !== null ? (
            <Badge variant="secondary">
              {trialDaysLeft > 0 ? `${trialDaysLeft} days left` : "trial ended"}
            </Badge>
          ) : null}
          <Badge variant="outline">{school.role}</Badge>
        </div>
      </header>

      {school.access === "read_only" ? (
        <div className="mx-auto max-w-3xl px-4 pt-4 sm:px-6">
          <p
            role="status"
            className={cn(
              "rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-2xs text-foreground",
            )}
          >
            {school.status === "trialing" ? "Your free trial has ended." : "Your subscription has lapsed."}{" "}
            Everything is still here and still readable — you just can&apos;t add or change anything
            until{" "}
            {school.role === "owner" ? (
              <Link href="/schools/settings#plan" className="font-medium underline underline-offset-2">
                you choose a plan
              </Link>
            ) : (
              "the owner chooses a plan"
            )}
            .
          </p>
        </div>
      ) : school.status === "past_due" && school.role === "owner" ? (
        <div className="mx-auto max-w-3xl px-4 pt-4 sm:px-6">
          <p
            role="status"
            className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-2xs text-foreground"
          >
            Your last payment didn&apos;t go through. Nothing has stopped working —{" "}
            <Link href="/schools/settings#plan" className="font-medium underline underline-offset-2">
              put a new card on the plan
            </Link>{" "}
            so Paystack can try again.
          </p>
        </div>
      ) : null}

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6">
        {children}
      </main>

      <SchoolTabs tabs={TABS} />
    </div>
  );
}
