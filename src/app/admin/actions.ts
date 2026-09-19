"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/partners/admin-auth";
import type { ActionResult } from "@/lib/forms/action-result";
import { validSchoolCode, normaliseSchoolCode } from "@/lib/partners/codes";
import { PAYOUT_MINIMUM_CENTS } from "@/lib/partners/admin-data";
import { creditModePartners, linkedWorkspaces, redeemSchoolCredit } from "@/lib/billing/school-credit";

/**
 * Every partner mutation. Each one re-checks the allowlist itself rather than
 * trusting that the page which rendered the form did — a server action is a
 * public POST endpoint wearing a form's clothes, and the check on the page is
 * about what gets *drawn*, not about what may be *done*.
 */

async function guard(): Promise<ReturnType<typeof createAdminClient> | null> {
  if (!(await isAdmin())) return null;
  return createAdminClient();
}

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/admin/schools");
  revalidatePath("/admin/payouts");
}

/**
 * A readable code derived from the school's name — "Kasi Driving School"
 * becomes `kasi-driving`, which is what gets written on a whiteboard. Falls
 * back to a random suffix when the slug is taken or too short to be valid.
 */
function codeFromName(name: string, taken: Set<string>): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 12)
    .replace(/-+$/g, "");
  const seed = base.length >= 6 ? base : `${base || "school"}-k53`.slice(0, 12);
  if (validSchoolCode(seed) && !taken.has(seed)) return seed;
  for (let i = 2; i < 100; i += 1) {
    const candidate = `${seed}-${i}`.slice(0, 16);
    if (validSchoolCode(candidate) && !taken.has(candidate)) return candidate;
  }
  return `school-${Date.now().toString(36).slice(-6)}`;
}

export async function createSchool(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const admin = await guard();
  if (!admin) return { ok: false, message: "Not permitted." };
  const name = String(form.get("name") ?? "").trim();
  const contactName = String(form.get("contact_name") ?? "").trim();
  const contactEmail = String(form.get("contact_email") ?? "").trim();
  if (!name || !contactName || !contactEmail) {
    return { ok: false, message: "Name, contact name and contact email are all required." };
  }
  const { data: existing } = await admin.from("partner_school_codes").select("code");
  const taken = new Set(((existing ?? []) as { code: string }[]).map((row) => row.code));
  const requested = normaliseSchoolCode(String(form.get("code") ?? ""));
  const code = requested ? requested : codeFromName(name, taken);
  if (!validSchoolCode(code)) {
    return { ok: false, message: "A code must be 6–16 characters of a–z, 0–9 and hyphens." };
  }
  if (taken.has(code)) return { ok: false, message: `The code “${code}” is already in use.` };

  const { data: school, error } = await admin
    .from("partner_schools")
    .insert({
      name,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: String(form.get("contact_phone") ?? "").trim() || null,
      town: String(form.get("town") ?? "").trim() || null,
      province: String(form.get("province") ?? "").trim() || null,
      notes: String(form.get("notes") ?? "").trim() || null,
      // Created active: a school added by hand in this form is one the owner
      // has already spoken to. The `pending` state is for self-serve
      // applications from /for-driving-schools, which nobody has vetted yet.
      status: "active",
      activated_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error || !school) {
    console.error("[partners] create school failed", error?.message);
    return { ok: false, message: "Could not create the school." };
  }
  const { error: codeError } = await admin
    .from("partner_school_codes")
    .insert({ school_id: (school as { id: string }).id, code, label: "First code" });
  if (codeError) {
    console.error("[partners] create code failed", codeError.message);
    return { ok: false, message: `School created, but the code “${code}” could not be issued.` };
  }
  refresh();
  return { ok: true, message: `${name} is live with the code ${code}.` };
}

export async function setSchoolStatus(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const admin = await guard();
  if (!admin) return { ok: false, message: "Not permitted." };
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!["pending", "active", "suspended"].includes(status)) {
    return { ok: false, message: "Unknown status." };
  }
  const { error } = await admin
    .from("partner_schools")
    .update({ status, ...(status === "active" ? { activated_at: new Date().toISOString() } : {}) })
    .eq("id", id);
  if (error) {
    console.error("[partners] status change failed", error.message);
    return { ok: false, message: "Could not change the status." };
  }
  refresh();
  revalidatePath(`/admin/schools/${id}`);
  // Suspension is the answer to a leak, so say what it actually did.
  return {
    ok: true,
    message:
      status === "suspended"
        ? "Suspended. Its codes stop attributing immediately and held commissions stop maturing."
        : `Status set to ${status}.`,
  };
}

export async function updateSchool(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const admin = await guard();
  if (!admin) return { ok: false, message: "Not permitted." };
  const id = String(form.get("id") ?? "");
  const commission = Number(form.get("commission_cents"));
  const threshold = Number(form.get("review_threshold"));
  const cap = Number(form.get("monthly_commission_cap"));
  if (!Number.isInteger(commission) || commission <= 0) {
    return { ok: false, message: "The commission must be a whole number of cents above zero." };
  }
  if (!Number.isInteger(threshold) || threshold <= 0 || !Number.isInteger(cap) || cap <= 0) {
    return { ok: false, message: "The review threshold and monthly cap must both be above zero." };
  }
  const { error } = await admin
    .from("partner_schools")
    .update({
      commission_cents: commission,
      review_threshold: threshold,
      monthly_commission_cap: cap,
      bank_account_name: String(form.get("bank_account_name") ?? "").trim() || null,
      bank_name: String(form.get("bank_name") ?? "").trim() || null,
      bank_account_number: String(form.get("bank_account_number") ?? "").trim() || null,
      bank_branch_code: String(form.get("bank_branch_code") ?? "").trim() || null,
      notes: String(form.get("notes") ?? "").trim() || null,
    })
    .eq("id", id);
  if (error) {
    console.error("[partners] school update failed", error.message);
    return { ok: false, message: "Could not save those details." };
  }
  refresh();
  revalidatePath(`/admin/schools/${id}`);
  return { ok: true, message: "Saved." };
}

