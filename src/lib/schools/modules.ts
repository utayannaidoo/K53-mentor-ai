import "server-only";
import { DRIVER_MODULES } from "@/lib/content/driver-modules";
import { groupOf } from "@/lib/content/vehicle";
import type { DriverModule, VehicleCode } from "@/types";

/**
 * The K53 yard-test manoeuvres, as a school sees them.
 *
 * Server-only on purpose. DRIVER_MODULES is paid content in the learner app —
 * `src/app/api/content/pack/route.ts` withholds it from anyone without
 * Premium Plus, on the rule that "if the browser receives bytes, assume the
 * buyer will read them". A school page renders the names and fault lists it
 * needs into HTML on the server; the step-by-step instructions never leave.
 */

export type Rating = 1 | 2 | 3;

export const RATING_LABEL: Record<Rating, string> = {
  1: "Introduced",
  2: "Developing",
  3: "Test-ready",
};

export interface ModuleSummary {
  id: string;
  name: string;
  summary: string;
  commonFaults: string[];
}

function summarise(module: DriverModule): ModuleSummary {
  return {
    id: module.id,
    name: module.name,
    summary: module.summary,
    commonFaults: module.commonFaults,
  };
}

/** The manoeuvres for a learner's licence code: car, motorcycle or heavy. */
export function modulesForLicence(code: VehicleCode): ModuleSummary[] {
  const group = groupOf(code);
  return DRIVER_MODULES.filter((m) => (m.group ?? "car") === group).map(summarise);
}

/** True when `id` is a real manoeuvre for this licence code. */
export function isModuleFor(code: VehicleCode, id: string): boolean {
  return modulesForLicence(code).some((m) => m.id === id);
}

export interface ProgressRow {
  module_id: string;
  rating: Rating;
  faults: string[];
  lesson_at: string;
}

/**
 * "11 of 13 test-ready." Counts only manoeuvres that belong to this learner's
 * licence, so a rating left over from a code change never inflates the score.
 */
export function readiness(
  code: VehicleCode,
  progress: ProgressRow[],
): { ready: number; started: number; total: number } {
  const ids = new Set(modulesForLicence(code).map((m) => m.id));
  const relevant = progress.filter((p) => ids.has(p.module_id));
  return {
    ready: relevant.filter((p) => p.rating === 3).length,
    started: relevant.length,
    total: ids.size,
  };
}
