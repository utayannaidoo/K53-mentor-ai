import type { SupabaseClient, User } from "@supabase/supabase-js";
import type {
  LicenceResult,
  OnboardingData,
  Profile,
  Streak,
  SubscriptionTier,
  UserState,
} from "@/types";

/**
 * Account-tier sync between the study store and Supabase: the durable identity
 * data (profile, onboarding answers, subscription tier, streak). Per-activity
 * progress (attempts, flashcard SRS, mock exams, tutor threads) still lives in
 * the local store and is not yet mirrored here — see SESSION notes.
 */

type AccountData = Pick<
  UserState,
  "profile" | "onboarding" | "tier" | "streak" | "cp" | "licence"
>;

interface ProfileRow {
  full_name: string | null;
  email: string | null;
  goal: OnboardingData["goal"] | null;
  vehicle_code: OnboardingData["vehicleCode"] | null;
  test_date: string | null;
  drivers_test_date: string | null;
  confidence: OnboardingData["confidence"] | null;
  worry_categories: OnboardingData["worryCategories"] | null;
  knowledge_level: OnboardingData["knowledgeLevel"] | null;
  study_frequency: OnboardingData["studyFrequency"] | null;
  prior_attempts: number | null;
  onboarded_at: string | null;
  created_at: string | null;
  // Added in 0024. Absent on a database that has not run it yet, which is
  // exactly why the read below is a `select("*")`.
  licence_result: LicenceResult["result"] | null;
  licence_result_at: string | null;
  licence_result_test_date: string | null;
  drivers_result: LicenceResult["result"] | null;
  drivers_result_at: string | null;
  drivers_result_test_date: string | null;
}

/**
 * One test's stored outcome, or nothing.
 *
 * A result with no date behind it is not usable — the prompt keys off the
 * booking it answers — so an incomplete pair reads as "never answered" and the
 * learner is asked again rather than silently locked out of the question.
 */
function licenceFrom(
  result: LicenceResult["result"] | null | undefined,
  at: string | null | undefined,
  testDate: string | null | undefined,
): LicenceResult | null {
  if (!result || !testDate) return null;
  return { result, at: at ?? testDate, testDate };
}

interface StreakRow {
  current: number | null;
  longest: number | null;
  last_study_date: string | null;
  freezes_remaining: number | null;
  freeze_refreshed_week: string | null;
  // Added in 0025 — one regain per streak run (see Streak.regainsUsed).
  regains_used: number | null;
  cp: number | null;
}

