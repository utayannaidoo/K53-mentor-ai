import type { VehicleCode } from "@/types";

/**
 * Content gating by vehicle code. Items with no `codes` are universal (they
 * apply to every licence — shared signs, rules, etc.); items that list codes
 * only show to a learner whose selected code is in that list. A missing user
 * code (not yet onboarded) sees everything.
 */
export function appliesToCode(
  codes: VehicleCode[] | undefined,
  code: VehicleCode | undefined,
): boolean {
  if (!codes || codes.length === 0) return true;
  if (!code) return true;
  return codes.includes(code);
}

export function forCode<T extends { codes?: VehicleCode[] }>(
  items: T[],
  code: VehicleCode | undefined,
): T[] {
  return items.filter((item) => appliesToCode(item.codes, code));
}
