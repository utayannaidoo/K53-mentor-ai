import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { SchoolContext } from "@/lib/schools/auth";
import {
  DEMO_INSTRUCTORS,
  DEMO_LEARNERS,
  DEMO_LESSON_MODULES,
  DEMO_NOTES,
  DEMO_PROGRESS,
  DEMO_VEHICLES,
  demoLessons,
} from "@/lib/schools/demo";
import { dayBounds } from "@/lib/schools/time";
import type { ProgressRow } from "@/lib/schools/modules";
import type { LessonFact } from "@/lib/schools/reports";
import {
  learnerName,
  vehicleLabel,
  type DiaryEntry,
  type Instructor,
  type Learner,
  type LearnerStatus,
  type Lesson,
  type LessonModule,
  type LessonNote,
  type Vehicle,
} from "@/lib/schools/diary-types";

/**
 * Everything the diary screens read.
 *
 * Every query goes through the signed-in user's own client, never the service
 * role, so row-level security (0035/0036) is what decides what comes back. The
 * `school_id` filters below are for the index, not for safety — a query that
 * forgot one would still return only this school's rows.
 *
 * Demo mode answers from fixtures, so the screens render without a database.
 */

const LEARNER_COLUMNS =
  "id, first_name, last_name, phone, email, licence_code, stage, status, assigned_instructor_id, test_date, test_centre, notes, documents, created_at";
const LESSON_COLUMNS =
  "id, learner_id, instructor_id, vehicle_id, starts_at, ends_at, kind, status, pickup_address, package_id, price_cents";
const VEHICLE_COLUMNS =
  "id, registration, make, model, vehicle_group, transmission, licence_disc_expires_on, status";

async function client() {
  return isSupabaseConfigured ? await createClient() : null;
}

export async function schoolInstructors(school: SchoolContext): Promise<Instructor[]> {
  const supabase = await client();
  if (!supabase) return DEMO_INSTRUCTORS;
  const { data } = await supabase
    .from("school_members")
    .select("id, display_name, role")
    .eq("school_id", school.schoolId)
    .eq("status", "active")
    .order("created_at", { ascending: true });
  return ((data ?? []) as { id: string; display_name: string; role: Instructor["role"] }[])
    // Office staff do not teach, so they never appear in a lesson's instructor list.
    .filter((m) => m.role !== "assistant")
    .map((m) => ({ id: m.id, displayName: m.display_name?.trim() || "Unnamed", role: m.role }));
}

export async function schoolVehicles(school: SchoolContext): Promise<Vehicle[]> {
  const supabase = await client();
  if (!supabase) return DEMO_VEHICLES;
  const { data } = await supabase
    .from("school_vehicles")
    .select(VEHICLE_COLUMNS)
    .eq("school_id", school.schoolId)
    .order("registration", { ascending: true });
  return (data ?? []) as Vehicle[];
}

export async function schoolLearners(
  school: SchoolContext,
  statuses?: LearnerStatus[],
): Promise<Learner[]> {
  const supabase = await client();
  if (!supabase) {
    return statuses ? DEMO_LEARNERS.filter((l) => statuses.includes(l.status)) : DEMO_LEARNERS;
  }
  let query = supabase
    .from("school_learners")
    .select(LEARNER_COLUMNS)
    .eq("school_id", school.schoolId)
    .order("first_name", { ascending: true });
  if (statuses) query = query.in("status", statuses);
  const { data } = await query;
  return (data ?? []) as Learner[];
}

/** Resolves ids to names, so a screen never shows a UUID. */
function toEntries(
  lessons: Lesson[],
  learners: Learner[],
  instructors: Instructor[],
  vehicles: Vehicle[],
): DiaryEntry[] {
  const learnerById = new Map(learners.map((l) => [l.id, l]));
  const instructorById = new Map(instructors.map((i) => [i.id, i]));
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
  return lessons.map((lesson) => {
    const learner = lesson.learner_id ? learnerById.get(lesson.learner_id) : undefined;
    const vehicle = lesson.vehicle_id ? vehicleById.get(lesson.vehicle_id) : undefined;
    return {
      ...lesson,
      learnerName: learner ? learnerName(learner) : null,
      learnerPhone: learner?.phone ?? null,
      instructorName: instructorById.get(lesson.instructor_id)?.displayName ?? "Unassigned",
      vehicleLabel: vehicle ? vehicleLabel(vehicle) : null,
    };
  });
}

