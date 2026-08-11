import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthorizedCron } from "@/lib/cron/auth";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import {
  buildEmail,
  buildSubscriptionEndingEmail,
  type NotificationType,
} from "@/lib/notify/templates";
import { PLAN_MAP } from "@/lib/billing/plans";

export const runtime = "nodejs";
// One email per user, sent sequentially — allow the full minute available on
// every hosting plan rather than the ~10s default.
export const maxDuration = 60;

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

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
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

  const sent: Record<NotificationType, number> = {
    streak_risk: 0,
    due_review: 0,
    dormant_3d: 0,
    dormant_7d: 0,
  };
  let wouldSend = 0;
  let scanned = 0;

  // Page through profiles: PostgREST caps un-ranged selects (1000 rows by
  // default), so a single select silently drops users past the cap — and a
  // truncated dedup query re-nags users whose cooldown rows were cut off.
  // Batching also keeps streak/notification lookups keyed to the same users.
  const PAGE = 500;
  for (let from = 0; ; from += PAGE) {
    const profilesRes = await admin
      .from("profiles")
      .select("id, email, full_name, last_active_at, email_notifications")
      .not("email", "is", null)
      .order("id")
      .range(from, from + PAGE - 1);
    if (profilesRes.error) {
      console.error("cron query error", profilesRes.error);
      return Response.json({ error: "Query failed" }, { status: 500 });
    }
    const profiles = (profilesRes.data ?? []) as ProfileRow[];
    if (profiles.length === 0) break;
    scanned += profiles.length;

    const ids = profiles.map((p) => p.id);
    const [streaksRes, notifRes] = await Promise.all([
      admin
        .from("streaks")
        .select("user_id, current, longest, last_study_date, due_cards, next_due_at")
        .in("user_id", ids),
      admin
        .from("notifications")
        .select("user_id, type, created_at")
        .in("user_id", ids)
        .gte("created_at", dedupSince),
    ]);
    const err = streaksRes.error ?? notifRes.error;
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

    for (const profile of profiles) {
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

    if (profiles.length < PAGE) break;
  }

  const endingSent = await sendSubscriptionEndingNotices(admin, now);

  return Response.json({
    configured: isEmailConfigured,
    scanned,
    sent,
    endingSoon: endingSent,
    ...(isEmailConfigured ? {} : { wouldSend }),
  });
}

/** Warn this many days before a cancelled subscription's access actually stops. */
const ENDING_NOTICE_DAYS = 3;

/**
 * Tell people whose cancelled subscription is about to lapse.
 *
 * Deliberately outside the study-nudge loop above, for two reasons. It is
 * driven by `subscriptions`, not `profiles`, so scanning every profile to find
 * a handful of rows would be wasteful. And it is **transactional** — someone
 * paid and is about to lose access — so unlike the study nudges it is *not*
 * gated on `profiles.email_notifications`. Muting study reminders must not
 * mute a notice about your own billing.
 *
 * Dedup is the `notifications` ledger, same as the nudges: the row is written
 * only after a successful send, so an email outage never silently consumes the
 * single warning somebody gets. `subscription_ending` is recorded once per
 * period end, so a resubscribe-then-cancel-again correctly warns a second time.
 */
async function sendSubscriptionEndingNotices(
  admin: SupabaseClient,
  now: Date,
): Promise<number> {
  const horizon = new Date(now.getTime() + ENDING_NOTICE_DAYS * 86_400_000).toISOString();

  const { data, error } = await admin
    .from("subscriptions")
    .select("user_id, tier, current_period_end")
    .eq("cancel_at_period_end", true)
    .neq("tier", "free")
    .not("current_period_end", "is", null)
    .gt("current_period_end", now.toISOString())
    .lte("current_period_end", horizon);

  if (error) {
    console.error("cron: ending-subscription query failed", error.message);
    return 0;
  }
  const rows = (data ?? []) as { user_id: string; tier: string; current_period_end: string }[];
  if (rows.length === 0) return 0;

  const ids = rows.map((r) => r.user_id);
  const [profilesRes, notifRes] = await Promise.all([
    admin.from("profiles").select("id, email, full_name").in("id", ids),
    admin
      .from("notifications")
      .select("user_id, payload")
      .eq("type", "subscription_ending")
      .in("user_id", ids),
  ]);
  if (profilesRes.error || notifRes.error) {
    console.error("cron: ending-subscription lookup failed");
    return 0;
  }

  const profileById = new Map(
    ((profilesRes.data ?? []) as { id: string; email: string | null; full_name: string | null }[]).map(
      (p) => [p.id, p],
    ),
  );
  // Keyed by period end, not just by user: someone who resubscribes and later
  // cancels again has a new end date and deserves a fresh warning.
  const alreadyWarned = new Set(
    ((notifRes.data ?? []) as { user_id: string; payload: { endsOn?: string } | null }[]).map(
      (n) => `${n.user_id}:${n.payload?.endsOn ?? ""}`,
    ),
  );

  let count = 0;
  for (const row of rows) {
    if (alreadyWarned.has(`${row.user_id}:${row.current_period_end}`)) continue;
    const profile = profileById.get(row.user_id);
    if (!profile?.email) continue;
    if (row.tier !== "premium" && row.tier !== "premium_plus") continue;
    if (!isEmailConfigured) continue;

    const daysLeft = Math.max(
      1,
      Math.ceil((Date.parse(row.current_period_end) - now.getTime()) / 86_400_000),
    );
    const content = buildSubscriptionEndingEmail({
      firstName: (profile.full_name ?? "").split(" ")[0],
      planName: PLAN_MAP[row.tier].name,
      endsOn: row.current_period_end,
      daysLeft,
    });
    const ok = await sendEmail({ to: profile.email, ...content });
    if (!ok) continue;

    count += 1;
    await admin.from("notifications").insert({
      user_id: row.user_id,
      type: "subscription_ending",
      payload: { to: profile.email, subject: content.subject, endsOn: row.current_period_end },
      sent_at: new Date().toISOString(),
    });
  }
  return count;
}
