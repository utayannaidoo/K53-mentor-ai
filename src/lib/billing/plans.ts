import type { SubscriptionTier, VehicleCode, VehicleClass } from "@/types";

export type FeatureKey = "tutor" | "scenarios" | "licencePrep" | "advancedAnalytics";
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

/** Annual billing takes this many Rand off the monthly price of every paid plan. */
export const ANNUAL_MONTHLY_SAVING = 20;

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
    features: { tutor: true, scenarios: false, licencePrep: false, advancedAnalytics: false },
    caps: { flashcardsPerDay: 12, questionsPerDay: 15, tutorPerDay: 3 },
    limits: {
      reset: "trial",
      diagnostic: "full",
      flashcards: 12,
      questions: 15,
      scenarios: false,
      tutorMessages: 3,
      tutorTopUp: false,
      mockExams: 1,
      mockLength: "short",
      studyPlan: false,
      progressHistory: "7d",
    },
    perks: [
      "Full AI diagnostic + readiness score",
      "12 flashcards & 15 questions (once-off)",
      "3 AI tutor messages",
      "One short mock exam",
      "7-day progress history",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Focused daily practice to pass your learner's.",
    highlighted: true,
    monthly: { car: 60, bike_heavy: 50 },
    features: { tutor: true, scenarios: true, licencePrep: false, advancedAnalytics: false },
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
      mockLength: "full",
      studyPlan: true,
      progressHistory: "full",
    },
    perks: [
      "3 full flashcard & question sessions a day",
      "Full scenarios — a few a day",
      "AI tutor — 15 messages a day",
      "Up to 3 mock exams a day",
      "Personalised daily study plan",
      "Full progress history",
    ],
  },
  {
    id: "premium_plus",
    name: "Premium Plus",
    tagline: "Everything unlimited — learner's and driver's, end to end.",
    monthly: { car: 70, bike_heavy: 60 },
    features: { tutor: true, scenarios: true, licencePrep: true, advancedAnalytics: true },
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