export async function rotateCode(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const admin = await guard();
  if (!admin) return { ok: false, message: "Not permitted." };
  const id = String(form.get("id") ?? "");
  const code = normaliseSchoolCode(String(form.get("code") ?? ""));
  const reason = String(form.get("reason") ?? "").trim();
  if (!validSchoolCode(code)) {
    return { ok: false, message: "The new code must be 6–16 characters of a–z, 0–9 and hyphens." };
  }
  if (!reason) return { ok: false, message: "Give a reason — it becomes the new code's label." };
  const { error } = await admin.rpc("rotate_school_code", {
    p_school: id,
    p_new_code: code,
    p_reason: reason,
  });
  if (error) {
    console.error("[partners] rotate failed", error.message);
    return {
      ok: false,
      message: error.message.includes("duplicate")
        ? `The code “${code}” is already in use.`
        : "Could not rotate the code.",
    };
  }
  refresh();
  revalidatePath(`/admin/schools/${id}`);
  return {
    ok: true,
    message: `Old codes revoked. ${code} is live — existing credit is untouched.`,
  };
}

export async function releaseHeld(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const admin = await guard();
  if (!admin) return { ok: false, message: "Not permitted." };
  const id = String(form.get("id") ?? "");
  const { data, error } = await admin.rpc("release_held_commissions", { p_school: id });
  if (error) {
    console.error("[partners] release failed", error.message);
    return { ok: false, message: "Could not release those commissions." };
  }
  refresh();
  revalidatePath(`/admin/schools/${id}`);
  const count = typeof data === "number" ? data : 0;
  return {
    ok: true,
    message: count === 0 ? "Nothing was waiting for review." : `Released ${count} for payment.`,
  };
}

export async function markPaid(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const admin = await guard();
  if (!admin) return { ok: false, message: "Not permitted." };
  const id = String(form.get("id") ?? "");
  const reference = String(form.get("reference") ?? "").trim();
  if (!reference) return { ok: false, message: "Enter the EFT reference from your bank." };
  // A school that takes its commission as credit is settled into its plan
  // nightly. Paying it by EFT as well is the one mistake this form could make.
  if (creditModePartners(await linkedWorkspaces(admin)).has(id)) {
    return { ok: false, message: "This school takes its commission as credit, not by EFT." };
  }
  const { data, error } = await admin.rpc("mark_partner_payout_paid", {
    p_school: id,
    p_reference: reference,
    p_note: String(form.get("note") ?? "").trim() || null,
    p_minimum_cents: PAYOUT_MINIMUM_CENTS,
    p_override: form.get("override") === "on",
  });
  if (error) {
    console.error("[partners] payout failed", error.message);
    return {
      ok: false,
      message: error.message.includes("minimum")
        ? "That is below the payout minimum. Tick the override to pay it anyway."
        : "Could not record that payout.",
    };
  }
  refresh();
  revalidatePath(`/admin/schools/${id}`);
  if (!data) {
    return { ok: false, message: "Nothing was payable — it may already have been paid." };
  }
  return { ok: true, message: `Recorded against ${reference}.` };
}

/**
 * Settle a credit-mode school's payable commission into credit now, rather
 * than waiting for tonight's run. Same RPC the cron calls; a second click
 * finds nothing payable.
 */
export async function convertToCredit(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const admin = await guard();
  if (!admin) return { ok: false, message: "Not permitted." };
  const partnerId = String(form.get("partner") ?? "");
  const workspaceId = String(form.get("workspace") ?? "");
  const { data, error } = await admin.rpc("apply_commission_credit", { p_school: workspaceId });
  if (error) {
    console.error("[partners] credit conversion failed", error.message);
    return { ok: false, message: "Could not convert the commission to credit." };
  }
  refresh();
  revalidatePath(`/admin/schools/${partnerId}`);
  const cents = typeof data === "number" ? data : 0;
  return {
    ok: true,
    message: cents > 0 ? `Credited R${(cents / 100).toFixed(2)}.` : "Nothing was payable, or clawbacks cancelled it out.",
  };
}

/**
 * Pay for the workspace's latest charge from its credit: the credit is
 * debited, then the charge is refunded through Paystack, and the credit goes
 * back if Paystack refuses. See redeemSchoolCredit.
 */
export async function redeemCredit(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const admin = await guard();
  if (!admin) return { ok: false, message: "Not permitted." };
  const partnerId = String(form.get("partner") ?? "");
  const workspaceId = String(form.get("workspace") ?? "");
  const outcome = await redeemSchoolCredit(admin, workspaceId);
  refresh();
  revalidatePath(`/admin/schools/${partnerId}`);
  if (!outcome.ok) return { ok: false, message: outcome.message };
  return {
    ok: true,
    message: `Refunded R${(outcome.amountCents / 100).toFixed(2)} of ${outcome.reference} from credit.`,
  };
}
