import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { SchoolContext } from "@/lib/schools/auth";
import {
  DEMO_INSTRUCTORS,
  DEMO_LEARNERS,
  DEMO_NOTES,
  DEMO_PACKAGES,
  DEMO_PAYMENTS,
  DEMO_VEHICLES,
  demoLessons,
} from "@/lib/schools/demo";
import {
  KIND_LABEL,
  LESSON_STATUS_LABEL,
  LICENCE_LABEL,
  STATUS_LABEL,
  learnerName,
  vehicleLabel,
  type Learner,
  type Lesson,
  type LessonNote,
  type Vehicle,
} from "@/lib/schools/diary-types";
import { learnerBalance, type ChargeableLesson, type PackageRow, type PaymentRow } from "@/lib/schools/money";
import { clockTime, schoolDay } from "@/lib/schools/time";

/**
 * A school's records as spreadsheets (CSV), for its own files, its accountant,
 * or before it closes. The diary is a driving school's business record, so a
 * lapsed or leaving school must always be able to take it with them.
 *
 * Everything is read through the signed-in user's own client, so row-level
 * security decides what comes back, and in pages of 1 000 — the most one
 * PostgREST request returns — so a busy school's export is never silently cut
 * short.
 */

export const EXPORT_KINDS = ["learners", "lessons", "payments", "packages"] as const;
export type ExportKind = (typeof EXPORT_KINDS)[number];

export function isExportKind(value: string): value is ExportKind {
  return (EXPORT_KINDS as readonly string[]).includes(value);
}

type Cell = string | number | null | undefined;

/**
 * One CSV cell. Numbers stay numbers. Text a spreadsheet would run as a
 * formula (a leading = + - @, tab or carriage return) is defused with an
 * apostrophe: a learner's name typed as =HYPERLINK(...) must not become a
 * live link in the accountant's copy of Excel.
 */
