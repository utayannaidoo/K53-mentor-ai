import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, glass, glassFloat, glassSubtle } from "@/lib/utils";
import { verifyStatementToken } from "@/lib/partners/statement-token";
import { schoolStatement } from "@/lib/partners/statement";
import { rand } from "@/lib/partners/admin-data";
import { SITE_URL, SUPPORT_EMAIL } from "@/lib/constants";
import { MONEY_BACK_DAYS } from "@/lib/billing/refund-policy";

export const metadata: Metadata = {
  title: "Your referral statement",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * A school's own numbers, opened by link rather than by signing in.
 *
 * The token is the credential (see statement-token.ts). A wrong or missing one
 * is a 404, not a "forbidden" — there is no reason to confirm to a stranger
 * that a given code exists.
 */
export default async function PartnerStatement({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const [{ code }, { t }] = await Promise.all([params, searchParams]);
  if (!t || !verifyStatementToken(code, t)) notFound();
  const statement = await schoolStatement(code);
  if (!statement) notFound();

  const stats = [
    { label: "Learners signed up", value: String(statement.signedUp) },
    { label: "Subscribed", value: String(statement.converted) },
    { label: "Earned, still in hold", value: rand(statement.pendingCents) },
    { label: "Ready to be paid", value: rand(statement.payableCents), emphasis: true },
    { label: "Paid to you", value: rand(statement.paidCents) },
    {
      label: "Last payment",
      value: statement.lastPaidAt
        ? new Date(statement.lastPaidAt).toLocaleDateString("en-ZA", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "—",
    },
  ];

  return (
    <div className="bg-app min-h-dvh">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        <header>
          <p className="text-2xs uppercase tracking-wide text-muted-foreground">
            K53 Mentor partner statement
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {statement.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              code <code className="ml-1 font-mono">{statement.code}</code>
            </Badge>
            {statement.status !== "active" && (
              <Badge variant="warning">{statement.status}</Badge>
            )}
          </div>
        </header>

        <Card className={cn(glassFloat, "p-5")}>
          <p className="text-sm text-muted-foreground">
            Your referral link — anyone who signs up through it is credited to you automatically.
          </p>
          <p className="mt-2 break-all font-mono text-sm">
            {SITE_URL}/signup?school={statement.code}
          </p>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className={cn(glassSubtle, "p-4")}>
              <p className="text-2xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <p
                className={cn(
                  "mt-1 font-display text-2xl font-semibold tabular-nums",
                  stat.emphasis && "text-primary",
                )}
              >
                {stat.value}
              </p>
            </Card>
          ))}
        </div>

        <Card className={cn(glass, "space-y-2 p-5 text-sm text-muted-foreground")}>
          <h2 className="font-display text-base font-semibold text-foreground">
            How the numbers work
          </h2>
          <p>
            You earn <strong className="text-foreground">R20</strong> for every learner who signs up
            with your code and subscribes — the same R20 whichever plan they choose, and whether
            they pay monthly or annually.
          </p>
          <p>
            New earnings sit in hold for {MONEY_BACK_DAYS + 1} days, because every learner can ask
            for their money back within {MONEY_BACK_DAYS} days. After that they move to{" "}
            <em>ready to be paid</em> and go out in the next EFT run.
          </p>
          <p>
            Questions about anything here:{" "}
            <a className="text-primary underline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
            . Full terms are on the{" "}
            <Link className="text-primary underline" href="/partners/terms">
              partner terms
            </Link>{" "}
            page.
          </p>
        </Card>
      </div>
    </div>
  );
}
