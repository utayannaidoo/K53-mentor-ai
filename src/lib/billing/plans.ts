import type { SubscriptionTier } from "@/types";

export type FeatureKey = "tutor" | "scenarios" | "licencePrep" | "advancedAnalytics";
export type CapKey = "flashcardsPerDay" | "questionsPerDay" | "tutorPerDay";

export interface PlanDef {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  priceMonthly: number; // ZAR
  priceAnnual: number; // ZAR
  highlighted?: boolean;
  features: Record<FeatureKey, boolean>;
  caps: Record<CapKey, number>; // Infinity = unlimited
  perks: string[];
}

export const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Find out exactly where you stand.",
    priceMonthly: 0,
    priceAnnual: 0,
    features: { tutor: true, scenarios: false, licencePrep: false, advancedAnalytics: false },
    caps: { flashcardsPerDay: 12, questionsPerDay: 15, tutorPerDay: 3 },
    perks: [
      "Full AI diagnostic + readiness score",
      "12 flashcards & 15 questions a day",
      "3 AI tutor messages a day",
      "1 full mock exam",
      "7-day progress history",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Everything you need to pass your learner's licence.",
    priceMonthly: 79,
    priceAnnual: 599,
    highlighted: true,
    features: { tutor: true, scenarios: true, licencePrep: false, advancedAnalytics: false },
    caps: { flashcardsPerDay: Infinity, questionsPerDay: Infinity, tutorPerDay: 40 },
    perks: [
      "Unlimited flashcards & questions",
      "Full scenario library",
      "AI tutor (40 messages/day)",
      "Unlimited mock exams",
      "Personalised daily study plan",
      "Full progress history",
    ],
  },
  {
    id: "premium_plus",
    name: "Premium Plus",
    tagline: "Learner's and driver's licence, end to end.",
    priceMonthly: 149,
    priceAnnual: 1199,
    features: { tutor: true, scenarios: true, licencePrep: true, advancedAnalytics: true },
    caps: { flashcardsPerDay: Infinity, questionsPerDay: Infinity, tutorPerDay: Infinity },
    perks: [
      "Everything in Premium",
      "Driver's licence yard-test modules",
      "Unlimited AI tutor",
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

export const ANNUAL_DISCOUNT = (plan: PlanDef) =>
  plan.priceMonthly === 0
    ? 0
    : Math.round((1 - plan.priceAnnual / (plan.priceMonthly * 12)) * 100);