export function csvCell(value: Cell): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** A whole file. The byte-order mark is what makes Excel read the names as UTF-8. */
export function toCsv(header: string[], rows: Cell[][]): string {
  return `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}

const rand = (cents: number | null | undefined) => (typeof cents === "number" ? cents / 100 : null);

// ── Reading ─────────────────────────────────────────────────────────────────

const PAGE = 1000;

type Page = (from: number, to: number) => PromiseLike<{ data: unknown; error: { message: string } | null }>;

async function allRows<T>(page: Page): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1);
    if (error) throw new Error(`export read failed: ${error.message}`);
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < PAGE) return out;
  }
}

interface Records {
  learners: Learner[];
  lessons: Lesson[];
  notes: LessonNote[];
  vehicles: Vehicle[];
  members: { id: string; user_id: string | null; display_name: string }[];
  packages: PackageRow[];
  payments: PaymentRow[];
}

async function records(school: SchoolContext, kind: ExportKind): Promise<Records> {
  if (!isSupabaseConfigured) {
    return {
      learners: DEMO_LEARNERS,
      lessons: demoLessons(),
      notes: DEMO_NOTES,
      vehicles: DEMO_VEHICLES,
      members: DEMO_INSTRUCTORS.map((i) => ({ id: i.id, user_id: i.id, display_name: i.displayName })),
      packages: DEMO_PACKAGES,
      payments: DEMO_PAYMENTS,
    };
  }
  const db = await createClient();
  if (!db) throw new Error("export: no database client");
  const id = school.schoolId;
  const need = {
    lessons: kind === "lessons" || kind === "learners",
    notes: kind === "lessons",
    vehicles: kind === "lessons",
    money: kind !== "lessons",
  };
  const none = async () => [];
  const [learners, lessons, notes, vehicles, members, packages, payments] = await Promise.all([
    allRows<Learner>((f, t) => db.from("school_learners").select("*").eq("school_id", id).order("created_at").order("id").range(f, t)),
    need.lessons
      ? allRows<Lesson>((f, t) =>
          db.from("school_lessons").select("*").eq("school_id", id).order("starts_at").order("id").range(f, t),
        )
      : none(),
    need.notes
      ? allRows<LessonNote>((f, t) =>
          db.from("school_lesson_notes").select("*").eq("school_id", id).order("lesson_id").range(f, t),
        )
      : none(),
    need.vehicles ? allRows<Vehicle>((f, t) => db.from("school_vehicles").select("*").eq("school_id", id).order("id").range(f, t)) : none(),
    allRows<Records["members"][number]>((f, t) =>
      db.from("school_members").select("id, user_id, display_name").eq("school_id", id).order("id").range(f, t),
    ),
    need.money
      ? allRows<PackageRow>((f, t) => db.from("school_packages").select("*").eq("school_id", id).order("sold_on").order("id").range(f, t))
      : none(),
    need.money
      ? allRows<PaymentRow>((f, t) =>
          db.from("school_payments").select("*").eq("school_id", id).order("received_on").order("id").range(f, t),
        )
      : none(),
  ]);
  return {
    learners,
    lessons: lessons as Lesson[],
    notes: notes as LessonNote[],
    vehicles: vehicles as Vehicle[],
    members,
    packages: packages as PackageRow[],
    payments: payments as PaymentRow[],
  };
}

// ── Writing ─────────────────────────────────────────────────────────────────

/** The file for one kind of record, ready to download. */
export async function exportCsv(school: SchoolContext, kind: ExportKind): Promise<string> {
  const r = await records(school, kind);
  const tz = school.timezone;
  const learnerById = new Map(r.learners.map((l) => [l.id, l]));
  const nameOf = (learnerId: string | null) => {
    const learner = learnerId ? learnerById.get(learnerId) : undefined;
    return learner ? learnerName(learner) : null;
  };
  const memberName = new Map(r.members.map((m) => [m.id, m.display_name?.trim() || null]));
  const memberByUser = new Map(r.members.filter((m) => m.user_id).map((m) => [m.user_id!, m.display_name?.trim() || null]));

  switch (kind) {
    case "learners": {
      const charges: ChargeableLesson[] = r.lessons
        .filter((l) => l.package_id !== null || l.price_cents !== null)
        .map(({ id, learner_id, package_id, price_cents, status }) => ({ id, learner_id, package_id, price_cents, status }));
      return toCsv(
        ["first_name", "last_name", "phone", "email", "id_last4", "licence", "stage", "status", "instructor",
          "test_date", "test_centre", "documents", "notes", "owes_zar", "added"],
        r.learners.map((l) => [
          l.first_name,
          l.last_name,
          l.phone,
          l.email,
          (l as Learner & { id_number_last4?: string | null }).id_number_last4 ?? null,
          LICENCE_LABEL[l.licence_code] ?? l.licence_code,
          l.stage,
          STATUS_LABEL[l.status] ?? l.status,
          l.assigned_instructor_id ? memberName.get(l.assigned_instructor_id) : null,
          l.test_date,
          l.test_centre,
          (l.documents ?? []).join("; "),
          l.notes,
          rand(learnerBalance(l.id, r.packages, r.payments, charges).balanceCents),
          schoolDay(new Date(l.created_at), tz),
        ]),
      );
    }
    case "lessons": {
      const noteByLesson = new Map(r.notes.map((n) => [n.lesson_id, n]));
      const vehicleById = new Map(r.vehicles.map((v) => [v.id, v]));
      return toCsv(
        ["date", "start", "end", "learner", "instructor", "vehicle", "kind", "status", "pickup", "price_zar",
          "on_package", "summary", "next_focus", "shared_with_learner"],
        r.lessons.map((l) => {
          const note = noteByLesson.get(l.id);
          const vehicle = l.vehicle_id ? vehicleById.get(l.vehicle_id) : undefined;
          return [
            schoolDay(new Date(l.starts_at), tz),
            clockTime(l.starts_at, tz),
            clockTime(l.ends_at, tz),
            nameOf(l.learner_id),
            memberName.get(l.instructor_id),
            vehicle ? vehicleLabel(vehicle) : null,
            KIND_LABEL[l.kind] ?? l.kind,
            LESSON_STATUS_LABEL[l.status] ?? l.status,
            l.pickup_address,
            rand(l.price_cents),
            l.package_id ? "yes" : null,
            note?.summary || null,
            note?.next_focus ?? null,
            note ? (note.learner_visible ? "yes" : "no") : null,
          ];
        }),
      );
    }
    case "payments":
      return toCsv(
        ["received_on", "learner", "amount_zar", "method", "reference", "note", "taken_by", "voided", "void_reason"],
        r.payments.map((p) => [
          p.received_on,
          nameOf(p.learner_id),
          rand(p.amount_cents),
          p.method,
          p.reference,
          p.note,
          p.received_by ? memberByUser.get(p.received_by) : null,
          p.voided_at ? "yes" : "no",
          p.void_reason,
        ]),
      );
    case "packages":
      return toCsv(
        ["sold_on", "learner", "package", "lessons_included", "price_zar", "status", "expires_on"],
        r.packages.map((p) => [
          p.sold_on,
          nameOf(p.learner_id),
          p.name,
          p.lessons_included,
          rand(p.price_cents),
          p.status,
          p.expires_on,
        ]),
      );
  }
}
