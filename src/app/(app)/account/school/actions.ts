"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { limitUserDaily } from "@/lib/ai/rate-limit";
import { normaliseShortCode, validShortCode } from "@/lib/schools/invites";
import { rpcMessage } from "@/lib/schools/rpc-message";

/**
 * The learner's side of connecting to a driving school (migration 0043).
 *
 * Only the learner can connect, and only by entering the code their school
 * gave them: first `peekSchoolLink` says which school it is (nothing changes),
 * then `acceptSchoolLink` records their consent. `leaveSchoolLink` ends it.
 * Each re-checks who is signed in; a server action is a public POST endpoint.
 */

export type PeekResult =
  | { ok: true; schoolName: string; learnerName: string }
  | { ok: false; message: string };

export type LinkResult = { ok: boolean; message: string };

/** Codes are 8 characters from 32 symbols; this caps guessing well short of useful. */
const DAILY_CODE_TRIES = 20;

async function signedInUser(): Promise<string | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function guard(rawCode: string): Promise<{ userId: string; code: string } | { message: string }> {
  if (!isSupabaseConfigured) return { message: "Connecting a driving school needs a K53 Mentor account." };
  const userId = await signedInUser();
  if (!userId) return { message: "Sign in to connect your driving school." };
  const code = normaliseShortCode(rawCode);
  if (!validShortCode(code)) return { message: "Enter the 8-character code from your driving school." };
  const limit = await limitUserDaily("school_link", userId, DAILY_CODE_TRIES);
  if (!limit.success) return { message: "Too many tries today. Ask your school for the code again tomorrow." };
  return { userId, code };
}

export async function peekSchoolLink(rawCode: string): Promise<PeekResult> {
  const checked = await guard(rawCode);
  if ("message" in checked) return { ok: false, message: checked.message };
  const admin = createAdminClient();
  if (!admin) return { ok: false, message: "This isn't available right now." };

  const { data, error } = await admin.rpc("peek_learner_link", { p_short_code: checked.code });
  const row = (data as { school_name: string; learner_first_name: string }[] | null)?.[0];
  if (error || !row) {
    if (error) console.error("[account/school] peek failed", error.message);
    return { ok: false, message: "That code isn't valid. Codes last 7 days and work once, so ask your school for a new one." };
  }
  return { ok: true, schoolName: row.school_name, learnerName: row.learner_first_name };
}

export async function acceptSchoolLink(rawCode: string): Promise<LinkResult> {
  const checked = await guard(rawCode);
  if ("message" in checked) return { ok: false, message: checked.message };
  const admin = createAdminClient();
  if (!admin) return { ok: false, message: "This isn't available right now." };

  const { data, error } = await admin.rpc("accept_learner_link", {
    p_user: checked.userId,
    p_short_code: checked.code,
  });
  if (error) {
    console.error("[account/school] accept failed", error.message);
    return { ok: false, message: rpcMessage(error, "We couldn't connect you. Please try again.") };
  }
  revalidatePath("/account/school");
  return { ok: true, message: `You're connected to ${String(data)}.` };
}

export async function leaveSchoolLink(rosterId: string): Promise<LinkResult> {
  if (!isSupabaseConfigured) return { ok: false, message: "This isn't available in the demo." };
  const userId = await signedInUser();
  if (!userId) return { ok: false, message: "Sign in again to continue." };
  const admin = createAdminClient();
  if (!admin) return { ok: false, message: "This isn't available right now." };

  const { error } = await admin.rpc("unlink_school_learner", { p_user: userId, p_learner: rosterId });
  if (error) {
    console.error("[account/school] leave failed", error.message);
    return { ok: false, message: rpcMessage(error, "We couldn't disconnect you. Please try again.") };
  }
  revalidatePath("/account/school");
  return { ok: true, message: "Disconnected. Your school no longer sees anything from your app." };
}
