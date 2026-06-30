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
 * only show to a learner whose code is in the same group as one of them. A
 * missing user code (not yet onboarded) sees everything.
 */
export function appliesToCode(
  codes: VehicleCode[] | undefined,
  code: VehicleCode | undefined,
): boolean {
  if (!codes || codes.length === 0) return true;
  if (!code) return true;
  return codes.some((c) => sameGroup(c, code));
}

export function forCode<T extends { codes?: VehicleCode[] }>(
  items: T[],
  code: VehicleCode | undefined,
): T[] {
  return items.filter((item) => appliesToCode(item.codes, code));
}
