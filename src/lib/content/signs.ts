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
  /** Intrinsic pixel size of the extracted crop. */
  w?: number;
  h?: number;
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

  // Batch 5 — names taken from the catalogue meanings, which state the sign
  // unambiguously for these ("Speed humps ahead.", "To prohibit hawkers…").
  // Method spot-checked against the rendered images for a sample spanning both
  // categories (slippery road, speed hump, no-left-at-intersection, end of
  // residential area) — all four matched. Naming a sign is what the generated
  // `name` questions quiz, so only signs whose identity is beyond doubt belong
  // here; anything needing a judgement call about which sign it is was left out.
  "warning-027-01": { name: "Cattle grid ahead" },
  "warning-027-03": { name: "Tunnel ahead" },
  "warning-027-06": { name: "Slow-moving vehicles ahead" },
  "warning-028-01": { name: "Gravel road begins" },
  "warning-028-02": { name: "Tarred road begins" },
  "warning-028-03": { name: "Uneven road ahead" },
  "warning-028-04": { name: "Speed humps ahead" },
  "warning-028-05": { name: "Road narrows from both sides" },
  "warning-028-06": { name: "Road narrows from one side" },
  "warning-028-07": { name: "Road narrows at a bridge" },
  "warning-029-01": { name: "Slippery road ahead" },
  "warning-029-02": { name: "Falling rocks ahead" },
  "regulatory-007-01": { name: "Stop / Go (manually operated)" },
  "regulatory-008-04": { name: "One-way roadway (straight ahead)" },
  "regulatory-009-07": { name: "Proceed clockwise at the junction" },
  "regulatory-010-02": { name: "Buses and minibuses only" },
  "regulatory-010-05": { name: "Goods vehicles only" },
  "regulatory-010-06": { name: "Pedestrians only" },
  "regulatory-010-07": { name: "Cyclists and pedestrians only" },
  "regulatory-011-03": { name: "No left turn at intersection" },
  "regulatory-011-04": { name: "No right turn at intersection" },
  "regulatory-012-05": { name: "No motorcycles" },
  "regulatory-012-06": { name: "No hawkers" },
  "regulatory-012-07": { name: "No pedestrians" },
  "regulatory-014-03": { name: "Parking for people with disabilities" },
  "regulatory-014-05": { name: "Parking for authorised vehicles" },
  "regulatory-014-07": { name: "Parking for police vehicles" },
  "regulatory-017-02": { name: "End of headlights-on requirement" },
  "regulatory-017-05": { name: "End of dual-carriage freeway" },
  "regulatory-017-06": { name: "End of single-carriage freeway" },
  "regulatory-017-07": { name: "End of residential area" },

  // Batch 6 — junction-priority, dimension-warning, temporary and reservation
  // families. Same method as batch 5: the catalogue meaning names the sign
  // outright. Spot-checked against the rendered PNGs for one sign from each
  // family new to this batch — crossroad priority, drift, bus-lane reservation
  // and the height-restriction *warning* triangle — all four matched.
  //
  // The 031-xx entries are the temporary (yellow) twins of the 030-xx warnings.
  // Naming both is deliberate: permanent-vs-temporary is a listed high-yield
  // confusion pair, and the backgrounds differ clearly, so the image answers it.
  "warning-029-04": { name: "Jetty or river bank ahead" },
  "warning-029-05": { name: "Drift ahead" },
  "warning-029-06": { name: "Reduced visibility ahead" },
  "warning-029-07": { name: "Narrow structure ahead" },
  "warning-030-01": { name: "Length restriction ahead" },
  "warning-030-02": { name: "Height restriction ahead" },
  "warning-030-03": { name: "Width restriction ahead" },
  "warning-030-05": { name: "Crosswinds ahead" },
  "warning-031-01": { name: "Surface step ahead (temporary)" },
  "warning-031-02": { name: "Soft shoulder ahead (temporary)" },
  "warning-031-03": { name: "Loose stones ahead (temporary)" },
  "warning-031-04": { name: "Width restriction ahead (temporary)" },
  "warning-031-05": { name: "Length restriction ahead (temporary)" },
  "warning-031-06": { name: "Height restriction ahead (temporary)" },
  "warning-035-02": { name: "Priority road with crossroad ahead" },
  "warning-035-03": { name: "Priority crossroad ahead" },
  "warning-035-06": { name: "Side road junction ahead" },
  "warning-035-07": { name: "Staggered junctions ahead" },
  "warning-038-07": { name: "Agricultural vehicles ahead" },
  "regulatory-009-04": { name: "Pass on the side shown" },
  "regulatory-009-05": { name: "Proceed in the direction shown" },
  "regulatory-012-02": { name: "No overtaking by goods vehicles" },
  "regulatory-012-03": { name: "No hooter" },
  "regulatory-013-01": { name: "Bus lane reservation" },
  "regulatory-014-01": { name: "Parking reservation" },
  "regulatory-014-06": { name: "Time-limited parking" },
  "regulatory-017-03": { name: "End of mass restriction" },
  "regulatory-017-04": { name: "End of lane reservation" },

  // Batch 7 — danger plates, information signs and the remaining reservation
  // variants. Danger-plate chevrons spot-checked against the rendered PNG.
  //
  // Deliberately left unnamed: the 040-02/03 and 040-05/06 pairs, whose
  // catalogue meanings are word-for-word identical (they are the left/right
  // variants of one marker), and the 013-02..05 reservation set, which differs
  // only by which side of the yellow line the lane sits. Two quiz answers that
  // differ by a detail the meaning does not state make a question a coin toss.
  "warning-029-03": { name: "General warning" },
  "warning-039-03": { name: "Construction vehicles ahead" },
  "warning-040-01": { name: "Danger plate — pass this side" },
  "warning-040-04": { name: "Overhead structure marker" },
  "information-043-01": { name: "Freeway exit countdown markers" },
  "information-043-03": { name: "No through road" },
  "information-043-05": { name: "Priority road" },
  "information-044-03": { name: "Modal transfer point" },
  "information-044-04": { name: "Information centre" },
  "regulatory-009-02": { name: "Alternative route to toll road" },
  "regulatory-010-04": { name: "Heavy goods vehicles only" },
  "regulatory-013-06": { name: "Reserved stop zone" },
  "regulatory-013-07": { name: "Temporary lane reservation" },
  "regulatory-014-02": { name: "Parking for the class shown" },
  "regulatory-014-04": { name: "Temporary parking reservation" },
  "marking-081-01": { name: "Exclusive parking bay" },

  // Batch 8 — moving-hazard animals, junction layouts, and the stop/command
  // signs. Every name below was confirmed against the rendered PNG rather than
  // taken from the OCR meaning, because several catalogue meanings are captions
  // belonging to a neighbouring sign (see COMPOSITE_IMAGE_IDS).
  //
  // Deliberately left unnamed:
  //  - warning-036-01 / 036-02, a left/right mirror pair whose catalogue
  //    meanings are both exactly "Sharp junction ahead." — same reason as the
  //    040-02/03 pair above.
  //  - The regulatory-022/023 traffic-signal series. Their meanings are caption
  //    fragments ("Steady red man", "Flashing green arrow") and several of the
  //    images are near-identical, so any name question between them is a coin
  //    toss on a detail the meaning never states.
  //  - regulatory-007-05 (red/black arrow pair). The catalogue meaning reads
  //    "two-way traffic ahead" but the pictogram is the yield-to-oncoming
  //    sign; the two have opposite obligations, so it needs a source check
  //    before it can be quizzed either way.
  "warning-035-01": { name: "Crossroad ahead" },
  "warning-035-04": { name: "T-junction ahead" },
  "warning-035-05": { name: "Skew T-junction ahead" },
  "warning-037-05": { name: "Horses and riders ahead" },
  "warning-037-06": { name: "Horses ahead" },
  "warning-037-07": { name: "Cattle ahead" },
  "warning-038-01": { name: "Sheep ahead" },
  "warning-038-02": { name: "Wild animals ahead" },
  "warning-038-03": { name: "Warthogs ahead" },
  "warning-038-04": { name: "Elephants ahead" },
  "warning-038-05": { name: "Hippos ahead" },
  "warning-038-06": { name: "Trams ahead" },
  "warning-039-01": { name: "Road works ahead" },
  "warning-039-02": { name: "Grader working ahead" },
  "regulatory-006-03": { name: "Three-way stop" },
  "regulatory-006-04": { name: "Four-way stop" },
  "regulatory-007-02": { name: "Stop, or turn left without stopping" },
  "regulatory-009-01": { name: "Headlights on" },
  "regulatory-009-06": { name: "Proceed in the direction shown (temporary)" },
  "regulatory-010-01": { name: "Taxis only" },
  "regulatory-011-06": { name: "No stopping" },
  "regulatory-012-04": { name: "No picking up of passengers" },
  "regulatory-017-01": { name: "End of toll road" },

  // Batch 9 — road markings, the comprehensive signs and a few information
  // plates. Each confirmed against the rendered PNG.
  //
  // Road markings are the largest untouched block in the catalogue and their
  // captions read as names already ("Stop line:", "Box junction:"), but the
  // trailing colon fails the meaning gate, so before this batch not one of them
  // could be quizzed at all.
  //
  // Deliberately left unnamed, with reasons:
  //  - marking-079-01/02/03 ("Painted island" three times), 082-01 + 083-01
  //    ("Lane reserved for trams only" twice), 084-05 + 085-01..04 ("Exclusive
  //    use lane symbol" five times), 087-04 + 088-01 ("End of exclusive use
  //    lane"), 089-01/02 ("Arrestor bed ahead"), 090-01..05 ("Gives extra
  //    guidance"): identical catalogue meanings across two or more images.
  //  - marking-081-02, whose meaning duplicates the already-named 081-01.
  //  - marking-078-02 ("direction:") and 080-01 ("Taxis Mini-buses in an only"):
  //    OCR wreckage.
  //  - marking-082-02: a diamond marking captioned "hazardous goods vehicles".
  //    The diamond is the generic exclusive-use symbol here, so the caption may
  //    be misattributed — it needs a SARTSM check before it can be an answer.
  //  - marking-086-02/03/04 (continuity / lane / dividing line). These are
  //    genuinely different markings and a real thing to know, but the captions
  //    run sparsest→densest as continuity→lane→dividing, which is the reverse
  //    of the SARTSM ordering. Rather than teach three names that may be
  //    shuffled, they wait for a source check. See the roadmap.
  //  - marking-087-02 and 088-03: arrow markings whose names ("Mandatory
  //    direction arrows ahead", "Direction of travel indicators") sit too close
  //    to 081-03 to be fair options against it.
  //  - information-045-03/04 ("For the next 12km" / "For the next 5km"): differ
  //    only by a number the thumbnail cannot render legibly.
  "marking-077-01": { name: "Stop line" },
  "marking-077-02": { name: "Yield line" },
  "marking-077-03": { name: "Pedestrian crossing markings" },
  "marking-077-04": { name: "Block pedestrian crossing" },
  "marking-077-05": { name: "No-overtaking line" },
  "marking-078-01": { name: "No-crossing double line" },
  "marking-079-04": { name: "Parking bay markings" },
  "marking-081-03": { name: "Mandatory direction arrows" },
  "marking-081-04": { name: "Lane reserved for buses" },
  "marking-082-03": { name: "Lane reserved for bicycles" },
  "marking-082-04": { name: "Box junction" },
  "marking-083-02": { name: "No stopping — solid red line" },
  "marking-083-03": { name: "No stopping — broken red line" },
  "marking-083-04": { name: "No parking — solid yellow line" },
  "marking-084-01": { name: "No parking — broken yellow line" },
  "marking-084-02": { name: "No motorcycles marking" },
  "marking-084-03": { name: "Mini-circle marking" },
  "marking-084-04": { name: "Disabled persons parking bay" },
  "marking-086-01": { name: "Railway crossing ahead marking" },
  "marking-087-01": { name: "Reversible lane double lines" },
  "marking-087-03": { name: "No-overtaking line ahead" },
  "marking-088-02": { name: "Furcation arrows" },
  "marking-088-04": { name: "Cycle crossing" },
  "marking-088-05": { name: "Yield ahead marking" },
  "marking-089-03": { name: "Escape road ahead" },
  "regulatory-016-01": { name: "Residential area" },
  "regulatory-016-02": { name: "Dual-carriage freeway begins" },
  "regulatory-016-03": { name: "Single-carriage freeway begins" },
  "information-045-02": { name: "Recommended speed plate" },
  "information-045-06": { name: "Blind people plate" },
  "information-045-07": { name: "Accident plate (temporary)" },
};

