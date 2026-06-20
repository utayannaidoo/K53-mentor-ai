import type { Category, CategoryId } from "@/types";

export const CATEGORIES: Category[] = [
  {
    id: "signs",
    name: "Road signs",
    short: "Signs",
    description: "Regulatory, warning and information signs and road markings.",
    scope: "learners",
    icon: "Signpost",
  },
  {
    id: "rules",
    name: "Rules of the road",
    short: "Rules",
    description: "Right of way, speed limits, signalling and legal requirements.",
    scope: "learners",
    icon: "Scale",
  },
  {
    id: "controls",
    name: "Vehicle controls",
    short: "Controls",
    description: "The function of every control and instrument in the vehicle.",
    scope: "learners",
    icon: "Gauge",
  },
  {
    id: "intersections",
    name: "Intersections",
    short: "Intersections",
    description: "Four-way stops, traffic circles and yielding at junctions.",
    scope: "learners",
    icon: "TrafficCone",
  },
  {
    id: "parking",
    name: "Parking & stopping",
    short: "Parking",
    description: "Where you may and may not park or stop a vehicle.",
    scope: "learners",
    icon: "SquareParking",
  },
  {
    id: "following_distance",
    name: "Following distance",
    short: "Following",
    description: "Safe gaps, the two-second rule and braking distances.",
    scope: "learners",
    icon: "Ruler",
  },
  {
    id: "hazard_awareness",
    name: "Hazard awareness",
    short: "Hazards",
    description: "Reading the road, anticipating risk and defensive driving.",
    scope: "learners",
    icon: "ShieldAlert",
  },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

export function categoryName(id: CategoryId) {
  return CATEGORY_MAP[id]?.name ?? id;
}
