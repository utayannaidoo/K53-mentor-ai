import { Card } from "@/components/ui/card";
import { cn, glass } from "@/lib/utils";
import { RefundQueue } from "@/components/admin/refund-queue";
import { createAdminClient } from "@/lib/supabase/admin";
import { refundsForAdmin } from "@/lib/billing/pending-refunds";

/**
 * Money-back refunds Paystack could not pay.
 *
 * A refund can only draw on takings Paystack has not paid out yet, roughly the
 * last two working days of sales in South Africa. When that does not cover it,
 * the row waits in the retry queue, and this page is how it gets settled
 * instead of waiting a fortnight for the cron to give up.
 *
 * Repaying by EFT is two steps on purpose: stop the retries first, so the cron
 * cannot refund the same charge through Paystack the next morning, then record
 * the EFT once it has gone.
 */
export default async function AdminRefunds() {
  const admin = createAdminClient();
  const read = admin ? await refundsForAdmin(admin) : null;

  if (!read || !read.ok) {
    return (
      <Card className={cn(glass, "p-6")}>
        <h1 className="font-display text-lg font-semibold">The refund queue could not be read</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {read
            ? `Supabase said: ${read.message}. If it names manual_reference, migration 0045 has not been applied yet.`
            : "The admin area needs SUPABASE_SERVICE_ROLE_KEY."}
        </p>
      </Card>
    );
  }

  return <RefundQueue open={read.open} settled={read.settled} />;
}
