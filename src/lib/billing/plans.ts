import type { SubscriptionTier, UserState, VehicleCode } from "@/types";

// Kept as re-exports for existing plan consumers. The definitions and shared
// buyer-facing wording live in refund-policy.ts.
export { MONEY_BACK_DAYS, REFUND_PROCESSING_DAYS } from "@/lib/billing/refund-policy";

export type FeatureKey = "tutor" | "scenarios" | "licencePrep" | "advancedAnalytics" | "scanner";
export type CapKey = "flashcardsPerDay" | "questionsPerDay" | "tutorPerDay";

/**
 * Every licence code the app teaches. One plan covers all of them — the code
 * is a study preference, not something you buy, so this is simply the list
 * every picker offers. (A1/A share the motorcycle content; 10/14 share the
 * heavy content, so the picker offers one representative of each group.)
 */
export const SELECTABLE_CODES: VehicleCode[] = ["8", "A", "14"];

export const CODE_LABEL: Record<VehicleCode, string> = {
  "8": "Car · Code 08 (B)",
  A1: "Motorcycle · Code A1",
  A: "Motorcycle · Code A / A1",
  "10": "Heavy · Code 10",
  "14": "Heavy · Code 10 / 14",
};

/**
 * The licence code every study surface gates its content by.
 *
 * There is exactly one source of truth for it — the learner's own choice, in
 * `onboarding.vehicleCode`, loaded from `profiles.vehicle_code` on sign-in.
 * Nothing else may override it: not the plan, not a cached value from another
 * account on this device.
 *
 * It never returns undefined. `forCode` used to treat an unresolved code as
 * "show everything", which leaked motorcycle and heavy content to car
 * learners during the window before the account hydrated; falling back to
 * Code 8 narrows instead of opening up.
 */
export function studyCodeOf(state: Pick<UserState, "onboarding">): VehicleCode {
  return state.onboarding?.vehicleCode ?? "8";
}

/** Annual billing takes this many Rand off the monthly price of every paid plan. */
export const ANNUAL_MONTHLY_SAVING = 20;

/** Messages in one tutor top-up pack (Premium Plus, one-off purchase). */
export const TUTOR_TOPUP_CREDITS = 20;
/** Price of a top-up pack (ZAR) — a one-off charge, not a Paystack Plan. */
export const TUTOR_TOPUP_PRICE = 10;

/** Items in one full flashcard or question session. */
export const STUDY_SESSION_SIZE = 12;

/**
 * Per-tier limits. Everything that is not AI is free and unlimited on every
 * plan — the free tier is paid for by ads, not by a trial clock or daily caps.
 * What a subscription buys is the AI (tutor, sign scanner) and no ads, so the
 * only numbers that differ between tiers are the AI allowances.
 */
export interface PlanLimits {
  /** Study allowances refill daily. */
  reset: "daily";
  diagnostic: "full";
  /** A per-day item count, or unlimited. */
  flashcards: number | "unlimited";
  questions: number | "unlimited";
  /** false = not included, a number = per-day allowance, or unlimited. */
  scenarios: number | "unlimited" | false;
  /** AI tutor messages a day. 0 = the tutor is not part of this plan. */
  tutorMessages: number | "unlimited";
  /** Premium Plus: buy extra tutor messages beyond the daily allowance. */
  tutorTopUp: boolean;
  mockExams: number | "unlimited";
  /** 15-question mini mocks, per day. */
  miniMocks: number | "unlimited";
  /** Single-section timed drills at real pass marks, per day. */
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
  /**
   * Monthly price (ZAR). One price per tier — the plan covers every licence
   * code, so nothing here depends on which vehicle the learner is studying.
   */
  monthly: number;
  /** Whether this plan is ad-supported. Paying for any plan removes ads. */
  ads: boolean;
  features: Record<FeatureKey, boolean>;
  caps: Record<CapKey, number>; // Infinity = unlimited (legacy view)
  limits: PlanLimits;
  perks: string[];
}

/** The study allowances every plan shares: all of it, with no daily meter. */
const FULL_STUDY = {
  reset: "daily",
  diagnostic: "full",
  flashcards: "unlimited",
  questions: "unlimited",
  scenarios: "unlimited",
  mockExams: "unlimited",
  miniMocks: "unlimited",
  sectionDrills: "unlimited",
  mockLength: "full",
  studyPlan: true,
  progressHistory: "full",
} as const;

