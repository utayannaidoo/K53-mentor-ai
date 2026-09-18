import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn, glass } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { currentSchool } from "@/lib/schools/auth";
import { DEMO_SCHOOL } from "@/lib/schools/demo";

export const metadata: Metadata = { title: "More" };

/**
 * Everything that isn't used every day. The bottom bar holds four places at
 * most — Diary, Learners, Money, More — so the rest lives here rather than
 * squeezing a fifth tab onto a 360px screen.
 */
export default async function SchoolMore() {
  const school = (isSupabaseConfigured ? await currentSchool() : DEMO_SCHOOL)!;
  const items = [
    {
      href: "/schools/vehicles",
      title: "Vehicles",
      body:
        school.role === "instructor"
          ? "The school's cars, bikes and trucks, and when their licence discs expire."
          : "Your fleet, so nobody books the same car twice — and licence-disc reminders.",
    },
    {
      href: "/schools/settings",
      title: "Settings",
      body:
        school.role === "owner"
          ? "Your plan, your team and invites, and your referral code."
          : "Your school's plan and team.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">More</h1>
        <p className="mt-1 text-sm text-muted-foreground">{school.name}</p>
      </div>
      <Card className={cn(glass, "divide-y divide-border/50")}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-16 items-center gap-3 p-4 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium">{item.title}</p>
              <p className="mt-0.5 text-2xs text-muted-foreground">{item.body}</p>
            </div>
            <span aria-hidden className="text-muted-foreground">
              ›
            </span>
          </Link>
        ))}
      </Card>
    </div>
  );
}
