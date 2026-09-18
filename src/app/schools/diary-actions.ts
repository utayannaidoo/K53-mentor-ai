"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { requireSchool } from "@/lib/schools/auth";
import { isModuleFor } from "@/lib/schools/modules";
import { rpcMessage } from "@/lib/schools/rpc-message";
import { classifyDiaryError, diaryErrorMessage } from "@/lib/schools/diary-errors";
import { clockTime, isClockTime, isIsoDay, zonedInstant } from "@/lib/schools/time";
import type {
  LearnerStatus,
  LessonKind,
  LessonStatus,
  LicenceCode,
  VehicleGroup,
} from "@/lib/schools/diary-types";
import type { ActionResult } from "@/lib/forms/action-result";

/**
 * Every diary write.
 *
 * These go through the signed-in user's own Supabase client — not the service
 * role — so row-level security and the 0036 constraints are what actually
 * enforce the rules. The checks here exist to answer with a useful sentence
 * before the database has to refuse; they are not the boundary.
 */

const DEMO_REFUSAL: ActionResult = { ok: false, message: "Not available in the demo." };

const LICENCE_CODES: LicenceCode[] = ["8", "10", "14", "A1", "A"];
const LEARNER_STATUSES: LearnerStatus[] = ["enquiry", "active", "paused", "passed", "left"];
const LESSON_KINDS: LessonKind[] = ["lesson", "test", "assessment", "block"];
const LESSON_STATUSES: LessonStatus[] = [
  "scheduled",
  "completed",
  "no_show",
  "cancelled_learner",
  "cancelled_school",
];
const VEHICLE_GROUPS: VehicleGroup[] = ["car", "motorcycle", "heavy"];

function text(form: FormData, name: string, max = 200): string {
  return String(form.get(name) ?? "").trim().slice(0, max);
}

function optional(form: FormData, name: string, max = 200): string | null {
  return text(form, name, max) || null;
}

function refresh(...paths: string[]) {
  for (const path of ["/schools", "/schools/learners", ...paths]) revalidatePath(path);
}

async function userClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  return supabase && user ? { supabase, userId: user.id } : null;
}

// ── Learners ─────────────────────────────────────────────────────────────────

export async function addLearner(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ write: true });
  if (!guard.ok) return { ok: false, message: guard.message };
  const session = await userClient();
  if (!session) return { ok: false, message: "Sign in again to continue." };

  const firstName = text(form, "first_name", 60);
  if (!firstName) return { ok: false, message: "Enter the learner's first name." };
  const code = text(form, "licence_code", 4) as LicenceCode;
  const instructor = optional(form, "assigned_instructor_id", 40);

  const { error } = await session.supabase.from("school_learners").insert({
    school_id: guard.school.schoolId,
    first_name: firstName,
    last_name: text(form, "last_name", 60),
    phone: optional(form, "phone", 30),
    email: optional(form, "email", 120),
    licence_code: LICENCE_CODES.includes(code) ? code : "8",
    assigned_instructor_id: instructor,
    status: "active",
    created_by: session.userId,
  });
  if (error) {
    console.error("[schools] add learner failed", error.code, error.message);
    return { ok: false, message: diaryErrorMessage(error, "Could not add that learner.") };
  }
  refresh();
  return { ok: true, message: `${firstName} is on your list.` };
}

export async function updateLearner(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ write: true });
  if (!guard.ok) return { ok: false, message: guard.message };
  const session = await userClient();
  if (!session) return { ok: false, message: "Sign in again to continue." };

  const id = text(form, "id", 40);
  const status = text(form, "status", 12) as LearnerStatus;
  const testDate = text(form, "test_date", 10);
  if (!LEARNER_STATUSES.includes(status)) return { ok: false, message: "Pick a status." };
  if (testDate && !isIsoDay(testDate)) return { ok: false, message: "That test date isn't a real date." };

  const { data, error } = await session.supabase
    .from("school_learners")
    .update({
      status,
      phone: optional(form, "phone", 30),
      assigned_instructor_id: optional(form, "assigned_instructor_id", 40),
      test_date: testDate || null,
      test_centre: optional(form, "test_centre", 80),
      notes: optional(form, "notes", 2000),
    })
    .eq("id", id)
    .eq("school_id", guard.school.schoolId)
    .select("id");
  if (error) {
    console.error("[schools] update learner failed", error.code, error.message);
    return { ok: false, message: diaryErrorMessage(error, "Could not save that.") };
  }
  if (!data || data.length === 0) return { ok: false, message: "That learner could not be found." };
  refresh(`/schools/learners/${id}`);
  return { ok: true, message: "Saved." };
}

