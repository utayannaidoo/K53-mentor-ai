/**
 * Row shapes for the diary, hand-written at the boundary as everywhere else in
 * this codebase (there are no generated Database types — see
 * src/lib/partners/admin-data.ts for the precedent). They mirror 0036.
 */

export type LicenceCode = "8" | "10" | "14" | "A1" | "A";
export type LearnerStatus = "enquiry" | "active" | "paused" | "passed" | "left";
export type LessonKind = "lesson" | "test" | "assessment" | "block";
export type LessonStatus =
  | "scheduled"
  | "completed"
  | "no_show"
  | "cancelled_learner"
  | "cancelled_school";
export type VehicleGroup = "car" | "motorcycle" | "heavy";

export interface Learner {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  licence_code: LicenceCode;
  stage: "learners" | "drivers";
  status: LearnerStatus;
  assigned_instructor_id: string | null;
  test_date: string | null;
  test_centre: string | null;
  notes: string | null;
  /** Test-day documents already gathered (0039; see test-day.ts). */
  documents: string[];
  created_at: string;
}

export interface Vehicle {
  id: string;
  registration: string;
  make: string | null;
  model: string | null;
  vehicle_group: VehicleGroup;
  transmission: "manual" | "automatic";
  licence_disc_expires_on: string | null;
  status: "active" | "in_service" | "retired";
}

export interface Lesson {
  id: string;
  learner_id: string | null;
  instructor_id: string;
  vehicle_id: string | null;
  starts_at: string;
  ends_at: string;
  kind: LessonKind;
  status: LessonStatus;
  pickup_address: string | null;
  /** Paid from this package, or… */
  package_id: string | null;
  /** …charged at this price. Never both (0038). */
  price_cents: number | null;
}

export interface Instructor {
  id: string;
  displayName: string;
  role: "owner" | "instructor" | "assistant";
}

export interface LessonNote {
  lesson_id: string;
  summary: string;
  next_focus: string | null;
  learner_visible: boolean;
  updated_at: string;
}

export interface LessonModule {
  module_id: string;
  rating: 1 | 2 | 3;
  faults: string[];
}

/** A lesson with the names a human needs to read it, already resolved. */
export interface DiaryEntry extends Lesson {
  learnerName: string | null;
  learnerPhone: string | null;
  instructorName: string;
  vehicleLabel: string | null;
}

export const LICENCE_LABEL: Record<LicenceCode, string> = {
  "8": "Code 8",
  "10": "Code 10",
  "14": "Code 14",
  A1: "Code A1",
  A: "Code A",
};

export const STATUS_LABEL: Record<LearnerStatus, string> = {
  enquiry: "Enquiry",
  active: "Active",
  paused: "Paused",
  passed: "Passed",
  left: "Left",
};

export const LESSON_STATUS_LABEL: Record<LessonStatus, string> = {
  scheduled: "Booked",
  completed: "Done",
  no_show: "No-show",
  cancelled_learner: "Cancelled",
  cancelled_school: "Cancelled",
};

export const KIND_LABEL: Record<LessonKind, string> = {
  lesson: "Lesson",
  test: "Test",
  assessment: "Assessment",
  block: "Blocked",
};

export function learnerName(learner: Pick<Learner, "first_name" | "last_name">): string {
  return [learner.first_name, learner.last_name].filter(Boolean).join(" ").trim();
}

export function vehicleLabel(vehicle: Pick<Vehicle, "registration" | "make" | "model">): string {
  const model = [vehicle.make, vehicle.model].filter(Boolean).join(" ");
  return model ? `${vehicle.registration} · ${model}` : vehicle.registration;
}

/**
 * A WhatsApp hand-off with the message already typed, since there is no
 * messaging integration. SA numbers are normalised to international form
 * (082… → 2782…), which is what wa.me requires.
 */
export function whatsappLink(phone: string | null, text: string): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) digits = `27${digits.slice(1)}`;
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/**
 * The lesson a learner has coming up next, if any — what an instructor most
 * often needs to know before they drive off. A lesson already under way still
 * counts until it ends.
 */
export function nextLesson(lessons: DiaryEntry[], now: Date = new Date()): DiaryEntry | null {
  return (
    lessons
      .filter((l) => l.status === "scheduled" && Date.parse(l.ends_at) > now.getTime())
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0] ?? null
  );
}
