/**
 * K53 Mentor for Schools — the plan catalogue.
 *
 * The single source of truth for what the school product costs and what each
 * plan includes. The marketing page, the trial a new school starts on, and
 * (in a later slice) checkout all read from here, so a price or a seat count
 * can never say one thing on the page and another at the till.
 *
 * Priced per instructor band rather than per learner: instructors are the
 * capacity a driving school actually has, and the number an owner already
 * thinks in. Learners, lessons and vehicles are unlimited on every plan.
 * Banded rather than per-seat because a Paystack Plan carries a fixed amount.
 *
 * Kept separate from src/lib/billing/plans.ts on purpose: that catalogue is
 * the learner app's, and the two products never share a tier.
 */

export type SchoolPlanId = "solo" | "team" | "fleet";

export interface SchoolPlan {
  id: SchoolPlanId;
  name: string;
  /** Most owner + instructor members this plan covers. */
  seats: number;
  /** The smallest team the plan is meant for, for the "2–5 instructors" label. */
  minSeats: number;
  monthlyZar: number;
  blurb: string;
}

export const SCHOOL_PLANS: SchoolPlan[] = [
  {
    id: "solo",
    name: "Solo",
    seats: 1,
    minSeats: 1,
    monthlyZar: 199,
    blurb: "One instructor running their own diary.",
  },
  {
    id: "team",
    name: "School",
    seats: 5,
    minSeats: 2,
    monthlyZar: 499,
    blurb: "A small school with a few instructors and cars.",
  },
  {
    id: "fleet",
    name: "Academy",
    seats: 15,
    minSeats: 6,
    monthlyZar: 999,
    blurb: "A busy academy with a full team.",
  },
];

export const SCHOOL_PLAN_MAP: Record<SchoolPlanId, SchoolPlan> = Object.fromEntries(
  SCHOOL_PLANS.map((p) => [p.id, p]),
) as Record<SchoolPlanId, SchoolPlan>;

/** Annual billing charges ten months for twelve. */
export const SCHOOL_ANNUAL_MONTHS_CHARGED = 10;

export function schoolAnnualZar(plan: SchoolPlan): number {
  return plan.monthlyZar * SCHOOL_ANNUAL_MONTHS_CHARGED;
}

/**
 * Longer than the learner app's trial on purpose: a school needs to see a
 * whole month of its own diary and money before it can judge the product.
 */
export const SCHOOL_TRIAL_DAYS = 30;

/**
 * During the trial a school can invite its whole team — at one seat the owner
 * fills it and cannot try the team features at all. The largest band.
 */
export const SCHOOL_TRIAL_SEATS = 15;

/** "1 instructor", "2–5 instructors", "6–15 instructors". */
export function seatLabel(plan: SchoolPlan): string {
  if (plan.seats === 1) return "1 instructor";
  return `${plan.minSeats}–${plan.seats} instructors`;
}