// ── Vehicles ─────────────────────────────────────────────────────────────────

export async function addVehicle(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ write: true, roles: ["owner", "assistant"] });
  if (!guard.ok) return { ok: false, message: guard.message };
  const session = await userClient();
  if (!session) return { ok: false, message: "Sign in again to continue." };

  const registration = text(form, "registration", 20).toUpperCase();
  if (!registration) return { ok: false, message: "Enter the registration number." };
  const group = text(form, "vehicle_group", 12) as VehicleGroup;
  const disc = text(form, "licence_disc_expires_on", 10);
  if (disc && !isIsoDay(disc)) return { ok: false, message: "That disc expiry isn't a real date." };

  const { error } = await session.supabase.from("school_vehicles").insert({
    school_id: guard.school.schoolId,
    registration,
    make: optional(form, "make", 40),
    model: optional(form, "model", 40),
    vehicle_group: VEHICLE_GROUPS.includes(group) ? group : "car",
    transmission: text(form, "transmission", 10) === "automatic" ? "automatic" : "manual",
    licence_disc_expires_on: disc || null,
  });
  if (error) {
    console.error("[schools] add vehicle failed", error.code, error.message);
    if (classifyDiaryError(error) === "duplicate") {
      return { ok: false, message: `${registration} is already in your fleet.` };
    }
    return { ok: false, message: diaryErrorMessage(error, "Could not add that vehicle.") };
  }
  revalidatePath("/schools/vehicles");
  return { ok: true, message: `${registration} added.` };
}

// ── Lessons ──────────────────────────────────────────────────────────────────

export async function bookLesson(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ write: true });
  if (!guard.ok) return { ok: false, message: guard.message };
  const session = await userClient();
  if (!session) return { ok: false, message: "Sign in again to continue." };
  const { school } = guard;

  const kind = text(form, "kind", 12) as LessonKind;
  if (!LESSON_KINDS.includes(kind)) return { ok: false, message: "Pick what kind of booking this is." };
  const learnerId = optional(form, "learner_id", 40);
  if (kind !== "block" && !learnerId) return { ok: false, message: "Pick the learner." };

  const day = text(form, "day", 10);
  const time = text(form, "time", 5);
  const minutes = Number(text(form, "minutes", 3));
  if (!isIsoDay(day)) return { ok: false, message: "Pick a date." };
  if (!isClockTime(time)) return { ok: false, message: "Pick a start time." };
  if (!Number.isInteger(minutes) || minutes < 15 || minutes > 480) {
    return { ok: false, message: "A booking has to be between 15 minutes and 8 hours." };
  }

  // An instructor books for themselves; the database refuses anything else
  // anyway (school_lessons_insert), this just says so first.
  const instructorId =
    school.role === "instructor" ? school.memberId : text(form, "instructor_id", 40);
  if (!instructorId) return { ok: false, message: "Pick the instructor." };

  const start = zonedInstant(day, time, school.timezone);
  const end = new Date(start.getTime() + minutes * 60_000);

  const { error } = await session.supabase.from("school_lessons").insert({
    school_id: school.schoolId,
    learner_id: kind === "block" ? null : learnerId,
    instructor_id: instructorId,
    vehicle_id: optional(form, "vehicle_id", 40),
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
    kind,
    pickup_address: optional(form, "pickup_address", 200),
    created_by: session.userId,
  });

  if (error) {
    const kindOfError = classifyDiaryError(error);
    if (kindOfError === "instructor_clash") {
      // Name the clash: "already booked at 14:00" is something a person can
      // fix; "an exclusion constraint was violated" is not.
      const { data: clash } = await session.supabase
        .from("school_lessons")
        .select("starts_at")
        .eq("instructor_id", instructorId)
        .in("status", ["scheduled", "completed"])
        .lt("starts_at", end.toISOString())
        .gt("ends_at", start.toISOString())
        .order("starts_at", { ascending: true })
        .limit(1);
      const at = (clash as { starts_at: string }[] | null)?.[0]?.starts_at;
      if (at) {
        return {
          ok: false,
          message: `That instructor is already booked at ${clockTime(at, school.timezone)}. Pick another time or cancel that lesson first.`,
        };
      }
    }
    if (kindOfError === "unknown") console.error("[schools] book lesson failed", error.code, error.message);
    return { ok: false, message: diaryErrorMessage(error, "Could not book that lesson.") };
  }
  refresh();
  return {
    ok: true,
    message: `Booked for ${clockTime(start.toISOString(), school.timezone)}.`,
  };
}