/**
 * Catalogue entries whose image contains **more than one sign**.
 *
 * scripts/extract_signs.py slices sign images out of the manual's page scans by
 * bounding box, and where the manual stacks two or three related signs in one
 * column the slicer takes them as a single image. The catalogue then pairs that
 * multi-sign picture with only one of their meanings — and in warning-027-06's
 * case, with a meaning belonging to neither of the two signs shown.
 *
 * That is fine for a library thumbnail and fatal for a quiz: "what does THIS
 * sign mean?" has no answer when the picture holds three of them. So these are
 * excluded from question generation entirely.
 *
 * Found by rendering every quizzable image with an unusual aspect ratio and
 * looking at it; aspect ratio alone is not the test, since plenty of legitimate
 * signs (road-marking strips, traffic-signal heads) are tall and narrow.
 *
 * The real fix is re-extracting these six from the source pages, which is
 * scripts/extract_signs.py work rather than content work — until then this set
 * keeps them out of the bank.
 */
export const COMPOSITE_IMAGE_IDS: ReadonlySet<string> = new Set([
  "warning-027-06", // steep descent + level crossing; meaning says "slow moving vehicles"
  "warning-030-05", // crosswind + low-flying aircraft + electric hazard
  "warning-031-06", // height restriction + queuing traffic
  "warning-036-03", // four junction-layout variants in one strip
  "warning-039-04", // collision + queuing traffic
  "marking-089-04", // speed-hump marking + kerb strip
  // Found during the batch-9 naming sweep, by looking at every remaining
  // unnamed image rather than only the tall ones. Both of these carry meanings
  // long enough to clear the gate, so unlike the six above they were being
  // asked about.
  "information-043-04", // two no-through-road signs (left variant + right variant)
  "information-044-02", // a "3 PHASE" signal sign + the park-and-ride sign
]);

