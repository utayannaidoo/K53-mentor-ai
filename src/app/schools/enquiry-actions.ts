"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { requireSchool } from "@/lib/schools/auth";
import { diaryErrorMessage } from "@/lib/schools/diary-errors";
import { isTestDocument, type EnquirySource, type EnquiryStatus } from "@/lib/schools/test-day";
import { isIsoDay, schoolDay } from "@/lib/schools/time";
import type { LicenceCode } from "@/lib/schools/diary-types";
import type { ActionResult } from "@/lib/forms/action-result";

/**
 * Writes for enquiries, test results and test-day documents (0039), through
 * the signed-in user's own client so row-level security is the boundary.
 */

const DEMO_REFUSAL: ActionResult = { ok: false, message: "Not available in the demo." };
const SOURCES: EnquirySource[] = ["walk_in", "phone", "whatsapp", "website", "referral", "other"];
const STATUSES: EnquiryStatus[] = ["new", "contacted", "booked", "lost"];
const LICENCE_CODES: LicenceCode[] = ["8", "10", "14", "A1", "A"];

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

// ── Enquiries ───────────────────────────────────────────────────────────────

export async function addEnquiry(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ write: true });
  if (!guard.ok) return { ok: false, message: guard.message };
  const session = await userClient();
  if (!session) return { ok: false, message: "Sign in again to continue." };

  const name = text(form, "name", 80);
  if (!name) return { ok: false, message: "Who was it? A name is enough." };
  const source = text(form, "source", 12) as EnquirySource;
  const code = text(form, "licence_code", 4) as LicenceCode;

  const { error } = await session.supabase.from("school_enquiries").insert({
    school_id: guard.school.schoolId,
    name,
    phone: text(form, "phone", 30) || null,
    email: text(form, "email", 120) || null,
    source: SOURCES.includes(source) ? source : "other",
    licence_code: LICENCE_CODES.includes(code) ? code : null,
    message: text(form, "message", 1000) || null,
    created_by: session.userId,
  });
  if (error) {
    console.error("[schools] add enquiry failed", error.code, error.message);
    return { ok: false, message: diaryErrorMessage(error, "Could not save that enquiry.") };
  }
  revalidatePath("/schools/enquiries");
  return { ok: true, message: `${name} is on the call-back list.` };
}

export async function updateEnquiry(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ write: true });
  if (!guard.ok) return { ok: false, message: guard.message };
  const session = await userClient();
  if (!session) return { ok: false, message: "Sign in again to continue." };

  const status = text(form, "status", 10) as EnquiryStatus;
  if (!STATUSES.includes(status)) return { ok: false, message: "Pick what happened." };
  const followUp = text(form, "next_follow_up_on", 10);
  if (followUp && !isIsoDay(followUp)) return { ok: false, message: "That date isn't a real date." };

  const { data, error } = await session.supabase
    .from("school_enquiries")
    .update({ status, next_follow_up_on: followUp || null })
    .eq("id", text(form, "id", 40))
    .eq("school_id", guard.school.schoolId)
    .select("id");
  if (error) {
    console.error("[schools] update enquiry failed", error.code, error.message);
    return { ok: false, message: diaryErrorMessage(error, "Could not update that enquiry.") };
  }
  if (!data || data.length === 0) return { ok: false, message: "That enquiry could not be found." };
  revalidatePath("/schools/enquiries");
  const said: Record<EnquiryStatus, string> = {
    new: "Back on the list.",
    contacted: followUp ? `Noted. It comes back on ${followUp}.` : "Noted as contacted.",
    booked: "Marked as booked.",
    lost: "Marked as lost.",
  };
  return { ok: true, message: said[status] };
}

/**
 * The enquiry becomes a learner. Two writes rather than one transaction: if
 * the link-back fails the learner still exists and the enquiry just shows as
 * open, which is recoverable; there is no money or permission at stake.
 */
