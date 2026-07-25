import type { VehicleCode } from "@/types";

/** Content groups. A1/A are one motorcycle group; 10/14 are one heavy group. */
const GROUP: Record<VehicleCode, "car" | "motorcycle" | "heavy"> = {
  "8": "car",
  A1: "motorcycle",
  A: "motorcycle",
  "10": "heavy",
  "14": "heavy",
};

export type VehicleGroup = "car" | "motorcycle" | "heavy";

/** The content group a code belongs to. */
export function groupOf(code: VehicleCode): VehicleGroup {
  return GROUP[code];
}

/** Two codes share content if they're in the same group (A≡A1, 10≡14). */
export function sameGroup(a: VehicleCode, b: VehicleCode): boolean {
  return GROUP[a] === GROUP[b];
}

/**
 * Content gating by vehicle code. Items with no `codes` are universal (they
 * apply to every licence — shared signs, rules, etc.); items that list codes
 * only show to a learner whose code is in the same group as one of them.
 *
 * `code` is deliberately REQUIRED. It used to accept `undefined` and treat it
 * as "show everything", which meant every surface served the full bank —
 * motorcycle and heavy items included — for the window before the account
 * hydrated, and study queues snapshot on first render kept that pool for the
 * whole session. Resolve the code with `studyCodeOf` (lib/billing/plans) first;
 * that clamps it to the paid track and never returns undefined.
 */
export function appliesToCode(codes: VehicleCode[] | undefined, code: VehicleCode): boolean {
  if (!codes || codes.length === 0) return true;
  return codes.some((c) => sameGroup(c, code));
}

export function forCode<T extends { codes?: VehicleCode[] }>(
  items: T[],
  code: VehicleCode,
): T[] {
  return items.filter((item) => appliesToCode(item.codes, code));
}
