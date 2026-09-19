import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn, glass, glassSubtle } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { currentSchool } from "@/lib/schools/auth";
import { DEMO_SCHOOL } from "@/lib/schools/demo";
import { schoolLearners } from "@/lib/schools/diary";
import { memberNamesByUser, schoolLedger } from "@/lib/schools/ledger";
import { collectedIn, formatRand, learnerBalance, packageChoices } from "@/lib/schools/money";
import { schoolDay } from "@/lib/schools/time";
import { learnerName, whatsappLink } from "@/lib/schools/diary-types";
import { PaymentList } from "@/components/schools/payment-list";
import { RecordPaymentForm } from "@/components/schools/record-payment-form";

export const metadata: Metadata = { title: "Money" };

/**
 * Who owes the school, and what came in.
 *
 * "Who owes you" leads because it is the question a driving school cannot
 * answer today without paging through a book — and the one a reminder can
 * fix, so each row carries a WhatsApp nudge with the amount already typed.
 *
 * The month's takings are shown to the owner and the office only. Every
 * member can read the ledger (they need a learner's balance), so this is
 * courtesy rather than security: an owner may not want the instructors
 * reading the month's revenue off the first screen.
 */
export default async function SchoolMoney() {
  const school = (isSupabaseConfigured ? await currentSchool() : DEMO_SCHOOL)!;
  const [learners, ledger, takenBy] = await Promise.all([
    schoolLearners(school),
    schoolLedger(school),
    memberNamesByUser(school),
  ]);
  const today = schoolDay(new Date(), school.timezone);
  const month = today.slice(0, 7);
  const names = new Map(learners.map((l) => [l.id, learnerName(l)]));
  const seesTotals = school.role !== "instructor";
  const canVoid = school.access === "full" && school.role !== "instructor";

  const owing = learners
    .map((learner) => ({
      learner,
      balance: learnerBalance(learner.id, ledger.packages, ledger.payments, ledger.lessons).balanceCents,
    }))
    .filter((row) => row.balance > 0)
    .sort((a, b) => b.balance - a.balance);
  const outstanding = owing.reduce((sum, row) => sum + row.balance, 0);
  const recent = ledger.payments.slice(0, 30);
  const current = learners.filter((l) => l.status !== "left");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Money</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Who still owes, and every payment taken.
        </p>
      </div>

      {seesTotals ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Card className={cn(glassSubtle, "p-4")}>
            <p className="text-2xs uppercase tracking-wide text-muted-foreground">In this month</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
              {formatRand(collectedIn(month, ledger.payments))}
            </p>
          </Card>
          <Card className={cn(glassSubtle, "p-4")}>
            <p className="text-2xs uppercase tracking-wide text-muted-foreground">Outstanding</p>
            <p className={cn("mt-1 font-display text-2xl font-semibold tabular-nums", outstanding > 0 && "text-primary")}>
              {formatRand(outstanding)}
            </p>
          </Card>
          <Card className={cn(glassSubtle, "col-span-2 p-4 sm:col-span-1")}>
            <p className="text-2xs uppercase tracking-wide text-muted-foreground">Learners owing</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{owing.length}</p>
          </Card>
        </div>
      ) : null}

      <div className="space-y-3">
        <h2 className="font-display text-base font-semibold">Who owes you</h2>
        {owing.length === 0 ? (
          <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
            Nobody owes anything right now. Sell a package or put a price on a lesson and it shows
            up here until it&apos;s paid.
          </Card>
        ) : (
          <Card className={cn(glass, "divide-y divide-border/50")}>
            {owing.map(({ learner, balance }) => {
              const nudge = whatsappLink(
                learner.phone,
                `Hi ${learner.first_name}, a friendly reminder from ${school.name}: ${formatRand(balance)} is outstanding on your lessons. Thank you!`,
              );
              return (
                <div key={learner.id} className="flex flex-wrap items-center gap-3 p-4">
                  <Link
                    href={`/schools/learners/${learner.id}`}
                    className="min-w-0 flex-1 truncate font-medium hover:underline"
                  >
                    {learnerName(learner)}
                  </Link>
                  <span className="font-display text-base font-semibold tabular-nums">
                    {formatRand(balance)}
                  </span>
                  {nudge ? (
                    <a
                      href={nudge}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: "outline" }), "press")}
                    >
                      Remind
                    </a>
                  ) : null}
                </div>
              );
            })}
          </Card>
        )}
      </div>

      {school.access === "full" ? (
        <details className="group">
          <summary className="cursor-pointer list-none">
            <span className={cn(buttonVariants(), "press")}>Record a payment</span>
          </summary>
          <Card className={cn(glass, "mt-3 p-5")}>
            <RecordPaymentForm
              learners={current}
              packageOptions={packageChoices(ledger.packages, ledger.lessons, names)}
              today={today}
            />
          </Card>
        </details>
      ) : null}

      <div className="space-y-3">
        <h2 className="font-display text-base font-semibold">Recent payments</h2>
        {recent.length === 0 ? (
          <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
            No payments yet.
          </Card>
        ) : (
          <Card className={cn(glass, "divide-y divide-border/50")}>
            <PaymentList payments={recent} learnerNames={names} takenBy={takenBy} canVoid={canVoid} />
          </Card>
        )}
      </div>
    </div>
  );
}
