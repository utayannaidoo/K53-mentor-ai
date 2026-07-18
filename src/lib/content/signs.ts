import type { RoadSign, SignCategory } from "@/types";
import rawCatalog from "./signs.catalog.json";

/**
 * Real South African road signs, extracted from the official K53 manual by
 * scripts/extract_signs.py. The PNG crops live under /public/signs.
 *
 * Auto-extracted meanings are lightly cleaned; the high-traffic and quiz-linked
 * signs in CURATED below get hand-verified names and meanings.
 */
interface RawSign {
  id: string;
  category: SignCategory;
  subcategory: string;
  autoName: string;
  meaning: string;
  image: string;
  page: number;
}

/** Hand-verified names (and corrected meanings) for common / quiz-linked signs. */
const CURATED: Record<string, { name: string; meaning?: string }> = {
  "regulatory-006-01": {
    name: "Stop",
    meaning:
      "Come to a complete stop behind the stop line every time — even if the road is empty — then move off only when it is safe.",
  },
  "regulatory-006-02": {
    name: "Yield",
    meaning:
      "Give way to all cross-traffic and to pedestrians crossing or about to cross. You need not stop if the way is clear, but must be ready to.",
  },
  "regulatory-006-05": {
    name: "Pedestrian crossing (yield)",
    meaning:
      "Give way to any pedestrians on, or about to enter, the pedestrian crossing on your side of the road.",
  },
  "regulatory-007-03": {
    name: "Traffic circle ahead",
    meaning: "A traffic circle (mini-circle or roundabout) is ahead.",
  },
  "regulatory-007-04": {
    name: "Pedestrian priority",
    meaning:
      "The area is set aside for pedestrians. Vehicles may enter only to load/offload or for an emergency, must yield to pedestrians, and may not exceed 15 km/h.",
  },
  "regulatory-008-01": {
    name: "No entry",
    meaning: "No vehicles may enter this road in this direction at any time.",
  },
  "regulatory-008-02": { name: "One-way roadway (left)" },
  "regulatory-008-03": { name: "One-way roadway (right)" },
  "regulatory-009-03": {
    name: "Speed limit",
    meaning:
      "The maximum speed, in km/h, at which you may drive past this sign. Exceeding it is an offence.",
  },
  "regulatory-011-01": { name: "No left turn" },
  "regulatory-011-02": { name: "No right turn" },
  "regulatory-011-05": { name: "No U-turn" },
  "regulatory-011-07": {
    name: "No parking",
    meaning:
      "You may not park here at any time. (Stricter than it sounds — you may briefly stop to load or set down, but not leave the vehicle parked.)",
  },
  "regulatory-012-01": {
    name: "No overtaking",
    meaning:
      "Overtaking other vehicles is prohibited until you pass the sign that ends the restriction.",
  },
  "regulatory-022-01": { name: "Traffic signal — red", meaning: "Steady red: stop and wait." },
  "regulatory-022-03": {
    name: "Traffic signal — amber",
    meaning: "Steady amber: stop, unless you are too close to stop safely.",
  },
  "regulatory-022-04": {
    name: "Traffic signal — green",
    meaning: "Steady green: you may proceed if the way is clear.",
  },
  "warning-027-02": { name: "Gate / railway boom ahead" },
  "warning-027-04": { name: "Steep descent ahead" },
  "warning-027-05": { name: "Steep ascent ahead" },
  "warning-037-01": { name: "Pedestrian crossing ahead" },
  "warning-037-02": { name: "Pedestrians ahead" },
  "warning-037-03": { name: "Children ahead" },
  "warning-037-04": { name: "Cyclists ahead" },
  "warning-040-07": { name: "Railway crossing" },
};

function deriveName(raw: RawSign): string {
  const c = CURATED[raw.id];
  if (c) return c.name;
  let n = (raw.autoName || raw.subcategory || "Road sign").trim();
  n = n.replace(/^To\s+(indicate|prohibit|give|apply|warn)\b/i, (_m, v) =>
    v.toLowerCase() === "prohibit" ? "No" : "",
  );
  n = n.replace(/\s+/g, " ").replace(/[.;:]+$/, "").trim();
  n = n.charAt(0).toUpperCase() + n.slice(1);
  return n.length > 64 ? n.slice(0, 61).trimEnd() + "…" : n || "Road sign";
}

