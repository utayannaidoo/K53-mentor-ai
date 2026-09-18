import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SchoolRole } from "@/lib/schools/auth";

/**
 * The team screen's data.
 *
 * Members are readable through RLS, but pending invites are not: that table
 * holds `token_hash`, and RLS cannot protect a single column, so it has no
 * policies at all. The owner's list is therefore served here with the service
 * role — which is safe only because every caller has already resolved
 * membership through `currentSchool()`. Do not call this without doing that.
 */

export interface MemberSummary {
  id: string;
  role: SchoolRole;
  displayName: string;
  createdAt: string;
  isSelf: boolean;
}

export interface InviteSummary {
  id: string;
  role: string;
  email: string | null;
  shortCode: string;
  expiresAt: string;
}

export interface SchoolTeam {
  members: MemberSummary[];
  invites: InviteSummary[];
}

interface MemberRow {
  id: string;
  user_id: string;
  role: SchoolRole;
  display_name: string;
  created_at: string;
}

interface InviteRow {
  id: string;
  role: string;
  email: string | null;
  short_code: string;
  expires_at: string;
}

export async function schoolTeam(schoolId: string, viewerId: string | null): Promise<SchoolTeam> {
  const admin = createAdminClient();
  if (!admin) return { members: [], invites: [] };

  const [memberResult, inviteResult] = await Promise.all([
    admin
      .from("school_members")
      .select("id, user_id, role, display_name, created_at")
      .eq("school_id", schoolId)
      .eq("status", "active")
      .order("created_at", { ascending: true }),
    admin
      .from("school_invites")
      .select("id, role, email, short_code, expires_at")
      .eq("school_id", schoolId)
      .is("accepted_at", null)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true }),
  ]);

  const members = ((memberResult.data ?? []) as MemberRow[]).map((row) => ({
    id: row.id,
    role: row.role,
    // Someone who never set a name still has to be addressable in the list.
    displayName: row.display_name?.trim() || "Unnamed",
    createdAt: row.created_at,
    isSelf: row.user_id === viewerId,
  }));

  const invites = ((inviteResult.data ?? []) as InviteRow[]).map((row) => ({
    id: row.id,
    role: row.role,
    email: row.email,
    shortCode: row.short_code,
    expiresAt: row.expires_at,
  }));

  return { members, invites };
}
