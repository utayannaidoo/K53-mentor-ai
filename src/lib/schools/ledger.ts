import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { SchoolContext } from "@/lib/schools/auth";
import { DEMO_INSTRUCTORS, DEMO_PACKAGES, DEMO_PAYMENTS, demoLessons } from "@/lib/schools/demo";
import type { ChargeableLesson, PackageRow, PaymentRow } from "@/lib/schools/money";

/**
 * The rows a school's money is computed from (see src/lib/schools/money.ts).
 *
 * Read through the signed-in user's own client, like every school read, so
 * row-level security (0038) decides what comes back. Lessons are narrowed to
 * the ones money can depend on — on a package, or carrying a price — because
 * the rest can never change a balance.
 */

export interface Ledger {
  packages: PackageRow[];
  payments: PaymentRow[];
  lessons: ChargeableLesson[];
}

const PACKAGE_COLUMNS = "id, learner_id, name, lessons_included, price_cents, status, sold_on, expires_on";
const PAYMENT_COLUMNS =
  "id, learner_id, package_id, amount_cents, method, reference, received_on, received_by, note, voided_at, void_reason, created_at";
const CHARGE_COLUMNS = "id, learner_id, package_id, price_cents, status";

async function client() {
  return isSupabaseConfigured ? await createClient() : null;
}

function demoLedger(learnerId?: string): Ledger {
  const lessons = demoLessons()
    .filter((l) => l.package_id !== null || l.price_cents !== null)
    .map(({ id, learner_id, package_id, price_cents, status }) => ({ id, learner_id, package_id, price_cents, status }));
  const mine = <T extends { learner_id: string | null }>(rows: T[]) =>
    learnerId ? rows.filter((r) => r.learner_id === learnerId) : rows;
  return { packages: mine(DEMO_PACKAGES), payments: mine(DEMO_PAYMENTS), lessons: mine(lessons) };
}

/** The whole school's ledger — for the money overview. */
export async function schoolLedger(school: SchoolContext): Promise<Ledger> {
  const supabase = await client();
  if (!supabase) return demoLedger();
  const [packages, payments, lessons] = await Promise.all([
    supabase.from("school_packages").select(PACKAGE_COLUMNS).eq("school_id", school.schoolId),
    supabase
      .from("school_payments")
      .select(PAYMENT_COLUMNS)
      .eq("school_id", school.schoolId)
      .order("received_on", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("school_lessons")
      .select(CHARGE_COLUMNS)
      .eq("school_id", school.schoolId)
      .or("package_id.not.is.null,price_cents.not.is.null"),
  ]);
  return {
    packages: (packages.data ?? []) as PackageRow[],
    payments: (payments.data ?? []) as PaymentRow[],
    lessons: (lessons.data ?? []) as ChargeableLesson[],
  };
}

/** One learner's ledger — for their card. */
export async function learnerLedger(school: SchoolContext, learnerId: string): Promise<Ledger> {
  const supabase = await client();
  if (!supabase) return demoLedger(learnerId);
  const [packages, payments, lessons] = await Promise.all([
    supabase
      .from("school_packages")
      .select(PACKAGE_COLUMNS)
      .eq("school_id", school.schoolId)
      .eq("learner_id", learnerId)
      .order("sold_on", { ascending: false }),
    supabase
      .from("school_payments")
      .select(PAYMENT_COLUMNS)
      .eq("school_id", school.schoolId)
      .eq("learner_id", learnerId)
      .order("received_on", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("school_lessons")
      .select(CHARGE_COLUMNS)
      .eq("school_id", school.schoolId)
      .eq("learner_id", learnerId)
      .or("package_id.not.is.null,price_cents.not.is.null"),
  ]);
  return {
    packages: (packages.data ?? []) as PackageRow[],
    payments: (payments.data ?? []) as PaymentRow[],
    lessons: (lessons.data ?? []) as ChargeableLesson[],
  };
}

/**
 * Payments record who took the money by auth user id; this turns that into
 * the name the school knows them by.
 */
export async function memberNamesByUser(school: SchoolContext): Promise<Map<string, string>> {
  const supabase = await client();
  if (!supabase) return new Map(DEMO_INSTRUCTORS.map((i) => [i.id, i.displayName]));
  const { data } = await supabase
    .from("school_members")
    .select("user_id, display_name")
    .eq("school_id", school.schoolId);
  return new Map(
    ((data ?? []) as { user_id: string; display_name: string }[]).map((m) => [
      m.user_id,
      m.display_name?.trim() || "Unnamed",
    ]),
  );
}