export function hasCompositeImage(sign: { id: string }): boolean {
  return COMPOSITE_IMAGE_IDS.has(sign.id);
}

/** Intrinsic dimensions of every extracted crop, keyed by its public path.
 *  GENERATED in ./signs-dimensions — deriving them here kept the whole
 *  catalogue JSON glued to every importer of this function, which is how
 *  ~140KB of sign names and meanings rode along into routes that only wanted
 *  "how wide is this image". */
export { signImageDimensions } from "./signs-dimensions";

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
  // Batch 8 — qualifier ("selective restriction") plates and the main signs
  // they hang under. These images are the whole point of the sign-plus-plate
  // questions in motus-signs-pack.ts: the plate is what changes the meaning,
  // so the learner has to see both together.
  qual_uturn_night: "regulatory-020-02",
  qual_right_turn_times: "regulatory-020-03",
  qual_speed_motorcycles: "regulatory-020-04",
  qual_no_right_buses: "regulatory-021-01",
  qual_min_speed_goods: "regulatory-021-02",
  qual_no_overtaking_2km: "regulatory-021-03",
  qual_max_15: "regulatory-019-03",
  qual_pay_parking: "regulatory-019-04",
  qual_local_access: "regulatory-019-06",
  qual_for_5km: "regulatory-019-07",
  qual_daytime: "regulatory-018-06",
  qual_night: "regulatory-018-07",
  three_way_stop: "regulatory-006-03",
  four_way_stop: "regulatory-006-04",
  stop_go_left: "regulatory-007-02",
  taxis_only: "regulatory-010-01",
  no_stopping: "regulatory-011-06",
  no_passenger_pickup: "regulatory-012-04",
  end_toll_road: "regulatory-017-01",
  crossroad_ahead: "warning-035-01",
  t_junction_ahead: "warning-035-04",
  cattle_ahead: "warning-037-07",
  wild_animals_ahead: "warning-038-02",
  road_works_ahead: "warning-039-01",
} as const;

export type SignImgKey = keyof typeof SIGN_KEY_TO_ID;

/** Resolve a friendly sign key to its public image path (empty string if missing). */
export function signImg(key: SignImgKey): string {
  return SIGNS_BY_ID[SIGN_KEY_TO_ID[key]]?.image ?? "";
}
