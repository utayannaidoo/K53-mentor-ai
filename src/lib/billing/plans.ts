import type { SubscriptionTier, VehicleCode, VehicleClass } from "@/types";

export type FeatureKey = "tutor" | "scenarios" | "licencePrep" | "advancedAnalytics" | "scanner";
export type CapKey = "flashcardsPerDay" | "questionsPerDay" | "tutorPerDay";

export type { VehicleClass };

/** Derive the subscription track from a raw code. */
export function vehicleClass(code: VehicleCode): VehicleClass {
  return code === "8" ? "car" : "bike_heavy";
}

export const VEHICLE_CLASS_LABEL: Record<VehicleClass, string> = {
  car: "Car · Code 8",
  bike_heavy: "Motorbike & Heavy · A1 / A / 10 / 14",
};

export const VEHICLE_CLASS_SHORT: Record<VehicleClass, string> = {
  car: "Car",
  bike_heavy: "Bike & Heavy",
};

/**
 * The codes a subscription track unlocks — the single source of truth for
 * every picker that offers codes. A null track (nothing chosen/paid yet)
 * offers everything; the first pick then sets the track.
 */
export function codesForClass(vc: VehicleClass | null): VehicleCode[] {
  if (vc === "car") return ["8"];
  if (vc === "bike_heavy") return ["A", "14"];
  return ["8", "A", "14"];
}

/** Whether a track's subscription covers a given code. */
export function classAllowsCode(vc: VehicleClass | null, code: VehicleCode): boolean {
  return vc === null || vehicleClass(code) === vc;
}

/**
 * The codes a user may switch between in-app. A free learner isn't scoped to
 * any paid track, so they can freely study any code; a paid subscriber is
 * scoped to the track they bought (switching track is a plan change on the
 * billing page, never a silent profile edit).
 */
export function selectableCodes(
  tier: SubscriptionTier,
  vc: VehicleClass | null,
): VehicleCode[] {
  return tier === "free" ? ["8", "A", "14"] : codesForClass(vc);
}

/** Annual billing takes this many Rand off the monthly price of every paid plan. */
export const ANNUAL_MONTHLY_SAVING = 20;

/** Messages in one tutor top-up pack (Premium Plus, one-off purchase). */
export const TUTOR_TOPUP_CREDITS = 20;
/** Price of a top-up pack (ZAR) — a one-off charge, not a Paystack Plan. */
export const TUTOR_TOPUP_PRICE = 10;

/** Items in one full flashcard or question session. */
export const STUDY_SESSION_SIZE = 12;
/** Premium gets this many full flashcard + question sessions a day. */
export const PREMIUM_SESSIONS_PER_DAY = 3;
const PREMIUM_DAILY_ITEMS = STUDY_SESSION_SIZE * PREMIUM_SESSIONS_PER_DAY; // 36

/** Monthly price (ZAR) per vehicle class. */
interface ClassPrice {
  car: number;
  bike_heavy: number;
}

/**
 * The richer per-tier limit model behind the new plan structure. `caps` below
 * is kept as the legacy numeric view consumed by the study surfaces; `limits`
 * is the source of truth the new enforcement + UI read from.
 */
export interface PlanLimits {
  /** Free is a one-off onboarding trial; paid plans reset daily. */
  reset: "trial" | "daily";
  diagnostic: "full";
  /** A daily/once-off item count, or unlimited. */
  flashcards: number | "unlimited";
  questions: number | "unlimited";
  /** false = not included, a number = per-day allowance, or unlimited. */
  scenarios: number | "unlimited" | false;
  tutorMessages: number | "unlimited";
  /** Premium Plus: buy extra tutor messages beyond the daily allowance. */
  tutorTopUp: boolean;
  mockExams: number | "unlimited";
  /** 15-question mini mocks (free: lifetime, paid: per day). */
  miniMocks: number | "unlimited";
  /** Single-section timed drills at real pass marks (free: lifetime, paid: per day). */
  sectionDrills: number | "unlimited";
  mockLength: "short" | "full";
  studyPlan: boolean;
  progressHistory: "7d" | "full";
}

export interface PlanDef {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  highlighted?: boolean;
  /** Monthly price per vehicle class (ZAR). Free is 0 for both. */
  monthly: ClassPrice;
  features: Record<FeatureKey, boolean>;
  caps: Record<CapKey, number>; // Infinity = unlimited (legacy view)
  limits: PlanLimits;
  perks: string[];
}

