"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminEmail } from "@/lib/admin/auth";
import type { ActionResult } from "@/lib/forms/action-result";
import { recordManualRefund, retryRefundNow, stopRefundRetries } from "@/lib/billing/pending-refunds";

/**
 * Every admin mutation. Each one re-checks the allowlist itself rather than
 * trusting that the page which rendered the form did — a server action is a
 * public POST endpoint wearing a form's clothes, and the check on the page is
 * about what gets *drawn*, not about what may be *done*.
 */

// ── Money-back refunds Paystack could not pay (/admin/refunds) ───────────────
//
// Each helper re-reads the queue row and compares-and-sets its status, so a
// stale tab cannot record an EFT against a refund the cron has since paid.

/** The allowlist check plus who is acting, for the audit trail on the row. */
async function refundGuard() {
  const email = await adminEmail();
  const admin = email ? createAdminClient() : null;
  return email && admin ? { admin, email } : null;
}

export async function retryRefund(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ctx = await refundGuard();
  if (!ctx) return { ok: false, message: "Not permitted." };
  const outcome = await retryRefundNow(ctx.admin, String(form.get("id") ?? ""));
  revalidatePath("/admin/refunds");
  return outcome;
}

export async function stopRefund(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ctx = await refundGuard();
  if (!ctx) return { ok: false, message: "Not permitted." };
  const outcome = await stopRefundRetries(ctx.admin, String(form.get("id") ?? ""), ctx.email);
  revalidatePath("/admin/refunds");
  return outcome;
}

export async function recordRefundPaid(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const ctx = await refundGuard();
  if (!ctx) return { ok: false, message: "Not permitted." };
  const reference = String(form.get("reference") ?? "").trim();
  if (!reference) return { ok: false, message: "Enter the EFT reference from your bank." };
  const outcome = await recordManualRefund(ctx.admin, String(form.get("id") ?? ""), {
    reference: reference.slice(0, 200),
    by: ctx.email,
  });
  revalidatePath("/admin/refunds");
  return outcome;
}
