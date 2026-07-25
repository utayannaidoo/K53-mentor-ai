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

/** The group used when a stored code can't be recognised. */
export const DEFAULT_VEHICLE_GROUP: VehicleGroup = "car";

/**
 * The content group a code belongs to.
 *
 * Falls back to "car" for anything unrecognised. The code is read back out of
 * `k53mentor.state.v1` in the browser, so it isn't guaranteed to be one of the
 * current `VehicleCode` values however well-typed the call sites are — a state
 * blob written by an older build (or hand-edited) can carry a retired code
 * such as "B". Returning undefined here propagated into an icon-map lookup in
 * the app shell, which rendered `undefined` as a component; that throws and
 * white-screens the whole authed app behind the error boundary, with no
 * recovery short of clearing site data.
 */
export function groupOf(code: VehicleCode): VehicleGroup {
  return GROUP[code] ?? DEFAULT_VEHICLE_GROUP;
}

/**
 * Two codes share content if they're in the same group (A≡A1, 10≡14).
 * Routed through `groupOf` so an unrecognised code resolves to a real group —
 * comparing the raw map gave `undefined === undefined`, which made a stale code
 * match *every* group instead of none.
 */
export function sameGroup(a: VehicleCode, b: VehicleCode): boolean {
  return groupOf(a) === groupOf(b);
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
