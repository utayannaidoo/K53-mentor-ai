import type { SchoolContext } from "@/lib/schools/auth";
import { SCHOOL_TRIAL_DAYS, SCHOOL_TRIAL_SEATS } from "@/lib/billing/school-plans";
import type { Instructor, Learner, Lesson, LessonModule, LessonNote, Vehicle } from "@/lib/schools/diary-types";
import type { PackageRow, PaymentRow } from "@/lib/schools/money";
import type { Enquiry, TestResult } from "@/lib/schools/test-day";
import { schoolDay, shiftDay, zonedInstant } from "@/lib/schools/time";

/**
 * What `/schools` renders with no Supabase configured.
 *
 * CLAUDE.md rule 1: both modes must always work. The demo cannot persist
 * anything — there is no database and no session — so it shows a furnished
 * workspace and refuses every write with a sentence rather than an error.
 * Without this the whole product area would be a crash in demo mode.
 */
export const DEMO_SCHOOL: SchoolContext = {
  schoolId: "demo-school",
  memberId: "demo-owner",
  name: "Demo Driving School",
  slug: "demo-driving-school",
  role: "owner",
  access: "full",
  plan: "trial",
  status: "trialing",
  seats: SCHOOL_TRIAL_SEATS,
  trialEndsAt: new Date(Date.now() + SCHOOL_TRIAL_DAYS * 86_400_000).toISOString(),
  partnerSchoolId: null,
  seatsUsed: 2,
  timezone: "Africa/Johannesburg",
  defaultLessonMinutes: 60,
};

export const DEMO_INSTRUCTORS: Instructor[] = [
  { id: "demo-owner", displayName: "You", role: "owner" },
  { id: "demo-sipho", displayName: "Sipho", role: "instructor" },
];

const created = "2026-09-01T08:00:00Z";

export const DEMO_LEARNERS: Learner[] = [
  learner("demo-thabo", "Thabo", "Nkosi", "0821234567", "8", "active", "demo-sipho", "2026-10-14", "Waltloo"),
  learner("demo-ayanda", "Ayanda", "Dlamini", "0839876543", "8", "active", "demo-owner", null, null),
  learner("demo-pieter", "Pieter", "van Wyk", "0725550101", "A", "active", "demo-sipho", null, null),
  learner("demo-naledi", "Naledi", "Mokoena", "0614442222", "8", "enquiry", null, null, null),
  learner("demo-kyle", "Kyle", "Naidoo", "0791112233", "8", "passed", "demo-owner", "2026-09-02", "Pinetown"),
];

export const DEMO_VEHICLES: Vehicle[] = [
  {
    id: "demo-polo",
    registration: "ND 123-456",
    make: "VW",
    model: "Polo Vivo",
    vehicle_group: "car",
    transmission: "manual",
    licence_disc_expires_on: "2027-03-31",
    status: "active",
  },
  {
    id: "demo-bike",
    registration: "ND 777-001",
    make: "Honda",
    model: "CB125F",
    vehicle_group: "motorcycle",
    transmission: "manual",
    licence_disc_expires_on: "2026-11-30",
    status: "active",
  },
];

/** A believable day's diary, relative to whatever "today" is at request time. */
export function demoLessons(): Lesson[] {
  const tz = DEMO_SCHOOL.timezone;
  const today = schoolDay(new Date(), tz);
  const tomorrow = shiftDay(today, 1);
  return [
    lesson("demo-l1", today, "08:00", 60, "demo-thabo", "demo-sipho", "demo-polo", "completed", "12 Jan Smuts Ave", "demo-pkg"),
    lesson("demo-l2", today, "10:00", 60, "demo-ayanda", "demo-owner", "demo-polo", "scheduled", "Menlyn Mall, main entrance", null, 35000),
    lesson("demo-l3", today, "11:30", 90, "demo-pieter", "demo-sipho", "demo-bike", "scheduled", "Yard", null, 45000),
    lesson("demo-l4", today, "14:00", 60, "demo-thabo", "demo-sipho", "demo-polo", "scheduled", "12 Jan Smuts Ave", "demo-pkg"),
    lesson("demo-l5", tomorrow, "09:00", 60, "demo-ayanda", "demo-owner", "demo-polo", "scheduled", "Menlyn Mall, main entrance", null, 35000),
    lesson("demo-l6", shiftDay(today, -2), "15:00", 60, "demo-ayanda", "demo-owner", "demo-polo", "completed", "Menlyn Mall, main entrance", null, 35000),
    lesson("demo-l7", shiftDay(today, -1), "15:00", 60, "demo-ayanda", "demo-owner", "demo-polo", "no_show", "Menlyn Mall, main entrance", null, 35000),
  ];
}

function learner(
  id: string,
  first: string,
  last: string,
  phone: string,
  code: Learner["licence_code"],
  status: Learner["status"],
  instructor: string | null,
  testDate: string | null,
  testCentre: string | null,
): Learner {
  return {
    id,
    first_name: first,
    last_name: last,
    phone,
    email: null,
    licence_code: code,
    stage: "drivers",
    status,
    assigned_instructor_id: instructor,
    test_date: testDate,
    test_centre: testCentre,
    notes: null,
    documents: id === "demo-thabo" ? ["id_copy", "learners_licence", "eye_test"] : [],
    created_at: created,
  };
}