async function learnersById(school: SchoolContext, ids: string[]): Promise<Learner[]> {
  if (ids.length === 0) return [];
  const supabase = await client();
  if (!supabase) return DEMO_LEARNERS.filter((l) => ids.includes(l.id));
  const { data } = await supabase
    .from("school_learners")
    .select(LEARNER_COLUMNS)
    .eq("school_id", school.schoolId)
    .in("id", ids);
  return (data ?? []) as Learner[];
}

/**
 * One day of the diary, in time order. `instructorId` narrows it to one
 * person's day — what an instructor sees by default.
 */
export async function diaryForDay(
  school: SchoolContext,
  day: string,
  instructorId?: string,
): Promise<DiaryEntry[]> {
  const { start, end } = dayBounds(day, school.timezone);
  const supabase = await client();

  let lessons: Lesson[];
  if (!supabase) {
    lessons = demoLessons().filter(
      (l) => Date.parse(l.starts_at) >= start.getTime() && Date.parse(l.starts_at) < end.getTime(),
    );
  } else {
    const { data } = await supabase
      .from("school_lessons")
      .select(LESSON_COLUMNS)
      .eq("school_id", school.schoolId)
      .gte("starts_at", start.toISOString())
      .lt("starts_at", end.toISOString())
      .order("starts_at", { ascending: true });
    lessons = (data ?? []) as Lesson[];
  }
  if (instructorId) lessons = lessons.filter((l) => l.instructor_id === instructorId);
  lessons.sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  const learnerIds = [...new Set(lessons.map((l) => l.learner_id).filter((id): id is string => !!id))];
  const [learners, instructors, vehicles] = await Promise.all([
    learnersById(school, learnerIds),
    schoolInstructors(school),
    schoolVehicles(school),
  ]);
  return toEntries(lessons, learners, instructors, vehicles);
}

/** A learner and every lesson they have had or have coming, newest first. */
export async function learnerWithLessons(
  school: SchoolContext,
  learnerId: string,
): Promise<{ learner: Learner; lessons: DiaryEntry[] } | null> {
  const supabase = await client();
  let learner: Learner | undefined;
  let lessons: Lesson[];

  if (!supabase) {
    learner = DEMO_LEARNERS.find((l) => l.id === learnerId);
    lessons = demoLessons().filter((l) => l.learner_id === learnerId);
  } else {
    const [learnerResult, lessonResult] = await Promise.all([
      supabase
        .from("school_learners")
        .select(LEARNER_COLUMNS)
        .eq("school_id", school.schoolId)
        .eq("id", learnerId)
        .maybeSingle(),
      supabase
        .from("school_lessons")
        .select(LESSON_COLUMNS)
        .eq("school_id", school.schoolId)
        .eq("learner_id", learnerId)
        .order("starts_at", { ascending: false })
        .limit(100),
    ]);
    learner = (learnerResult.data as Learner | null) ?? undefined;
    lessons = (lessonResult.data ?? []) as Lesson[];
  }
  if (!learner) return null;

  const [instructors, vehicles] = await Promise.all([
    schoolInstructors(school),
    schoolVehicles(school),
  ]);
  lessons.sort((a, b) => b.starts_at.localeCompare(a.starts_at));
  return { learner, lessons: toEntries(lessons, [learner], instructors, vehicles) };
}

/** One lesson with everything its record sheet needs. */
export async function lessonRecord(
  school: SchoolContext,
  lessonId: string,
): Promise<{
  entry: DiaryEntry;
  learner: Learner;
  note: LessonNote | null;
  modules: LessonModule[];
} | null> {
  const supabase = await client();
  let lesson: Lesson | undefined;
  let note: LessonNote | null = null;
  let modules: LessonModule[] = [];

  if (!supabase) {
    lesson = demoLessons().find((l) => l.id === lessonId);
    note = DEMO_NOTES.find((n) => n.lesson_id === lessonId) ?? null;
    modules = DEMO_LESSON_MODULES[lessonId] ?? [];
  } else {
    const [lessonResult, noteResult, moduleResult] = await Promise.all([
      supabase
        .from("school_lessons")
        .select(LESSON_COLUMNS)
        .eq("school_id", school.schoolId)
        .eq("id", lessonId)
        .maybeSingle(),
      supabase
        .from("school_lesson_notes")
        .select("lesson_id, summary, next_focus, learner_visible, updated_at")
        .eq("lesson_id", lessonId)
        .maybeSingle(),
      supabase
        .from("school_lesson_modules")
        .select("module_id, rating, faults")
        .eq("lesson_id", lessonId),
    ]);
    lesson = (lessonResult.data as Lesson | null) ?? undefined;
    note = (noteResult.data as LessonNote | null) ?? null;
    modules = (moduleResult.data ?? []) as LessonModule[];
  }
  if (!lesson || !lesson.learner_id) return null;

  const [learners, instructors, vehicles] = await Promise.all([
    learnersById(school, [lesson.learner_id]),
    schoolInstructors(school),
    schoolVehicles(school),
  ]);
  const learner = learners[0];
  if (!learner) return null;
  const [entry] = toEntries([lesson], learners, instructors, vehicles);
  return { entry, learner, note, modules };
}

