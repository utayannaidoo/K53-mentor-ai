import { describe, expect, it } from "vitest";
import { isModuleFor, modulesForLicence, readiness } from "@/lib/schools/modules";

/**
 * Which K53 manoeuvres a learner can be rated on, and how "ready" is counted.
 * The database only checks a module id's shape; this is the check that a
 * car manoeuvre can never be recorded against a motorcycle learner.
 */
describe("school K53 modules", () => {
  it("gives each licence its own set of manoeuvres", () => {
    expect(modulesForLicence("8")).toHaveLength(13);
    expect(modulesForLicence("A")).toHaveLength(10);
    expect(modulesForLicence("A1")).toHaveLength(10);
    expect(modulesForLicence("10")).toHaveLength(10);
    expect(modulesForLicence("14")).toHaveLength(10);
  });

  it("refuses a manoeuvre from the wrong licence", () => {
    expect(isModuleFor("8", "alley_docking")).toBe(true);
    expect(isModuleFor("A", "alley_docking")).toBe(false);
    expect(isModuleFor("A", "moto_slow_ride")).toBe(true);
    expect(isModuleFor("14", "hv_coupling")).toBe(true);
    expect(isModuleFor("8", "not_a_module")).toBe(false);
  });

  it("carries each manoeuvre's own failure criteria for the fault picker", () => {
    for (const code of ["8", "A", "14"] as const) {
      for (const module of modulesForLicence(code)) {
        expect(module.commonFaults.length).toBeGreaterThan(0);
      }
    }
  });

  it("counts test-ready against this licence only", () => {
    const at = "2026-09-18T08:00:00Z";
    const score = readiness("8", [
      { module_id: "alley_docking", rating: 3, faults: [], lesson_at: at },
      { module_id: "parallel_parking", rating: 2, faults: [], lesson_at: at },
      // Left over from when this learner was down for a motorcycle licence.
      { module_id: "moto_slow_ride", rating: 3, faults: [], lesson_at: at },
    ]);
    expect(score).toEqual({ ready: 1, started: 2, total: 13 });
  });
});