/** Read the signed-in user's account rows and map them into store shape. */
export async function loadAccount(
  supabase: SupabaseClient,
  user: User,
): Promise<Partial<AccountData>> {
  const [profileRes, subRes, streakRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    // `select("*")`, not a named column list: naming a column the database
    // doesn't have yet makes PostgREST fail the whole query, and a failed
    // subscription read resolves to tier "free" — which would downgrade every
    // paying subscriber on a deploy that raced a migration.
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("streaks").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const p = profileRes.data as ProfileRow | null;
  const metaName =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";

  const profile: Profile = {
    id: user.id,
    name: p?.full_name || metaName || "Learner",
    email: p?.email || user.email || "",
    createdAt: p?.created_at || new Date().toISOString(),
  };

  const onboarding: OnboardingData | null =
    p && p.onboarded_at
      ? {
          goal: p.goal ?? "learners",
          vehicleCode: p.vehicle_code ?? "8",
          testDate: p.test_date,
          driversTestDate: p.drivers_test_date,
          confidence: p.confidence ?? 3,
          worryCategories: p.worry_categories ?? [],
          knowledgeLevel: p.knowledge_level ?? "some",
          studyFrequency: p.study_frequency ?? "steady",
          priorAttempts: p.prior_attempts ?? 0,
          completedAt: p.onboarded_at,
        }
      : null;

  const tier = ((subRes.data as { tier: SubscriptionTier } | null)?.tier ?? "free") as SubscriptionTier;

  const learners = licenceFrom(p?.licence_result, p?.licence_result_at, p?.licence_result_test_date);
  const drivers = licenceFrom(p?.drivers_result, p?.drivers_result_at, p?.drivers_result_test_date);
  const licence: UserState["licence"] = {
    ...(learners ? { learners } : {}),
    ...(drivers ? { drivers } : {}),
  };

  const st = streakRes.data as StreakRow | null;
  const result: Partial<AccountData> = { profile, onboarding, tier, licence };
  if (st) {
    result.streak = {
      current: st.current ?? 0,
      longest: st.longest ?? 0,
      lastStudyDate: st.last_study_date,
      freezesRemaining: st.freezes_remaining ?? 1,
      freezeRefreshedWeek: st.freeze_refreshed_week,
      regainsUsed: st.regains_used ?? 0,
    } satisfies Streak;
    if (st.cp != null) result.cp = st.cp;
  }
  return result;
}

/**
 * Snapshot of the client-side SM-2 schedule, synced onto the streaks row so
 * the notification cron can send due-review reminders without the full card
 * state. Refreshed on every study action (the streak object changes identity,
 * which re-triggers the debounced sync).
 */
function dueSummary(state: UserState, now = new Date()): { due_cards: number; next_due_at: string | null } {
  const studied = Object.values(state.cardStates).filter((c) => c.reps > 0 || c.lapses > 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const dueCards = studied.filter((c) => new Date(c.due) <= endOfToday).length;
  const nextDue = studied.length
    ? studied.reduce((min, c) => (c.due < min ? c.due : min), studied[0].due)
    : null;
  return { due_cards: dueCards, next_due_at: nextDue };
}

/**
 * Upsert the store's account-tier data back to Supabase for the signed-in user.
 *
 * Refuses to write when the local state doesn't belong to the signed-in user.
 * Local state is a browser-wide cache, so during an account switch (or when a
 * second tab pushes its own state through the `storage` event) it can briefly
 * hold a DIFFERENT learner's profile. Writing then upserts that learner's
 * name, email and licence code over this account's row — which is how one
 * account's profile ended up carrying another's licence code permanently.
 * `pushProgress` has always had this guard; this is its counterpart.
 */
export async function saveAccount(supabase: SupabaseClient, state: UserState): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  if (!state.profile || state.profile.id !== user.id) return;

  const o = state.onboarding;
  // Note: the subscription tier is deliberately NOT written here. Tier is
  // server-managed (Paystack webhook / signup trigger), and RLS blocks client
  // writes to subscriptions so a user can't self-grant a paid plan.
  await Promise.all([
    supabase.from("profiles").upsert({
      id: user.id,
      full_name: state.profile?.name ?? "",
      email: state.profile?.email ?? user.email ?? null,
      ...(o
        ? {
            goal: o.goal,
            // The learner's own choice, straight through. The owner check
            // above is what stops another account's code landing here.
            vehicle_code: o.vehicleCode,
            test_date: o.testDate,
            drivers_test_date: o.driversTestDate,
            confidence: o.confidence,
            worry_categories: o.worryCategories,
            knowledge_level: o.knowledgeLevel,
            study_frequency: o.studyFrequency,
            prior_attempts: o.priorAttempts,
            onboarded_at: o.completedAt,
          }
        : {}),
      // Each pair is only sent once that test has a result. These columns
      // arrived in 0024, and PostgREST fails the whole statement on an unknown
      // column — so omitting them by default keeps this upsert byte-identical
      // to the pre-0024 one for every learner who has not answered, and a
      // deploy that lands ahead of its migration cannot take the profile sync
      // down with it.
      ...(state.licence.learners
        ? {
            licence_result: state.licence.learners.result,
            licence_result_at: state.licence.learners.at,
            licence_result_test_date: state.licence.learners.testDate,
          }
        : {}),
      ...(state.licence.drivers
        ? {
            drivers_result: state.licence.drivers.result,
            drivers_result_at: state.licence.drivers.at,
            drivers_result_test_date: state.licence.drivers.testDate,
          }
        : {}),
      last_active_at: new Date().toISOString(),
    }),
    supabase.from("streaks").upsert(
      {
        user_id: user.id,
        current: state.streak.current,
        longest: state.streak.longest,
        last_study_date: state.streak.lastStudyDate,
        freezes_remaining: state.streak.freezesRemaining,
        freeze_refreshed_week: state.streak.freezeRefreshedWeek,
        // Unlike the licence columns above, this one moves in BOTH directions
        // (spent → refunded when a run ends), so it cannot be conditionally
        // omitted — a skipped write would leave a stale 1 on the server and
        // silently consume the next run's regain. It therefore assumes 0025
        // has run; until then the streaks upsert fails harmlessly (Supabase
        // returns an error rather than throwing, and the local cache keeps
        // the truth) and retries on every later flush.
        regains_used: state.streak.regainsUsed,
        cp: state.cp,
        ...dueSummary(state),
      },
      { onConflict: "user_id" },
    ),
  ]);
}