export const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Free",
    tagline: "The whole K53 study app, free. Supported by ads.",
    monthly: 0,
    ads: true,
    // `tutor` and `scanner` are the AI features — the only things a plan buys
    // besides removing ads. Everything else is on for everyone.
    features: { tutor: false, scenarios: true, licencePrep: true, advancedAnalytics: true, scanner: false },
    caps: { flashcardsPerDay: Infinity, questionsPerDay: Infinity, tutorPerDay: 0 },
    limits: { ...FULL_STUDY, tutorMessages: 0, tutorTopUp: false },
    perks: [
      "Every question, flashcard & scenario — unlimited",
      "Unlimited full mock exams, mini mocks & section drills",
      "Readiness score, daily study plan & full progress history",
      "Driver's-licence yard-test modules",
      "Shows ads",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "No ads, and an AI tutor whenever you're stuck.",
    highlighted: true,
    monthly: 60,
    ads: false,
    features: { tutor: true, scenarios: true, licencePrep: true, advancedAnalytics: true, scanner: true },
    caps: { flashcardsPerDay: Infinity, questionsPerDay: Infinity, tutorPerDay: 15 },
    limits: { ...FULL_STUDY, tutorMessages: 15, tutorTopUp: false },
    perks: [
      "Everything in Free",
      "No ads, anywhere",
      "AI tutor — 15 messages a day",
      "AI road-sign scanner",
    ],
  },
  {
    id: "premium_plus",
    name: "Premium Plus",
    tagline: "No ads, and the most AI tutor time.",
    monthly: 70,
    ads: false,
    features: { tutor: true, scenarios: true, licencePrep: true, advancedAnalytics: true, scanner: true },
    caps: { flashcardsPerDay: Infinity, questionsPerDay: Infinity, tutorPerDay: 35 },
    limits: { ...FULL_STUDY, tutorMessages: 35, tutorTopUp: true },
    perks: [
      "Everything in Premium",
      "AI tutor — 35 messages a day (cheap top-ups available)",
      "More AI sign scans a day",
    ],
  },
];

export const PLAN_MAP: Record<SubscriptionTier, PlanDef> = Object.fromEntries(
  PLANS.map((p) => [p.id, p]),
) as Record<SubscriptionTier, PlanDef>;

export function hasFeature(tier: SubscriptionTier, feature: FeatureKey): boolean {
  return PLAN_MAP[tier].features[feature];
}

/**
 * Whether this tier has paid for anything at all.
 *
 * Deliberately not expressed as a FeatureKey — no single feature flag means
 * "has paid", and reaching for one as a proxy drifts the moment a flag moves.
 */
export function isPaidTier(tier: SubscriptionTier): boolean {
  return tier !== "free";
}

/**
 * Whether this tier is shown ads. Display state only, like every client gate:
 * a tampered tier hides an ad slot, it does not unlock anything that costs
 * money.
 */
export function showsAds(tier: SubscriptionTier): boolean {
  return PLAN_MAP[tier].ads;
}

export function dailyCap(tier: SubscriptionTier, cap: CapKey): number {
  return PLAN_MAP[tier].caps[cap];
}

/** The lowest tier that unlocks a given feature — used in upgrade prompts. */
export function tierForFeature(feature: FeatureKey): SubscriptionTier {
  return (PLANS.find((p) => p.features[feature])?.id ?? "premium") as SubscriptionTier;
}

/** Monthly price for a plan. */
export function monthlyPrice(plan: PlanDef): number {
  return plan.monthly;
}

/** Effective monthly price when billed annually (flat −R20/mo on paid plans). */
export function annualMonthlyPrice(plan: PlanDef): number {
  return plan.monthly === 0 ? 0 : Math.max(0, plan.monthly - ANNUAL_MONTHLY_SAVING);
}

/** Total charged once per year when billed annually. */
export function annualPrice(plan: PlanDef): number {
  return annualMonthlyPrice(plan) * 12;
}

export function isFreePlan(plan: PlanDef): boolean {
  return plan.monthly === 0;
}
