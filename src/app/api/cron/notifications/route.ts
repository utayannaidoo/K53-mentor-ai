import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { buildEmail, type NotificationType } from "@/lib/notify/templates";

export const runtime = "nodejs";

/**
 * Daily engagement cron (see vercel.json — scheduled for 16:00 UTC, i.e. 18:00
 * South African time, when "your streak ends at midnight" is genuinely urgent).
 *
 * Sends at most ONE email per user per run, by priority:
 *   1. streak_risk  — studied yesterday but not today, streak >= 2
 *   2. dormant_7d   — inactive 7+ days
 *   3. dormant_3d   — inactive 3–6 days
 *   4. due_review   — active recently, but has flashcards past due today
 *
 * Dedup windows (per type) stop repeat nagging; the notifications table is the
 * send ledger. Rows are only written after a successful send, so an
 * unconfigured or failing email provider never silently "uses up" a nudge.
 */

/** Per-type minimum gap between sends to the same user, in hours. */
const COOLDOWN_HOURS: Record<NotificationType, number> = {
  streak_risk: 20,
  due_review: 48,
  dormant_3d: 7 * 24,
  dormant_7d: 14 * 24,
};

/** South Africa has no DST — a fixed UTC+2 date key is always correct. */
function sastDateKey(d: Date): string {
  return new Date(d.getTime() + 2 * 3_600_000).toISOString().slice(0, 10);
}

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  last_active_at: string | null;
  email_notifications: boolean | null;
}

interface StreakRow {
  user_id: string;
  current: number | null;
  longest: number | null;
  last_study_date: string | null;
  due_cards: number | null;
  next_due_at: string | null;
}

/** Constant-time string comparison — a plain !== leaks length/prefix timing. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return Response.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const now = new Date();
  const today = sastDateKey(now);
  const yesterday = sastDateKey(new Date(now.getTime() - 86_400_000));
  const dedupSince = new Date(now.getTime() - 14 * 86_400_000).toISOString();

  const [profilesRes, streaksRes, notifRes] = await Promise.all([
    admin
      .from("profiles")
      .select("id, email, full_name, last_active_at, email_notifications")
      .not("email", "is", null),
    admin.from("streaks").select("user_id, current, longest, last_study_date, due_cards, next_due_at"),
    admin.from("notifications").select("user_id, type, created_at").gte("created_at", dedupSince),
  ]);

  const err = profilesRes.error ?? streaksRes.error ?? notifRes.error;
  if (err) {
    console.error("cron query error", err);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }

  const streakByUser = new Map<string, StreakRow>(
    ((streaksRes.data ?? []) as StreakRow[]).map((s) => [s.user_id, s]),
  );
  /** user_id → type → most recent send time (ms). */
  const lastSent = new Map<string, Map<string, number>>();
  for (const n of (notifRes.data ?? []) as { user_id: string; type: string; created_at: string }[]) {
    const per = lastSent.get(n.user_id) ?? new Map<string, number>();
    per.set(n.type, Math.max(per.get(n.type) ?? 0, new Date(n.created_at).getTime()));
    lastSent.set(n.user_id, per);
  }

  const onCooldown = (userId: string, type: NotificationType) => {
    const at = lastSent.get(userId)?.get(type);
    return at != null && now.getTime() - at < COOLDOWN_HOURS[type] * 3_600_000;
  };

  const sent: Record<NotificationType, number> = {
    streak_risk: 0,
    due_review: 0,
    dormant_3d: 0,
    dormant_7d: 0,
  };
  let wouldSend = 0;

  for (const profile of (profilesRes.data ?? []) as ProfileRow[]) {
    if (profile.email_notifications === false || !profile.email || !profile.last_active_at) continue;

    const streak = streakByUser.get(profile.id);
    const current = streak?.current ?? 0;
    const lastStudy = streak?.last_study_date ?? null;
    const inactiveDays = Math.floor(
      (now.getTime() - new Date(profile.last_active_at).getTime()) / 86_400_000,
    );
    const dueNow = Boolean(streak?.next_due_at && new Date(streak.next_due_at) <= now);

    let type: NotificationType | null = null;
    if (lastStudy === yesterday && current >= 2) type = "streak_risk";
    else if (inactiveDays >= 7) type = "dormant_7d";
    else if (inactiveDays >= 3) type = "dormant_3d";
    else if (lastStudy !== today && dueNow) type = "due_review";

    if (!type || onCooldown(profile.id, type)) continue;

    if (!isEmailConfigured) {
      wouldSend += 1;
      continue;
    }

    const content = buildEmail(type, {
      firstName: (profile.full_name ?? "").split(" ")[0],
      streak: current,
      longest: streak?.longest ?? 0,
      dueCards: streak?.due_cards ?? 0,
    });
    const ok = await sendEmail({ to: profile.email, ...content });
    if (!ok) continue;

    sent[type] += 1;
    await admin.from("notifications").insert({
      user_id: profile.id,
      type,
      payload: { to: profile.email, subject: content.subject },
      scheduled_for: now.toISOString(),
      sent_at: new Date().toISOString(),
    });
  }

  return Response.json({
    configured: isEmailConfigured,
    scanned: profilesRes.data?.length ?? 0,
    sent,
    ...(isEmailConfigured ? {} : { wouldSend }),
  });
}