export async function setLessonStatus(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ write: true });
  if (!guard.ok) return { ok: false, message: guard.message };
  const session = await userClient();
  if (!session) return { ok: false, message: "Sign in again to continue." };

  const id = text(form, "id", 40);
  const status = text(form, "status", 20) as LessonStatus;
  if (!LESSON_STATUSES.includes(status)) return { ok: false, message: "Pick what happened." };

  const { data, error } = await session.supabase
    .from("school_lessons")
    .update({ status })
    .eq("id", id)
    .eq("school_id", guard.school.schoolId)
    .select("id, learner_id");
  if (error) {
    console.error("[schools] lesson status failed", error.code, error.message);
    return { ok: false, message: diaryErrorMessage(error, "Could not update that lesson.") };
  }
  // Zero rows is RLS filtering the row out: an instructor marking someone
  // else's lesson, or a read-only workspace.
  if (!data || data.length === 0) {
    return { ok: false, message: "You can only update your own lessons." };
  }
  const learnerId = (data[0] as { learner_id: string | null }).learner_id;
  refresh(...(learnerId ? [`/schools/learners/${learnerId}`] : []));
  const said: Record<LessonStatus, string> = {
    scheduled: "Back on the diary.",
    completed: "Marked as done.",
    no_show: "Marked as a no-show.",
    cancelled_learner: "Cancelled by the learner. The slot is free again.",
    cancelled_school: "Cancelled. The slot is free again.",
  };
  return { ok: true, message: said[status] };
}

// ── The lesson record ────────────────────────────────────────────────────────

/**
 * Save what happened in a lesson: the summary, the next focus, and each K53
 * manoeuvre covered with its rating and faults.
 *
 * The form names each manoeuvre's inputs `rating:<module_id>` (1–3, or empty
 * for "not covered") and `fault:<module_id>` (repeated). Module ids are
 * checked against the learner's own licence here, because the database only
 * checks their shape; the permission rules live in record_lesson_assessment
 * (0037), which this calls through the signed-in user's own client.
 */
export async function recordLesson(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ write: true });
  if (!guard.ok) return { ok: false, message: guard.message };
  const session = await userClient();
  if (!session) return { ok: false, message: "Sign in again to continue." };

  const lessonId = text(form, "lesson_id", 40);
  const licence = text(form, "licence_code", 4) as LicenceCode;
  if (!LICENCE_CODES.includes(licence)) return { ok: false, message: "That learner's licence code is unknown." };

  const modules: { module_id: string; rating: number; faults: string[] }[] = [];
  for (const [key, value] of form.entries()) {
    if (!key.startsWith("rating:")) continue;
    const moduleId = key.slice("rating:".length);
    const rating = Number(value);
    if (!rating) continue; // "not covered"
    if (![1, 2, 3].includes(rating) || !isModuleFor(licence, moduleId)) {
      return { ok: false, message: "One of the manoeuvres isn't part of this learner's licence." };
    }
    const faults = form
      .getAll(`fault:${moduleId}`)
      .map((f) => String(f).trim().slice(0, 200))
      .filter(Boolean)
      .slice(0, 20);
    modules.push({ module_id: moduleId, rating, faults });
  }

  const { error } = await session.supabase.rpc("record_lesson_assessment", {
    p_lesson: lessonId,
    p_summary: text(form, "summary", 4000),
    p_next_focus: text(form, "next_focus", 500),
    p_learner_visible: form.get("learner_visible") === "on",
    p_modules: modules,
    p_mark_completed: true,
  });
  if (error) {
    if (error.code !== "P0001") console.error("[schools] record lesson failed", error.code, error.message);
    return { ok: false, message: rpcMessage(error, "Could not save the lesson record.") };
  }
  refresh(`/schools/lessons/${lessonId}`);
  const ready = modules.filter((m) => m.rating === 3).length;
  return {
    ok: true,
    message:
      modules.length === 0
        ? "Saved."
        : `Saved — ${modules.length} ${modules.length === 1 ? "manoeuvre" : "manoeuvres"} recorded${ready ? `, ${ready} test-ready` : ""}.`,
  };
}