/** A learner's K53 grid: the latest rating per manoeuvre (view in 0037). */
export async function learnerProgress(school: SchoolContext, learnerId: string): Promise<ProgressRow[]> {
  const supabase = await client();
  if (!supabase) return DEMO_PROGRESS[learnerId] ?? [];
  const { data } = await supabase
    .from("school_learner_progress")
    .select("module_id, rating, faults, lesson_at")
    .eq("school_id", school.schoolId)
    .eq("learner_id", learnerId);
  return (data ?? []) as ProgressRow[];
}

/**
 * The most recent "next lesson starts with…" line for a learner — what the
 * instructor about to teach them needs, whoever wrote it.
 */
export async function latestFocus(
  school: SchoolContext,
  learnerId: string,
): Promise<{ nextFocus: string; lessonAt: string } | null> {
  const supabase = await client();
  if (!supabase) {
    const byLesson = new Map(demoLessons().map((l) => [l.id, l]));
    const note = DEMO_NOTES.filter((n) => n.next_focus && byLesson.get(n.lesson_id)?.learner_id === learnerId)
      .sort((a, b) => byLesson.get(b.lesson_id)!.starts_at.localeCompare(byLesson.get(a.lesson_id)!.starts_at))[0];
    return note?.next_focus
      ? { nextFocus: note.next_focus, lessonAt: byLesson.get(note.lesson_id)!.starts_at }
      : null;
  }
  const { data: lessons } = await supabase
    .from("school_lessons")
    .select("id, starts_at")
    .eq("school_id", school.schoolId)
    .eq("learner_id", learnerId)
    .order("starts_at", { ascending: false })
    .limit(50);
  const recent = (lessons ?? []) as { id: string; starts_at: string }[];
  if (recent.length === 0) return null;
  const { data: notes } = await supabase
    .from("school_lesson_notes")
    .select("lesson_id, next_focus")
    .in("lesson_id", recent.map((l) => l.id))
    .not("next_focus", "is", null);
  const withFocus = new Map(
    ((notes ?? []) as { lesson_id: string; next_focus: string | null }[]).map((n) => [n.lesson_id, n.next_focus]),
  );
  const latest = recent.find((l) => withFocus.get(l.id));
  return latest ? { nextFocus: withFocus.get(latest.id)!, lessonAt: latest.starts_at } : null;
}

/** The bare facts of every booking starting in [fromIso, toIso) — for reports. */
export async function lessonFactsBetween(
  school: SchoolContext,
  fromIso: string,
  toIso: string,
): Promise<LessonFact[]> {
  const supabase = await client();
  if (!supabase) {
    return demoLessons()
      .filter((l) => l.starts_at >= fromIso && l.starts_at < toIso)
      .map(({ instructor_id, learner_id, status, kind, starts_at }) => ({ instructor_id, learner_id, status, kind, starts_at }));
  }
  const { data } = await supabase
    .from("school_lessons")
    .select("instructor_id, learner_id, status, kind, starts_at")
    .eq("school_id", school.schoolId)
    .gte("starts_at", fromIso)
    .lt("starts_at", toIso);
  return (data ?? []) as LessonFact[];
}

/** Every learner's latest rating per manoeuvre — for the test-ready count. */
export async function schoolProgress(
  school: SchoolContext,
): Promise<(ProgressRow & { learner_id: string })[]> {
  const supabase = await client();
  if (!supabase) {
    return Object.entries(DEMO_PROGRESS).flatMap(([learner_id, rows]) =>
      rows.map((row) => ({ ...row, learner_id })),
    );
  }
  const { data } = await supabase
    .from("school_learner_progress")
    .select("learner_id, module_id, rating, faults, lesson_at")
    .eq("school_id", school.schoolId);
  return (data ?? []) as (ProgressRow & { learner_id: string })[];
}
