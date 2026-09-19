import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { SchoolContext } from "@/lib/schools/auth";
import { DEMO_LINK_SUMMARY } from "@/lib/schools/demo";
import { CATEGORIES } from "@/lib/content/categories";
import { modulesForLicence, RATING_LABEL, type Rating } from "@/lib/schools/modules";
import { learnerBalance, type ChargeableLesson, type PackageRow, type PaymentRow } from "@/lib/schools/money";
import type { LicenceCode } from "@/lib/schools/diary-types";

/**
 * A roster learner linked to their own K53 Mentor account (migration 0043).
 *
 * Two directions, both deliberately narrow:
 *
 *  - School -> learner: `linkedSchoolsFor` builds the ONLY shape the learner
 *    app ever receives about a school — its name, the instructor's name, the
 *    next lesson and pickup, the manoeuvre ratings, the next focus from notes
 *    the instructor marked as visible, and the balance. Read with the service
 *    role (the learner is not a school member, so RLS would show nothing), and
 *    only for roster rows whose linked_user_id is the signed-in user.
 *
 *  - Learner -> school: `linkSummaryFor` returns what the database function
 *    school_learner_progress_summary allows — a readiness number and a
 *    strength per question category. Nothing about the learner is read here.
 */

// ── Learner -> school ───────────────────────────────────────────────────────

export interface LinkSummary {
  readiness: number | null;
  readinessDay: string | null;
  categories: { categoryId: string; name: string; strength: number; enough: boolean }[];
}

const CATEGORY_NAME = new Map(CATEGORIES.map((c) => [c.id as string, c.name]));

/** Parses the function's jsonb into the typed shape; null when there is none. */
export function parseLinkSummary(raw: unknown): LinkSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { readiness?: unknown; readiness_day?: unknown; categories?: unknown };
  const categories = Array.isArray(r.categories) ? r.categories : [];
  return {
    readiness: typeof r.readiness === "number" ? r.readiness : null,
    readinessDay: typeof r.readiness_day === "string" ? r.readiness_day : null,
    categories: categories
      .map((c) => c as { category_id?: unknown; strength?: unknown; enough?: unknown })
      .filter((c) => typeof c.category_id === "string" && typeof c.strength === "number")
      .map((c) => ({
        categoryId: c.category_id as string,
        name: CATEGORY_NAME.get(c.category_id as string) ?? (c.category_id as string),
        strength: c.strength as number,
        enough: c.enough === true,
      }))
      // Weakest first: what an instructor should talk about next.
      .sort((a, b) => Number(b.enough) - Number(a.enough) || a.strength - b.strength),
  };
}

/** What the school may see of a linked learner's own studying, for this caller. */
export async function linkSummaryFor(
  admin: SupabaseClient,
  callerId: string,
  learnerId: string,
): Promise<LinkSummary | null> {
  const { data, error } = await admin.rpc("school_learner_progress_summary", {
    p_user: callerId,
    p_learner: learnerId,
  });
  if (error) {
    console.error("[schools] link summary failed", error.message);
    return null;
  }
  return parseLinkSummary(data);
}

/** The code still open for a roster learner, for the card to show again. */
export async function openLinkCode(
  admin: SupabaseClient,
  schoolId: string,
  learnerId: string,
): Promise<{ code: string; expiresAt: string } | null> {
  const { data } = await admin
    .from("school_learner_link_codes")
    .select("short_code, expires_at")
    .eq("school_id", schoolId)
    .eq("learner_id", learnerId)
    .is("used_at", null)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);
  const row = (data as { short_code: string; expires_at: string }[] | null)?.[0];
  return row ? { code: row.short_code, expiresAt: row.expires_at } : null;
}

/**
 * Everything the learner card needs for its "their app" panel: what a
 * connected learner shares, or the code still open for one who hasn't
 * connected yet. The demo shows Thabo connected.
 */
export async function linkPanelFor(
  school: SchoolContext,
  learner: { id: string; link_consent_at: string | null },
): Promise<{ summary: LinkSummary | null; code: { code: string; expiresAt: string } | null }> {
  if (!isSupabaseConfigured) {
    return { summary: learner.link_consent_at ? DEMO_LINK_SUMMARY : null, code: null };
  }
  const admin = createAdminClient();
  if (!admin) return { summary: null, code: null };
  if (!learner.link_consent_at) return { summary: null, code: await openLinkCode(admin, school.schoolId, learner.id) };

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!user) return { summary: null, code: null };
  return { summary: await linkSummaryFor(admin, user.id, learner.id), code: null };
}

// ── School -> learner ───────────────────────────────────────────────────────

export interface LinkedSchoolView {
  /** The roster row: what the learner passes back to stop sharing. */
  rosterId: string;
  schoolName: string;
  timezone: string;
  connectedAt: string;
  instructorName: string | null;
  nextLesson: { startsAt: string; endsAt: string; pickup: string | null; instructorName: string | null } | null;
  manoeuvres: { name: string; rating: string }[];
  totalManoeuvres: number;
  nextFocus: { text: string; lessonAt: string } | null;
  balanceCents: number;
}

interface RosterRow {
  id: string;
  school_id: string;
  licence_code: LicenceCode;
  assigned_instructor_id: string | null;
  link_consent_at: string;
}

/**
 * Every school the user has connected, in the one shape the learner app may
 * show. Anything not assembled here — the school's private notes, other
 * learners, staff phone numbers, the cash book — does not reach the learner.
 */