function lesson(
  id: string,
  day: string,
  time: string,
  minutes: number,
  learnerId: string,
  instructorId: string,
  vehicleId: string,
  status: Lesson["status"],
  pickup: string,
  packageId: string | null = null,
  priceCents: number | null = null,
): Lesson {
  const start = zonedInstant(day, time, DEMO_SCHOOL.timezone);
  return {
    id,
    learner_id: learnerId,
    instructor_id: instructorId,
    vehicle_id: vehicleId,
    starts_at: start.toISOString(),
    ends_at: new Date(start.getTime() + minutes * 60_000).toISOString(),
    kind: "lesson",
    status,
    pickup_address: pickup,
    package_id: packageId,
    price_cents: priceCents,
  };
}

/** Thabo's completed morning lesson, recorded the way an instructor would. */
export const DEMO_NOTES: LessonNote[] = [
  {
    lesson_id: "demo-l1",
    summary: "Good control on the incline. Alley dock still needs three corrections.",
    next_focus: "Alley docking — find the reference point at the first pole",
    learner_visible: false,
    updated_at: created,
  },
];

export const DEMO_LESSON_MODULES: Record<string, LessonModule[]> = {
  "demo-l1": [
    { module_id: "alley_docking", rating: 2, faults: ["Excessive shunting (more corrections than allowed)"] },
    { module_id: "incline_start", rating: 3, faults: [] },
  ],
};

/** Thabo's grid: the latest rating per manoeuvre across all his lessons. */
export const DEMO_PROGRESS: Record<string, { module_id: string; rating: 1 | 2 | 3; faults: string[]; lesson_at: string }[]> = {
  "demo-thabo": [
    { module_id: "vehicle_inspection", rating: 3, faults: [], lesson_at: created },
    { module_id: "mirror_blindspot", rating: 3, faults: [], lesson_at: created },
    { module_id: "moving_off", rating: 3, faults: [], lesson_at: created },
    { module_id: "incline_start", rating: 3, faults: [], lesson_at: created },
    { module_id: "parallel_parking", rating: 2, faults: ["Not checking blind spots before reversing"], lesson_at: created },
    { module_id: "alley_docking", rating: 2, faults: ["Excessive shunting (more corrections than allowed)"], lesson_at: created },
    { module_id: "three_point_turn", rating: 1, faults: [], lesson_at: created },
  ],
};

/** Thabo bought a 10-lesson package and has paid part of it. */
export const DEMO_PACKAGES: PackageRow[] = [
  {
    id: "demo-pkg",
    learner_id: "demo-thabo",
    name: "10 lessons",
    lessons_included: 10,
    price_cents: 280000,
    status: "active",
    sold_on: "2026-09-01",
    expires_on: null,
  },
];

export const DEMO_PAYMENTS: PaymentRow[] = [
  payment("demo-pay1", "demo-thabo", "demo-pkg", 150000, "eft", "2026-09-01", "THABO NKOSI 10L"),
  payment("demo-pay2", "demo-ayanda", null, 35000, "cash", "2026-09-10", null),
];

function payment(
  id: string,
  learnerId: string,
  packageId: string | null,
  cents: number,
  method: PaymentRow["method"],
  on: string,
  reference: string | null,
): PaymentRow {
  return {
    id,
    learner_id: learnerId,
    package_id: packageId,
    amount_cents: cents,
    method,
    reference,
    received_on: on,
    received_by: "demo-owner",
    note: null,
    voided_at: null,
    void_reason: null,
    created_at: `${on}T09:00:00Z`,
  };
}

/** Two people who asked about lessons, one still waiting for a call back. */
export const DEMO_ENQUIRIES: Enquiry[] = [
  {
    id: "demo-enq1",
    name: "Lindiwe Zulu",
    phone: "0827771234",
    email: null,
    source: "whatsapp",
    licence_code: "8",
    message: "How much for 10 lessons? I have my learner's already.",
    status: "new",
    next_follow_up_on: null,
    converted_learner_id: null,
    created_at: "2026-09-17T16:20:00Z",
  },
  {
    id: "demo-enq2",
    name: "Johan Botha",
    phone: "0763334444",
    email: null,
    source: "phone",
    licence_code: "A",
    message: "Wants weekend motorbike lessons.",
    status: "contacted",
    next_follow_up_on: "2026-09-25",
    converted_learner_id: null,
    created_at: "2026-09-12T09:05:00Z",
  },
];

/** Kyle passed his driver's on the second attempt. */
export const DEMO_TEST_RESULTS: TestResult[] = [
  {
    id: "demo-tr1",
    learner_id: "demo-kyle",
    test_type: "drivers",
    taken_on: "2026-08-19",
    centre: "Pinetown",
    result: "failed",
    instructor_id: "demo-owner",
    notes: "Rolled back on the incline start.",
  },
  {
    id: "demo-tr2",
    learner_id: "demo-kyle",
    test_type: "drivers",
    taken_on: "2026-09-02",
    centre: "Pinetown",
    result: "passed",
    instructor_id: "demo-owner",
    notes: null,
  },
];