export const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Free",
    tagline: "A one-day onboarding — see exactly where you stand.",
    monthly: { car: 0, bike_heavy: 0 },
    features: { tutor: true, scenarios: false, licencePrep: false, advancedAnalytics: false, scanner: false },
    caps: { flashcardsPerDay: 12, questionsPerDay: 15, tutorPerDay: 3 },
    limits: {
      reset: "trial",
      diagnostic: "full",
      flashcards: 12,
      questions: 15,
      scenarios: false,
      tutorMessages: 3,
      tutorTopUp: false,
      mockExams: 0, // full mock is a paid feature
      miniMocks: 1, // one lifetime mini mock to taste the pressure
      sectionDrills: 1, // one lifetime section drill, same taste-then-pay pattern
      mockLength: "short",
      studyPlan: false,
      progressHistory: "7d",
    },
    perks: [
      "Full AI diagnostic + readiness score",
      "12 flashcards & 15 questions (once-off)",
      "3 AI tutor messages",
      "One 15-question mini mock",
      "7-day progress history",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Focused daily practice to pass your learner's.",
    highlighted: true,
    monthly: { car: 60, bike_heavy: 50 },
    features: { tutor: true, scenarios: true, licencePrep: false, advancedAnalytics: false, scanner: true },
    caps: {
      flashcardsPerDay: PREMIUM_DAILY_ITEMS,
      questionsPerDay: PREMIUM_DAILY_ITEMS,
      tutorPerDay: 15,
    },
    limits: {
      reset: "daily",
      diagnostic: "full",
      flashcards: PREMIUM_DAILY_ITEMS,
      questions: PREMIUM_DAILY_ITEMS,
      scenarios: 3,
      tutorMessages: 15,
      tutorTopUp: false,
      mockExams: 3,
      miniMocks: 5,
      sectionDrills: 5,
      mockLength: "full",
      studyPlan: true,
      progressHistory: "full",
    },
    perks: [
      "3 full flashcard & question sessions a day",
      "Full scenarios — a few a day",
      "AI tutor — 15 messages a day",
      "3 full mocks + 5 mini mocks & section drills a day",
      "Personalised daily study plan",
      "Full progress history",
    ],
  },
  {
    id: "premium_plus",
    name: "Premium Plus",
    tagline: "Everything unlimited — learner's and driver's, end to end.",
    monthly: { car: 70, bike_heavy: 60 },
    features: { tutor: true, scenarios: true, licencePrep: true, advancedAnalytics: true, scanner: true },
    caps: { flashcardsPerDay: Infinity, questionsPerDay: Infinity, tutorPerDay: 40 },
    limits: {
      reset: "daily",
      diagnostic: "full",
      flashcards: "unlimited",
      questions: "unlimited",
      scenarios: "unlimited",
      tutorMessages: 40,
      tutorTopUp: true,
      mockExams: "unlimited",
      miniMocks: "unlimited",
      sectionDrills: "unlimited",
      mockLength: "full",
      studyPlan: true,
      progressHistory: "full",
    },
    perks: [
      "Unlimited flashcards, questions & scenarios",
      "AI tutor — 40 messages a day (cheap top-ups available)",
      "Unlimited mock exams",
      "Driver's-licence yard-test modules",
      "Advanced analytics & trends",
      "Priority new-content access",
    ],
  },
];

export const PLAN_MAP: Record<SubscriptionTier, PlanDef> = Object.fromEntries(
  PLANS.map((p) => [p.id, p]),
) as Record<SubscriptionTier, PlanDef>;

export function hasFeature(tier: SubscriptionTier, feature: FeatureKey): boolean {
  return PLAN_MAP[tier].features[feature];
}

export function dailyCap(tier: SubscriptionTier, cap: CapKey): number {
  return PLAN_MAP[tier].caps[cap];
}

/** The lowest tier that unlocks a given feature — used in upgrade prompts. */
export function tierForFeature(feature: FeatureKey): SubscriptionTier {
  return (PLANS.find((p) => p.features[feature])?.id ?? "premium") as SubscriptionTier;
}

/** Monthly price for a plan in a given vehicle class. */
export function monthlyPrice(plan: PlanDef, vc: VehicleClass): number {
  return plan.monthly[vc];
}

/** Effective monthly price when billed annually (flat −R20/mo on paid plans). */
export function annualMonthlyPrice(plan: PlanDef, vc: VehicleClass): number {
  const m = plan.monthly[vc];
  return m === 0 ? 0 : Math.max(0, m - ANNUAL_MONTHLY_SAVING);
}

/** Total charged once per year when billed annually. */
export function annualPrice(plan: PlanDef, vc: VehicleClass): number {
  return annualMonthlyPrice(plan, vc) * 12;
}

export function isFreePlan(plan: PlanDef): boolean {
  return plan.monthly.car === 0 && plan.monthly.bike_heavy === 0;
}
