"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { requireSchool } from "@/lib/schools/auth";
import { diaryErrorMessage } from "@/lib/schools/diary-errors";
import { formatRand, parseRand, type PaymentMethod } from "@/lib/schools/money";
import { rpcMessage } from "@/lib/schools/rpc-message";
import { isIsoDay, schoolDay } from "@/lib/schools/time";
import type { ActionResult } from "@/lib/forms/action-result";

/**
 * Every write to the school's own money ledger (0038).
 *
 * Through the signed-in user's client, so row-level security is the boundary:
 * anyone in the school may take a payment or sell a package, only the owner
 * or the office may void a payment or correct a package, and a payment can
 * never be edited at all. The checks here are for a readable answer first.
 */

const DEMO_REFUSAL: ActionResult = { ok: false, message: "Not available in the demo." };
const METHODS: PaymentMethod[] = ["cash", "eft", "card", "snapscan", "other"];
const PACKAGE_STATUSES = ["active", "used", "expired", "refunded"] as const;

function text(form: FormData, name: string, max = 200): string {
  return String(form.get(name) ?? "").trim().slice(0, max);
}

async function userClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  return supabase && user ? { supabase, userId: user.id } : null;
}

function refresh(learnerId?: string) {
  revalidatePath("/schools/money");
  if (learnerId) revalidatePath(`/schools/learners/${learnerId}`);
}

export async function recordPayment(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ write: true });
  if (!guard.ok) return { ok: false, message: guard.message };
  const session = await userClient();
  if (!session) return { ok: false, message: "Sign in again to continue." };

  const learnerId = text(form, "learner_id", 40);
  if (!learnerId) return { ok: false, message: "Pick who paid." };
  const cents = parseRand(text(form, "amount", 20));
  if (!cents) return { ok: false, message: "Enter the amount, e.g. 450 or 450,50." };
  const method = text(form, "method", 10) as PaymentMethod;
  if (!METHODS.includes(method)) return { ok: false, message: "Pick how they paid." };
  const receivedOn = text(form, "received_on", 10) || schoolDay(new Date(), guard.school.timezone);
  if (!isIsoDay(receivedOn)) return { ok: false, message: "That date isn't a real date." };
  // A refund to the learner is money out: recorded as a negative payment so
  // the ledger still adds up without anything being edited.
  const refund = text(form, "direction", 10) === "refund";

  const { error } = await session.supabase.from("school_payments").insert({
    school_id: guard.school.schoolId,
    learner_id: learnerId,
    package_id: text(form, "package_id", 40) || null,
    amount_cents: refund ? -cents : cents,
    method,
    reference: text(form, "reference", 80) || null,
    received_on: receivedOn,
    received_by: session.userId,
    note: text(form, "note", 500) || null,
  });
  if (error) {
    if (error.code === "23503" && error.message.includes("package")) {
      return { ok: false, message: "That package belongs to a different learner." };
    }
    console.error("[schools] record payment failed", error.code, error.message);
    return { ok: false, message: diaryErrorMessage(error, "Could not record that payment.") };
  }
  refresh(learnerId);
  return {
    ok: true,
    message: refund ? `Refund of ${formatRand(cents)} recorded.` : `${formatRand(cents)} recorded.`,
  };
}

export async function voidPayment(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ write: true, roles: ["owner", "assistant"] });
  if (!guard.ok) return { ok: false, message: guard.message };
  const session = await userClient();
  if (!session) return { ok: false, message: "Sign in again to continue." };

  const reason = text(form, "reason", 300);
  if (!reason) return { ok: false, message: "Say why it's being voided — it stays on the record." };

  const { error } = await session.supabase.rpc("void_school_payment", {
    p_payment: text(form, "id", 40),
    p_reason: reason,
  });
  if (error) {
    if (error.code !== "P0001") console.error("[schools] void payment failed", error.code, error.message);
    return { ok: false, message: rpcMessage(error, "Could not void that payment.") };
  }
  refresh(text(form, "learner_id", 40) || undefined);
  return { ok: true, message: "Voided. It stays on the record, crossed out, with your reason." };
}

export async function sellPackage(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ write: true });
  if (!guard.ok) return { ok: false, message: guard.message };
  const session = await userClient();
  if (!session) return { ok: false, message: "Sign in again to continue." };

  const learnerId = text(form, "learner_id", 40);
  const name = text(form, "name", 80);
  if (!learnerId) return { ok: false, message: "Pick the learner." };
  if (!name) return { ok: false, message: "Give the package a name, e.g. 10 lessons." };
  const price = parseRand(text(form, "price", 20));
  if (price === null) return { ok: false, message: "Enter the package price, e.g. 2800." };
  const lessonsRaw = text(form, "lessons_included", 4);
  const lessons = lessonsRaw ? Number(lessonsRaw) : null;
  if (lessons !== null && (!Number.isInteger(lessons) || lessons < 1 || lessons > 200)) {
    return { ok: false, message: "Lessons included has to be a whole number, 1 to 200." };
  }
  const soldOn = text(form, "sold_on", 10) || schoolDay(new Date(), guard.school.timezone);
  const expiresOn = text(form, "expires_on", 10);
  if (!isIsoDay(soldOn) || (expiresOn && !isIsoDay(expiresOn))) {
    return { ok: false, message: "Check the dates." };
  }

  const { error } = await session.supabase.from("school_packages").insert({
    school_id: guard.school.schoolId,
    learner_id: learnerId,
    name,
    lessons_included: lessons,
    price_cents: price,
    sold_on: soldOn,
    expires_on: expiresOn || null,
    created_by: session.userId,
  });
  if (error) {
    console.error("[schools] sell package failed", error.code, error.message);
    return { ok: false, message: diaryErrorMessage(error, "Could not add that package.") };
  }
  refresh(learnerId);
  return { ok: true, message: `${name} added at ${formatRand(price)}. It now counts toward what they owe.` };
}

export async function setPackageStatus(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ write: true, roles: ["owner", "assistant"] });
  if (!guard.ok) return { ok: false, message: guard.message };
  const session = await userClient();
  if (!session) return { ok: false, message: "Sign in again to continue." };

  const status = text(form, "status", 10) as (typeof PACKAGE_STATUSES)[number];
  if (!PACKAGE_STATUSES.includes(status)) return { ok: false, message: "Pick a status." };
  const { data, error } = await session.supabase
    .from("school_packages")
    .update({ status })
    .eq("id", text(form, "id", 40))
    .eq("school_id", guard.school.schoolId)
    .select("learner_id");
  if (error) {
    console.error("[schools] package status failed", error.code, error.message);
    return { ok: false, message: diaryErrorMessage(error, "Could not update that package.") };
  }
  if (!data || data.length === 0) return { ok: false, message: "That package could not be found." };
  refresh((data[0] as { learner_id: string }).learner_id);
  return {
    ok: true,
    message:
      status === "refunded"
        ? "Marked refunded — its price no longer counts. Record the money you gave back as a refund."
        : "Updated.",
  };
}
