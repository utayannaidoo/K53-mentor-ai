import type { CategoryId } from "@/types";

/**
 * Category-level content provenance, mirroring the references on /sources.
 * Honest by design: these say what body of material a category is written
 * against — not fabricated page numbers. An individual question can override
 * with `source` when an exact regulation is worth citing (editorial pass).
 */
const CATEGORY_SOURCE: Record<CategoryId, string> = {
  signs: "SADC road-sign system, as used in the official K53 manual",
  rules: "National Road Traffic Act 93 of 1996 and Regulations",
  controls: "Official K53 syllabus — vehicle controls",
  intersections: "National Road Traffic Regulations & the K53 defensive-driving system",
  parking: "National Road Traffic Regulations & the K53 defensive-driving system",
  following_distance: "K53 defensive-driving system (following distance rules)",
  hazard_awareness: "K53 defensive-driving system (hazard perception)",
};

/** The provenance line for a piece of content. */
export function sourceFor(item: { source?: string; categoryId: CategoryId }): string {
  return item.source ?? CATEGORY_SOURCE[item.categoryId];
}