export async function linkedSchoolsFor(admin: SupabaseClient, userId: string): Promise<LinkedSchoolView[]> {
  const { data, error } = await admin
    .from("school_learners")
    .select("id, school_id, licence_code, assigned_instructor_id, link_consent_at")
    .eq("linked_user_id", userId);
  if (error) {
    // No school tables yet (0043 not applied) reads as "no school", like
    // every other school lookup the learner app makes.
    if (!(error.code === "42P01" || error.code === "PGRST205" || error.code === "42703")) {
      console.error("[schools] linked schools lookup failed", error.message);
    }
    return [];
  }
  const rows = (data ?? []) as RosterRow[];
  return Promise.all(rows.map((row) => schoolViewFor(admin, row)));
}

async function schoolViewFor(admin: SupabaseClient, row: RosterRow): Promise<LinkedSchoolView> {
  const now = new Date().toISOString();
  // Only the columns the view needs, and for the balance only the columns the
  // arithmetic needs: the learner path never reads the school's payment
  // references, notes or who took the money.
  const [school, members, upcoming, history, progress, packages, payments, charges] = await Promise.all([
    admin.from("schools").select("name, timezone").eq("id", row.school_id).maybeSingle(),
    admin.from("school_members").select("id, display_name").eq("school_id", row.school_id),
    admin
      .from("school_lessons")
      .select("starts_at, ends_at, pickup_address, instructor_id")
      .eq("school_id", row.school_id)
      .eq("learner_id", row.id)
      .eq("status", "scheduled")
      .gt("starts_at", now)
      .order("starts_at", { ascending: true })
      .limit(1),
    admin
      .from("school_lessons")
      .select("id, starts_at")
      .eq("school_id", row.school_id)
      .eq("learner_id", row.id)
      .lte("starts_at", now)
      .order("starts_at", { ascending: false })
      .limit(100),
    admin
      .from("school_learner_progress")
      .select("module_id, rating")
      .eq("school_id", row.school_id)
      .eq("learner_id", row.id),
    admin.from("school_packages").select("learner_id, price_cents, status").eq("school_id", row.school_id).eq("learner_id", row.id),
    admin
      .from("school_payments")
      .select("learner_id, amount_cents, voided_at")
      .eq("school_id", row.school_id)
      .eq("learner_id", row.id),
    admin
      .from("school_lessons")
      .select("learner_id, package_id, price_cents, status")
      .eq("school_id", row.school_id)
      .eq("learner_id", row.id)
      .or("package_id.not.is.null,price_cents.not.is.null"),
  ]);

  // Only notes the instructor chose to share (learner_visible), and only the
  // one line meant for the learner: what the next lesson starts with.
  const lessonsSoFar = (history.data ?? []) as { id: string; starts_at: string }[];
  let nextFocus: LinkedSchoolView["nextFocus"] = null;
  if (lessonsSoFar.length > 0) {
    const { data: notes } = await admin
      .from("school_lesson_notes")
      .select("lesson_id, next_focus")
      .eq("school_id", row.school_id)
      .eq("learner_visible", true)
      .in(
        "lesson_id",
        lessonsSoFar.map((l) => l.id),
      );
    nextFocus = pickLatestFocus(lessonsSoFar, (notes ?? []) as { lesson_id: string; next_focus: string | null }[]);
  }

  const names = new Map(
    ((members.data ?? []) as { id: string; display_name: string }[]).map((m) => [m.id, m.display_name?.trim() || null]),
  );
  const next = ((upcoming.data ?? []) as { starts_at: string; ends_at: string; pickup_address: string | null; instructor_id: string }[])[0];

  const modules = modulesForLicence(row.licence_code);
  const ratingByModule = new Map(
    ((progress.data ?? []) as { module_id: string; rating: Rating }[]).map((p) => [p.module_id, p.rating]),
  );
  const manoeuvres = modules
    .filter((m) => ratingByModule.has(m.id))
    .map((m) => ({ name: m.name, rating: RATING_LABEL[ratingByModule.get(m.id)!] ?? "" }));

  const { balanceCents } = learnerBalance(
    row.id,
    (packages.data ?? []) as unknown as PackageRow[],
    (payments.data ?? []) as unknown as PaymentRow[],
    (charges.data ?? []) as unknown as ChargeableLesson[],
  );

  const schoolRow = school.data as { name: string; timezone: string | null } | null;
  return {
    rosterId: row.id,
    schoolName: schoolRow?.name ?? "Your driving school",
    timezone: schoolRow?.timezone || "Africa/Johannesburg",
    connectedAt: row.link_consent_at,
    instructorName: row.assigned_instructor_id ? (names.get(row.assigned_instructor_id) ?? null) : null,
    nextLesson: next
      ? {
          startsAt: next.starts_at,
          endsAt: next.ends_at,
          pickup: next.pickup_address,
          instructorName: names.get(next.instructor_id) ?? null,
        }
      : null,
    manoeuvres,
    totalManoeuvres: modules.length,
    nextFocus,
    balanceCents,
  };
}

/** The shared "next focus" from the most recent lesson that has one. */
export function pickLatestFocus(
  lessons: { id: string; starts_at: string }[],
  notes: { lesson_id: string; next_focus: string | null }[],
): { text: string; lessonAt: string } | null {
  const when = new Map(lessons.map((l) => [l.id, l.starts_at]));
  let best: { text: string; lessonAt: string } | null = null;
  for (const note of notes) {
    const text = note.next_focus?.trim();
    const lessonAt = when.get(note.lesson_id);
    if (!text || !lessonAt) continue;
    if (!best || lessonAt > best.lessonAt) best = { text, lessonAt };
  }
  return best;
}
