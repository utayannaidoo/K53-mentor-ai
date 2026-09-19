"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { currentSchool, requireSchool } from "@/lib/schools/auth";
import {
  hashInviteToken,
  newInviteToken,
  newShortCode,
  normaliseShortCode,
  validShortCode,
} from "@/lib/schools/invites";
import type { ActionResult } from "@/lib/forms/action-result";
import { rpcMessage } from "@/lib/schools/rpc-message";
import { SCHOOL_TRIAL_DAYS, SCHOOL_TRIAL_SEATS } from "@/lib/billing/school-plans";

/**
 * Every school workspace mutation.
 *
 * Same doctrine as the admin actions: each one re-checks the caller itself
 * rather than trusting the layout that drew the form, because a server action
 * is a public POST endpoint wearing a form's clothes. Role and subscription
 * state are both checked here *and* enforced by RLS and the definer RPCs —
 * this layer exists to produce a sentence a human can act on, not to be the
 * security boundary.
 */

const TRIAL_DAYS = SCHOOL_TRIAL_DAYS;
const TRIAL_SEATS = SCHOOL_TRIAL_SEATS;

/**
 * Demo mode has no database and no session, so nothing can be saved. Every
 * action answers with this before anything else, so the demo says why rather
 * than claiming the visitor isn't signed in.
 */
const DEMO_REFUSAL: ActionResult = { ok: false, message: "Not available in the demo." };

/**
 * Supabase is configured but the service-role key is not — a half-set-up
 * deployment, most likely a preview missing SUPABASE_SERVICE_ROLE_KEY in its
 * env scope. Worded so whoever sees it knows where to look.
 */
const NOT_CONFIGURED: ActionResult = {
  ok: false,
  message: "The school workspace isn't fully configured on this deployment yet.",
};

function refresh() {
  revalidatePath("/schools");
  revalidatePath("/schools/settings");
}

/** The signed-in user id, or null in demo mode / when signed out. */
async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function createSchoolWorkspace(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const userId = await currentUserId();
  if (!userId) return { ok: false, message: "Sign in first." };
  const admin = createAdminClient();
  if (!admin) return NOT_CONFIGURED;

  const name = String(form.get("name") ?? "").trim();
  if (name.length < 2) return { ok: false, message: "Enter your school's name." };

  const { error } = await admin.rpc("create_school_for_owner", {
    p_user: userId,
    p_name: name,
    p_town: String(form.get("town") ?? "").trim() || null,
    p_province: String(form.get("province") ?? "").trim() || null,
    p_phone: String(form.get("phone") ?? "").trim() || null,
    p_trial_days: TRIAL_DAYS,
    p_trial_seats: TRIAL_SEATS,
  });
  if (error) {
    console.error("[schools] create workspace failed", error.message);
    return { ok: false, message: rpcMessage(error, "Could not create the school.") };
  }
  refresh();
  return {
    ok: true,
    message: `${name} is set up. Your ${TRIAL_DAYS}-day trial has started — no card needed.`,
  };
}

export async function linkPartnerCode(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ roles: ["owner"] });
  if (!guard.ok) return { ok: false, message: guard.message };
  const userId = await currentUserId();
  const admin = createAdminClient();
  if (!admin || !userId) return NOT_CONFIGURED;

  const code = String(form.get("code") ?? "").trim().toLowerCase();
  if (!code) return { ok: false, message: "Enter your partner code." };

  const { data, error } = await admin.rpc("link_partner_school", {
    p_user: userId,
    p_school: guard.school.schoolId,
    p_code: code,
  });
  if (error) {
    console.error("[schools] link partner failed", error.message);
    return { ok: false, message: rpcMessage(error, "Could not link that code.") };
  }
  refresh();
  return { ok: true, message: `Linked to ${String(data)}. Your referral earnings now show here.` };
}

export async function inviteMember(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ roles: ["owner"], write: true });
  if (!guard.ok) return { ok: false, message: guard.message };
  const userId = await currentUserId();
  const admin = createAdminClient();
  if (!admin || !userId) return NOT_CONFIGURED;

  const role = String(form.get("role") ?? "instructor");
  if (role !== "instructor" && role !== "assistant") {
    return { ok: false, message: "Pick instructor or office staff." };
  }

  const token = newInviteToken();
  const shortCode = newShortCode();
  const { error } = await admin.rpc("create_school_invite", {
    p_user: userId,
    p_school: guard.school.schoolId,
    p_role: role,
    p_email: String(form.get("email") ?? "").trim() || null,
    p_token_hash: hashInviteToken(token),
    p_short_code: shortCode,
    p_expires_days: 14,
  });
  if (error) {
    console.error("[schools] invite failed", error.message);
    return { ok: false, message: rpcMessage(error, "Could not create the invite.") };
  }
  refresh();
  // The code is the deliverable — the owner reads it out or sends it on. It is
  // shown once here because only the digest is stored.
  return { ok: true, message: `Invite code ${shortCode} — valid for 14 days.` };
}

