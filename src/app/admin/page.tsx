import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, glass, glassSubtle } from "@/lib/utils";
import { partnerSnapshot, summarise, rand } from "@/lib/partners/admin-data";

export default async function AdminOverview() {
  const snapshot = await partnerSnapshot();
  if (!snapshot) {
    return (
      <Card className={cn(glass, "p-6")}>
        <h1 className="font-display text-lg font-semibold">Storage is not configured</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The partner programme needs <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code>.
          Nothing is being recorded until it is set.
        </p>
      </Card>
    );
  }

  const summaries = summarise(snapshot);
  const total = (pick: (s: (typeof summaries)[number]) => number) =>
    summaries.reduce((sum, s) => sum + pick(s), 0);

  const attributed = total((s) => s.attributed);
  const converted = total((s) => s.converted);
  const heldCount = total((s) => s.heldCount);
  const clawback = total((s) => s.clawbackCents);
  const readyToPay = summaries.filter((s) => s.netPayableCents > 0);

  const stats = [
    { label: "Active schools", value: String(summaries.filter((s) => s.school.status === "active").length) },
    { label: "Learners attributed", value: String(attributed) },
    {
      label: "Converted",
      value: attributed === 0 ? "—" : `${converted} · ${Math.round((converted / attributed) * 100)}%`,
    },
    { label: "Pending (in hold)", value: rand(total((s) => s.pendingCents)) },
    { label: "Payable now", value: rand(total((s) => s.payableCents)), emphasis: true },
    { label: "Paid to date", value: rand(total((s) => s.paidCents)) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            R20 per converted learner, held {" "}
            <span className="tabular-nums">8</span> days, paid by EFT.
          </p>
        </div>
        <Link href="/admin/payouts" className={cn(buttonVariants(), "press")}>
          Go to payouts
        </Link>
      </div>

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

      {/* Two things that silently cost money if nobody looks at them. */}
      {(heldCount > 0 || clawback > 0) && (
        <Card className={cn(glass, "space-y-3 p-5")}>
          <h2 className="font-display text-base font-semibold">Needs a decision</h2>
          {heldCount > 0 && (
            <p className="text-sm">
              <Badge variant="warning">{heldCount} held</Badge>{" "}
              <span className="text-muted-foreground">
                commissions matured into review instead of becoming payable. A partner is waiting on
                money until these are released or the school is suspended.
              </span>
            </p>
          )}
          {clawback > 0 && (
            <p className="text-sm">
              <Badge variant="danger">{rand(clawback)} clawback</Badge>{" "}
              <span className="text-muted-foreground">
                already paid out and since refunded. It is deducted automatically from the next
                payout to that school.
              </span>
            </p>
          )}
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-base font-semibold">Ready to pay</h2>
        {readyToPay.length === 0 ? (
          <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
            Nothing is payable yet. Commissions appear here once they clear the 8-day hold.
          </Card>
        ) : (
          <Card className={cn(glass, "divide-y divide-border/50")}>
            {readyToPay.map((s) => (
              <Link
                key={s.school.id}
                href={`/admin/schools/${s.school.id}`}
                className="flex flex-wrap items-center gap-3 p-4 transition-colors hover:bg-muted/40"
              >
                <span className="min-w-0 flex-1 truncate font-medium">{s.school.name}</span>
                {!s.clearsMinimum && <Badge variant="outline">below minimum</Badge>}
                <span className="tabular-nums font-semibold">{rand(s.netPayableCents)}</span>
              </Link>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
