import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { ACCOUNT_DAILY_LIMIT, clientIp, limitCheckout, limitUserDaily } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";

/**
 * Server-side counterpart of "Reset all progress".
 *
 * The account-page button used to clear localStorage only — and in production
 * that was a lie twice over: account hydration immediately re-pulled the full
 * history from these tables, restoring everything the learner had just asked
 * to erase, while the middleware bounced their /login redirect straight back
 * to the dashboard. This route deletes the same rows hydration reads, so the
 * reset survives a reload.
 *
 * Every delete runs through the CALLER'S OWN Supabase client, so RLS's
 * `own_*` policies scope each statement to auth.uid() — the service-role key
 * is deliberately not used here. Responses tables (mock/diagnostic) need no
 * explicit delete: they cascade from their attempt rows.
 */
const PROGRESS_TABLES = [
  "question_attempts",
  "scenario_attempts",
  "mock_exam_attempts",
  "diagnostic_attempts",
  "flashcard_review_log",
  "readiness_history",
  "study_sessions",
  "study_plans",
  "user_procedure_progress",
] as const;

export async function POST(req: Request) {
  const rl = await limitCheckout(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  if (!isSupabaseConfigured) {
    // Demo mode has no server copy — the client clears localStorage itself.
    return Response.json({ ok: true, demo: true });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!user || !supabase) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Destructive and irreversible — a tight per-account cap under the per-IP one.
  const userRl = await limitUserDaily("reset", user.id, ACCOUNT_DAILY_LIMIT.reset);
  if (!userRl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: userRl.retryAfter },
      { status: 429, headers: { "Retry-After": String(userRl.retryAfter) } },
    );
  }

  for (const table of PROGRESS_TABLES) {
    const { error } = await supabase.from(table).delete().eq("user_id", user.id);
    if (error) {
      console.error("account/reset: delete failed", table, error.message);
      return Response.json(
        { error: "Couldn't reset your progress — please try again shortly." },
        { status: 500 },
      );
    }
  }

  // The streak lives in its own row keyed by user_id. Reset it to the defaults
  // rather than deleting it — readers treat an absent row as "never studied",
  // which upserting zeros also expresses, without leaving the sync upsert to
  // recreate it mid-flight with whatever the next client has cached.
  const { error: streakError } = await supabase.from("streaks").upsert({
    user_id: user.id,
    current: 0,
    longest: 0,
    last_study_date: null,
    freezes_remaining: 1,
    freeze_refreshed_week: null,
  });
  if (streakError) {
    console.error("account/reset: streak reset failed", streakError.message);
    return Response.json(
      { error: "Couldn't reset your progress — please try again shortly." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
