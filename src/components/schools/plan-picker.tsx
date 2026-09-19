"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SchoolPlan, SchoolPlanId } from "@/lib/billing/school-plans";

/**
 * Choose a plan and go to Paystack's hosted checkout.
 *
 * Only "which plan, which cycle" leaves the browser; the price and the Plan
 * code are decided on the server (/api/schools/checkout). The prices shown
 * here come from the same catalogue, passed down from the page.
 */
export function SchoolPlanPicker({
  plans,
  currentPlan,
  seatsUsed,
  annualMonths,
}: {
  plans: SchoolPlan[];
  currentPlan: string;
  seatsUsed: number;
  annualMonths: number;
}) {
  const [cycle, setCycle] = React.useState<"monthly" | "annual">("monthly");
  const [busy, setBusy] = React.useState<SchoolPlanId | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  async function choose(plan: SchoolPlanId) {
    setBusy(plan);
    setMessage(null);
    try {
      const res = await fetch("/api/schools/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan, cycle }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setMessage(data.error ?? "Checkout could not start. Please try again.");
    } catch {
      setMessage("You seem to be offline. Try again when you have signal.");
    }
    setBusy(null);
  }

  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Billing cycle" className="inline-flex rounded-full border border-border/70 p-1 text-sm">
        {(["monthly", "annual"] as const).map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={cycle === c}
            onClick={() => setCycle(c)}
            className={cn(
              "min-h-10 rounded-full px-4 transition-colors",
              cycle === c ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {c === "monthly" ? "Monthly" : `Yearly · ${12 - annualMonths} months free`}
          </button>
        ))}
      </div>

      <div className="divide-y divide-border/50">
        {plans.map((plan) => {
          const tooSmall = seatsUsed > plan.seats;
          const price = cycle === "annual" ? plan.monthlyZar * annualMonths : plan.monthlyZar;
          return (
            <div key={plan.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {plan.name}
                  {currentPlan === plan.id ? <span className="ml-2 text-2xs text-primary">current</span> : null}
                </p>
                <p className="mt-0.5 text-2xs text-muted-foreground">
                  R{price.toLocaleString("en-ZA")} {cycle === "annual" ? "a year" : "a month"} · up to {plan.seats}{" "}
                  {plan.seats === 1 ? "instructor" : "instructors"}
                  {tooSmall ? ` · you have ${seatsUsed}` : ""}
                </p>
              </div>
              <Button
                type="button"
                variant={plan.id === "team" ? "default" : "secondary"}
                disabled={busy !== null || tooSmall}
                loading={busy === plan.id}
                loadingText="Opening…"
                onClick={() => choose(plan.id)}
                className="press"
              >
                Choose
              </Button>
            </div>
          );
        })}
      </div>
      {message ? (
        <p role="status" className="text-sm text-danger">
          {message}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Put a new card on the running plan, or stop it renewing. Both go through
 * /api/schools/billing; the card itself is only ever typed into Paystack's page.
 */
export function SchoolBillingActions({
  cancelAtPeriodEnd,
  periodEnd,
}: {
  cancelAtPeriodEnd: boolean;
  /** Already formatted for display, or null when not recorded. */
  periodEnd: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<"cancel" | "update_card" | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  async function run(action: "cancel" | "update_card") {
    if (
      action === "cancel" &&
      !window.confirm(
        `Stop your plan renewing? Nothing more is charged. The workspace stays fully usable ${
          periodEnd ? `until ${periodEnd}` : "until the period you've paid for ends"
        }, then becomes read-only — every record stays.`,
      )
    ) {
      return;
    }
    setBusy(action);
    setMessage(null);
    try {
      const res = await fetch("/api/schools/billing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.ok && action === "update_card" && data.url) {
        window.location.assign(data.url);
        return;
      }
      if (res.ok) {
        router.refresh();
      } else {
        setMessage(data.error ?? "That didn't work. Please try again.");
      }
    } catch {
      setMessage("You seem to be offline. Try again when you have signal.");
    }
    setBusy(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={busy !== null}
          loading={busy === "update_card"}
          loadingText="Opening…"
          onClick={() => run("update_card")}
          className="press"
        >
          Update card
        </Button>
        {cancelAtPeriodEnd ? null : (
          <Button
            type="button"
            variant="ghost"
            disabled={busy !== null}
            loading={busy === "cancel"}
            loadingText="Stopping…"
            onClick={() => run("cancel")}
            className="press"
          >
            Stop renewing
          </Button>
        )}
      </div>
      {message ? (
        <p role="status" className="text-sm text-danger">
          {message}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Back from Paystack: confirm the payment through the same verify route the
 * learner checkout uses (one grant path, one ledger), then refresh so the
 * page shows the new plan. Rule S8 — never claim "paid" before it landed.
 */
export function SchoolBillingReturn() {
  const params = useSearchParams();
  const router = useRouter();
  const reference = params.get("reference") ?? params.get("trxref");
  const [state, setState] = React.useState<"idle" | "checking" | "done" | "pending">("idle");

  React.useEffect(() => {
    if (!reference || params.get("billing") !== "success") return;
    let cancelled = false;
    setState("checking");
    (async () => {
      for (let attempt = 0; attempt < 5 && !cancelled; attempt++) {
        const res = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ reference }),
        }).catch(() => null);
        const data = (await res?.json().catch(() => ({}))) as { verified?: boolean } | undefined;
        if (res?.ok && data?.verified) {
          if (!cancelled) {
            setState("done");
            router.replace("/schools/settings");
            router.refresh();
          }
          return;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (!cancelled) setState("pending");
    })();
    return () => {
      cancelled = true;
    };
  }, [reference, params, router]);

  if (state === "idle" || state === "done") return null;
  return (
    <p role="status" className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-sm">
      {state === "checking"
        ? "Confirming your payment with Paystack…"
        : "Your payment is still being confirmed. It usually lands within a minute — refresh this page shortly."}
    </p>
  );
}
