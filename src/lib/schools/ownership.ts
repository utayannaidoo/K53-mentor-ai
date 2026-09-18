import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Postgres and PostgREST's two ways of saying "that table does not exist":
 * 42P01 from Postgres itself, PGRST205 from PostgREST's schema cache.
 */
const MISSING_TABLE = new Set(["42P01", "PGRST205"]);

export type OwnedSchool = { id: string; name: string } | null | "unknown";

/**
 * The school a user is the active owner of, read with the service role.
 *
 * Asked by the learner app's own account deletion, so it has to keep working on
 * a database that has never heard of schools: a missing table means "owns
 * nothing". Any other failure is "unknown", and the caller must refuse rather
 * than guess — the database refuses too (0041's owner guard), but only after
 * the caller may already have stopped someone's billing.
 */
export async function ownedSchool(admin: SupabaseClient, userId: string): Promise<OwnedSchool> {
  const { data, error } = await admin
    .from("school_members")
    .select("school_id")
    .eq("user_id", userId)
    .eq("role", "owner")
    .eq("status", "active")
    .limit(1);
  if (error) {
    if (error.code && MISSING_TABLE.has(error.code)) return null;
    console.error("ownedSchool: membership lookup failed", error.message);
    return "unknown";
  }
  const schoolId = (data as { school_id: string }[] | null)?.[0]?.school_id;
  if (!schoolId) return null;

  const { data: school } = await admin.from("schools").select("name").eq("id", schoolId).maybeSingle();
  return { id: schoolId, name: (school as { name?: string } | null)?.name ?? "your driving school" };
}