export async function acceptInvite(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const userId = await currentUserId();
  if (!userId) return { ok: false, message: "Sign in first." };
  const admin = createAdminClient();
  if (!admin) return NOT_CONFIGURED;

  const rawToken = String(form.get("token") ?? "").trim();
  const rawCode = normaliseShortCode(String(form.get("code") ?? ""));
  if (!rawToken && !validShortCode(rawCode)) {
    return { ok: false, message: "Enter the 8-character code from your school." };
  }

  const { error } = await admin.rpc("accept_school_invite", {
    p_user: userId,
    p_token_hash: rawToken ? hashInviteToken(rawToken) : null,
    p_short_code: rawToken ? null : rawCode,
  });
  if (error) {
    console.error("[schools] accept invite failed", error.message);
    return { ok: false, message: rpcMessage(error, "That invite could not be used.") };
  }
  refresh();
  return { ok: true, message: "You're in. Open the diary to get started." };
}

export async function revokeInvite(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ roles: ["owner"] });
  if (!guard.ok) return { ok: false, message: guard.message };
  const userId = await currentUserId();
  const admin = createAdminClient();
  if (!admin || !userId) return NOT_CONFIGURED;

  const { error } = await admin.rpc("revoke_school_invite", {
    p_user: userId,
    p_invite: String(form.get("id") ?? ""),
  });
  if (error) {
    console.error("[schools] revoke invite failed", error.message);
    return { ok: false, message: rpcMessage(error, "Could not cancel that invite.") };
  }
  refresh();
  return { ok: true, message: "Invite cancelled. That code no longer works." };
}

export async function removeMember(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ roles: ["owner"] });
  if (!guard.ok) return { ok: false, message: guard.message };
  const userId = await currentUserId();
  const admin = createAdminClient();
  if (!admin || !userId) return NOT_CONFIGURED;

  const { error } = await admin.rpc("deactivate_school_member", {
    p_user: userId,
    p_member: String(form.get("id") ?? ""),
  });
  if (error) {
    console.error("[schools] remove member failed", error.message);
    return { ok: false, message: rpcMessage(error, "Could not remove that person.") };
  }
  refresh();
  return { ok: true, message: "Removed. Their lessons stay on the diary as a record." };
}

/**
 * Hand the school to another active member. The RPC demotes the current owner
 * to instructor and promotes the new one in a single transaction, so the
 * one-active-owner index never sees two owners or none.
 *
 * Billing does NOT move with it: a running plan keeps charging the card that
 * bought it until the new owner chooses a plan of their own, at which point
 * the grant stops the old one (stopPreviousPayer in school-billing.ts). The
 * confirm on the button says so.
 */
export async function transferOwnership(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ roles: ["owner"] });
  if (!guard.ok) return { ok: false, message: guard.message };
  const userId = await currentUserId();
  const admin = createAdminClient();
  if (!admin || !userId) return NOT_CONFIGURED;

  const { error } = await admin.rpc("transfer_school_ownership", {
    p_user: userId,
    p_school: guard.school.schoolId,
    p_member: String(form.get("id") ?? ""),
  });
  if (error) {
    console.error("[schools] transfer ownership failed", error.message);
    return { ok: false, message: rpcMessage(error, "Could not hand the school over.") };
  }
  refresh();
  return { ok: true, message: "Done. They own the school now, and you're an instructor." };
}

/**
 * Bank transfer or credit, for referral commission not yet settled. Credit
 * already earned stays credit: there is no path from credit back to cash.
 */
export async function setCommissionMode(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return DEMO_REFUSAL;
  const guard = await requireSchool({ roles: ["owner"] });
  if (!guard.ok) return { ok: false, message: guard.message };
  const userId = await currentUserId();
  const admin = createAdminClient();
  if (!admin || !userId) return NOT_CONFIGURED;

  const mode = form.get("mode") === "credit" ? "credit" : "eft";
  const { error } = await admin.rpc("set_school_commission_mode", {
    p_user: userId,
    p_school: guard.school.schoolId,
    p_mode: mode,
  });
  if (error) {
    console.error("[schools] commission mode failed", error.message);
    return { ok: false, message: rpcMessage(error, "Could not change how commission is paid.") };
  }
  refresh();
  return {
    ok: true,
    message:
      mode === "credit"
        ? "Done. New commission goes toward your plan from tonight."
        : "Done. New commission is paid to your bank account again.",
  };
}

/** Used by the join page to decide what to draw before anything is submitted. */
export async function hasSchool(): Promise<boolean> {
  return (await currentSchool()) !== null;
}