export async function convertEnquiry(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ write: true });
  if (!guard.ok) return { ok: false, message: guard.message };
  const session = await userClient();
  if (!session) return { ok: false, message: "Sign in again to continue." };

  const id = text(form, "id", 40);
  const { data: rows } = await session.supabase
    .from("school_enquiries")
    .select("name, phone, email, licence_code, converted_learner_id")
    .eq("id", id)
    .eq("school_id", guard.school.schoolId)
    .limit(1);
  const enquiry = (rows as { name: string; phone: string | null; email: string | null; licence_code: string | null; converted_learner_id: string | null }[] | null)?.[0];
  if (!enquiry) return { ok: false, message: "That enquiry could not be found." };
  if (enquiry.converted_learner_id) return { ok: false, message: "Already a learner." };

  const [first, ...rest] = enquiry.name.trim().split(/\s+/);
  const { data: created, error } = await session.supabase
    .from("school_learners")
    .insert({
      school_id: guard.school.schoolId,
      first_name: first,
      last_name: rest.join(" "),
      phone: enquiry.phone,
      email: enquiry.email,
      licence_code: LICENCE_CODES.includes(enquiry.licence_code as LicenceCode) ? enquiry.licence_code : "8",
      status: "active",
      created_by: session.userId,
    })
    .select("id");
  if (error || !created?.[0]) {
    console.error("[schools] convert enquiry failed", error?.code, error?.message);
    return { ok: false, message: diaryErrorMessage(error, "Could not add them as a learner.") };
  }
  const learnerId = (created[0] as { id: string }).id;
  await session.supabase
    .from("school_enquiries")
    .update({ status: "booked", converted_learner_id: learnerId })
    .eq("id", id)
    .eq("school_id", guard.school.schoolId);
  revalidatePath("/schools/enquiries");
  revalidatePath("/schools/learners");
  return { ok: true, message: `${enquiry.name} is now a learner. Book their first lesson from their card.` };
}

// ── Test day ────────────────────────────────────────────────────────────────

export async function recordTestResult(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ write: true });
  if (!guard.ok) return { ok: false, message: guard.message };
  const session = await userClient();
  if (!session) return { ok: false, message: "Sign in again to continue." };

  const learnerId = text(form, "learner_id", 40);
  const testType = text(form, "test_type", 10) === "learners" ? "learners" : "drivers";
  const result = text(form, "result", 10);
  if (result !== "passed" && result !== "failed") return { ok: false, message: "Did they pass or fail?" };
  const takenOn = text(form, "taken_on", 10) || schoolDay(new Date(), guard.school.timezone);
  if (!isIsoDay(takenOn)) return { ok: false, message: "That date isn't a real date." };

  const { error } = await session.supabase.from("school_test_results").insert({
    school_id: guard.school.schoolId,
    learner_id: learnerId,
    test_type: testType,
    taken_on: takenOn,
    centre: text(form, "centre", 80) || null,
    result,
    instructor_id: text(form, "instructor_id", 40) || null,
    notes: text(form, "notes", 500) || null,
    recorded_by: session.userId,
  });
  if (error) {
    console.error("[schools] record result failed", error.code, error.message);
    return { ok: false, message: diaryErrorMessage(error, "Could not record that result.") };
  }

  // A pass moves the learner on: the learner's test to the driver's stage,
  // the driver's test to "passed". A follow-on convenience — the result above
  // is the record, and it is already saved even if this is refused.
  if (result === "passed") {
    await session.supabase
      .from("school_learners")
      .update(testType === "drivers" ? { status: "passed" } : { stage: "drivers" })
      .eq("id", learnerId)
      .eq("school_id", guard.school.schoolId);
  }
  revalidatePath(`/schools/learners/${learnerId}`);
  revalidatePath("/schools/learners");
  return {
    ok: true,
    message:
      result === "passed"
        ? testType === "drivers"
          ? "Passed — congratulations to them. Marked as passed."
          : "Passed their learner's. Now working toward the driver's."
        : "Recorded. It counts toward your pass rate — honestly.",
  };
}

export async function setDocuments(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ write: true });
  if (!guard.ok) return { ok: false, message: guard.message };
  const session = await userClient();
  if (!session) return { ok: false, message: "Sign in again to continue." };

  const learnerId = text(form, "learner_id", 40);
  const documents = form.getAll("documents").map(String).filter(isTestDocument);
  const { data, error } = await session.supabase
    .from("school_learners")
    .update({ documents: [...new Set(documents)] })
    .eq("id", learnerId)
    .eq("school_id", guard.school.schoolId)
    .select("id");
  if (error) {
    console.error("[schools] set documents failed", error.code, error.message);
    return { ok: false, message: diaryErrorMessage(error, "Could not save the checklist.") };
  }
  if (!data || data.length === 0) return { ok: false, message: "That learner could not be found." };
  revalidatePath(`/schools/learners/${learnerId}`);
  return { ok: true, message: "Checklist saved." };
}