export const SIGNS: RoadSign[] = (rawCatalog as RawSign[]).map((raw) => ({
  id: raw.id,
  category: raw.category,
  subcategory: raw.subcategory,
  name: deriveName(raw),
  meaning: CURATED[raw.id]?.meaning ?? raw.meaning,
  image: raw.image,
  page: raw.page,
}));

export const SIGNS_BY_ID: Record<string, RoadSign> = Object.fromEntries(
  SIGNS.map((s) => [s.id, s]),
);

/**
 * Signs whose *name* is hand-verified above rather than derived from OCR.
 *
 * deriveName() falls back to the manual's caption text, which is frequently a
 * fragment rather than a name ("Or under certain conditions", "Examples",
 * "May not"). Fine as a library label, useless as a quiz answer — so anything
 * that asks the learner to name a sign must draw only from this set.
 */
export const VERIFIED_NAME_IDS: ReadonlySet<string> = new Set(Object.keys(CURATED));

export function hasVerifiedName(sign: { id: string }): boolean {
  return VERIFIED_NAME_IDS.has(sign.id);
}

export function signsByCategory(category: SignCategory): RoadSign[] {
  return SIGNS.filter((s) => s.category === category);
}

/** Library display order + copy for each top-level sign group. */
export const SIGN_CATEGORIES: {
  id: SignCategory;
  label: string;
  blurb: string;
  icon: string;
}[] = [
  {
    id: "regulatory",
    label: "Regulatory",
    blurb: "Orders you must obey — stop, yield, no-entry, speed limits, no-overtaking.",
    icon: "Octagon",
  },
  {
    id: "warning",
    label: "Warning",
    blurb: "Triangular signs that warn of a hazard or change in the road ahead.",
    icon: "TriangleAlert",
  },
  {
    id: "information",
    label: "Information",
    blurb: "Help you read the road ahead and plan your lane use.",
    icon: "Info",
  },
  {
    id: "guidance",
    label: "Guidance",
    blurb: "Point you to routes, destinations, services and tourist attractions.",
    icon: "Signpost",
  },
  {
    id: "marking",
    label: "Road markings",
    blurb: "Lines, arrows and symbols painted on the road surface.",
    icon: "Minus",
  },
];

/** Friendly keys → catalogue id, for attaching real images to study content. */
const SIGN_KEY_TO_ID = {
  stop: "regulatory-006-01",
  yield: "regulatory-006-02",
  yield_pedestrian: "regulatory-006-05",
  pedestrian_priority: "regulatory-007-04",
  traffic_circle: "regulatory-007-03",
  no_entry: "regulatory-008-01",
  one_way_left: "regulatory-008-02",
  one_way_right: "regulatory-008-03",
  speed_limit: "regulatory-009-03",
  no_left_turn: "regulatory-011-01",
  no_right_turn: "regulatory-011-02",
  no_u_turn: "regulatory-011-05",
  no_parking: "regulatory-011-07",
  no_overtaking: "regulatory-012-01",
  robot_red: "regulatory-022-01",
  robot_amber: "regulatory-022-03",
  robot_green: "regulatory-022-04",
  gate_boom: "warning-027-02",
  steep_descent: "warning-027-04",
  steep_ascent: "warning-027-05",
  pedestrian_crossing: "warning-037-01",
  pedestrians: "warning-037-02",
  children: "warning-037-03",
  cyclists: "warning-037-04",
  railway: "warning-040-07",
  // Batch 4 — meanings hand-verified against the manual text in the catalogue.
  headlights_on: "regulatory-009-01",
  pass_side: "regulatory-009-04",
  proceed_direction: "regulatory-009-05",
  circle_clockwise: "regulatory-009-07",
  no_left_intersection: "regulatory-011-03",
  no_right_intersection: "regulatory-011-04",
  no_overtaking_trucks: "regulatory-012-02",
  no_hooter: "regulatory-012-03",
  reserved_lane_bus: "regulatory-013-01",
} as const;

export type SignImgKey = keyof typeof SIGN_KEY_TO_ID;

/** Resolve a friendly sign key to its public image path (empty string if missing). */
export function signImg(key: SignImgKey): string {
  return SIGNS_BY_ID[SIGN_KEY_TO_ID[key]]?.image ?? "";
}
