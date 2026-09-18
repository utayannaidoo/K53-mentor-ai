import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Who may open a school workspace, and what they may do in it.
 *
 * The analogue of `src/lib/partners/admin-auth.ts`, but keyed on membership
 * rather than an env allowlist. Reads go through the *user's* client, not the
 * service role, so every call here exercises the RLS policies added in 0035 —
 * if a policy is wrong, this breaks loudly rather than papering over it.
 *
 * The database is the authority on access (`my_writable_school_ids()` gates
 * every write). What this module resolves is what the UI should *draw* and
 * what a server action should refuse early with a decent message.
 */

export type SchoolRole = "owner" | "instructor" | "assistant";

/** `read_only` is a lapsed subscription, never a lockout — see the plan. */
export type SchoolAccess = "full" | "read_only";

export interface SchoolContext {
  schoolId: string;
  memberId: string;
  name: string;
  slug: string;
  role: SchoolRole;
  access: SchoolAccess;
  plan: string;
  status: string;
  seats: number;
  trialEndsAt: string | null;
  /** A paid plan told to stop renewing: it runs to currentPeriodEnd, then ends. */
  cancelAtPeriodEnd: boolean;
  /** When the paid-for period runs out. Null on a trial, or before it is recorded. */
  currentPeriodEnd: string | null;
  partnerSchoolId: string | null;
  /** Active owner + instructor members. Compared against `seats`. */
  seatsUsed: number;
  /** IANA zone every date and time in the workspace is shown in. */
  timezone: string;
  /** What a new booking defaults to. */
  defaultLessonMinutes: number;
}

interface MemberRow {
  id: string;
  school_id: string;
  role: SchoolRole;
}

interface SchoolRow {
  id: string;
  name: string;
  slug: string;
  partner_school_id: string | null;
  timezone: string | null;
  default_lesson_minutes: number | null;
}

interface SubscriptionRow {
  plan: string;
  status: string;
  seats: number;
  trial_ends_at: string | null;
  cancel_at_period_end?: boolean | null;
  current_period_end?: string | null;
}

/** Slack past a paid period's end, matching EXPIRY_GRACE_MS in tier-rule.ts. */
const PAID_GRACE_MS = 3 * 86_400_000;

/**
 * Whether a subscription row permits writes.
 *
 * Deliberately mirrors `my_writable_school_ids()` (0040), which follows the
 * learner app's expiry rule in src/lib/billing/tier-rule.ts. A missing row, an
 * expired trial, a cancelled plan past its paid-for date, or an unreadable
 * value all resolve to read-only: the school keeps every page and loses every
 * save.
 */
export function accessFromSubscription(sub: SubscriptionRow | null, now = Date.now()): SchoolAccess {
  if (!sub) return "read_only";
  if (sub.status === "trialing") {
    const ends = sub.trial_ends_at ? Date.parse(sub.trial_ends_at) : NaN;
    return Number.isFinite(ends) && ends > now ? "full" : "read_only";
  }
  if (sub.status !== "active" && sub.status !== "past_due") return "read_only";
  const periodEnd = sub.current_period_end ? Date.parse(sub.current_period_end) : NaN;
  if (Number.isFinite(periodEnd)) {
    if (sub.cancel_at_period_end && now >= periodEnd) return "read_only";
    if (now >= periodEnd + PAID_GRACE_MS) return "read_only";
  }
  return "full";
}

/**
 * The signed-in user's school, or null.
 *
 * Null covers all of: demo mode, nobody signed in, and a signed-in user who
 * belongs to no school. Callers must not distinguish between those in anything
 * they render — a stranger and a learner should see the same thing.
 *
 * Someone in more than one school gets their owned school first, then the
 * oldest membership. A picker belongs in a later slice; almost nobody is in two.
 */
export async function currentSchool(): Promise<SchoolContext | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: memberRows } = await supabase
    .from("school_members")
    .select("id, school_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  const members = (memberRows ?? []) as MemberRow[];
  if (members.length === 0) return null;
  const member = members.find((m) => m.role === "owner") ?? members[0];

  const [schoolResult, subscriptionResult, seatResult] = await Promise.all([
    supabase
      .from("schools")
      .select("id, name, slug, partner_school_id, timezone, default_lesson_minutes")
      .eq("id", member.school_id)
      .maybeSingle(),
    supabase
      .from("school_subscriptions")
      .select("plan, status, seats, trial_ends_at, cancel_at_period_end, current_period_end")
      .eq("school_id", member.school_id)
      .maybeSingle(),
    supabase
      .from("school_members")
      .select("id", { count: "exact", head: true })
      .eq("school_id", member.school_id)
      .eq("status", "active")
      .in("role", ["owner", "instructor"]),
  ]);

  const school = schoolResult.data as SchoolRow | null;
  if (!school) return null;
  const sub = subscriptionResult.data as SubscriptionRow | null;

  return {
    schoolId: school.id,
    memberId: member.id,
    name: school.name,
    slug: school.slug,
    role: member.role,
    access: accessFromSubscription(sub),
    plan: sub?.plan ?? "trial",
    status: sub?.status ?? "canceled",
    seats: sub?.seats ?? 1,
    trialEndsAt: sub?.trial_ends_at ?? null,
    cancelAtPeriodEnd: sub?.cancel_at_period_end ?? false,
    currentPeriodEnd: sub?.current_period_end ?? null,
    partnerSchoolId: school.partner_school_id,
    seatsUsed: seatResult.count ?? 0,
    timezone: school.timezone || "Africa/Johannesburg",
    defaultLessonMinutes: school.default_lesson_minutes ?? 60,
  };
}

/**
 * The guard every school server action calls first.
 *
 * Returns the context or a reason. Actions check this themselves rather than
 * trusting the layout that drew the form — the same rule the admin actions
 * follow, for the same reason: a server action is a public POST endpoint
 * wearing a form's clothes.
 */
export async function requireSchool(options?: {
  roles?: SchoolRole[];
  write?: boolean;
}): Promise<{ ok: true; school: SchoolContext } | { ok: false; message: string }> {
  const school = await currentSchool();
  if (!school) return { ok: false, message: "You are not signed in to a school." };
  if (options?.roles && !options.roles.includes(school.role)) {
    const onlyOwner = options.roles.length === 1 && options.roles[0] === "owner";
    return {
      ok: false,
      message: onlyOwner
        ? "Only the school owner can do that."
        : "Only the owner or office staff can do that.",
    };
  }
  if (options?.write && school.access !== "full") {
    return {
      ok: false,
      message: "Your subscription has lapsed, so the workspace is read-only. Reactivate it in Settings.",
    };
  }
  return { ok: true, school };
}
