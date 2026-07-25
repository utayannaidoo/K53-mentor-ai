import { describe, it, expect } from "vitest";
import {
  groupOf,
  sameGroup,
  appliesToCode,
  DEFAULT_VEHICLE_GROUP,
} from "@/lib/content/vehicle";
import type { VehicleCode } from "@/types";

/**
 * `onboarding.vehicleCode` round-trips through localStorage, so it is not
 * guaranteed to be a current `VehicleCode` no matter how well-typed the call
 * sites are: a state blob written by an older build can carry a retired code.
 * groupOf returning undefined for those used to reach an icon-map lookup in the
 * app shell, which rendered `undefined` as a component and white-screened the
 * entire authed app behind the error boundary — unrecoverable without clearing
 * site data. It must always resolve to a real group.
 */
describe("groupOf", () => {
  it("maps every known code to its content group", () => {
    expect(groupOf("8")).toBe("car");
    expect(groupOf("A")).toBe("motorcycle");
    expect(groupOf("A1")).toBe("motorcycle");
    expect(groupOf("10")).toBe("heavy");
    expect(groupOf("14")).toBe("heavy");
  });

  it("never returns undefined for a stale or unknown stored code", () => {
    // "B" shipped in an earlier iteration of the onboarding wizard.
    for (const stale of ["B", "EB", "", "08", "car"]) {
      const group = groupOf(stale as VehicleCode);
      expect(group).toBe(DEFAULT_VEHICLE_GROUP);
      expect(["car", "motorcycle", "heavy"]).toContain(group);
    }
  });

  it("survives null/undefined without throwing", () => {
    expect(groupOf(undefined as unknown as VehicleCode)).toBe(DEFAULT_VEHICLE_GROUP);
    expect(groupOf(null as unknown as VehicleCode)).toBe(DEFAULT_VEHICLE_GROUP);
  });
});

describe("sameGroup", () => {
  it("still groups the motorcycle and heavy pairs", () => {
    expect(sameGroup("A", "A1")).toBe(true);
    expect(sameGroup("10", "14")).toBe(true);
    expect(sameGroup("8", "A")).toBe(false);
  });

  it("does not treat two unknown codes as universally matching", () => {
    // Previously both sides resolved to undefined, so `undefined === undefined`
    // made an unrecognised code match *every* group.
    expect(sameGroup("B" as VehicleCode, "A")).toBe(false);
    expect(sameGroup("B" as VehicleCode, "8")).toBe(true); // falls back to car
  });
});

describe("appliesToCode", () => {
  it("keeps universal content universal", () => {
    expect(appliesToCode(undefined, "8")).toBe(true);
    expect(appliesToCode([], "A")).toBe(true);
    expect(appliesToCode(["10"], undefined)).toBe(true);
  });

  it("shows car content to a learner whose stored code is unrecognised", () => {
    expect(appliesToCode(["8"], "B" as VehicleCode)).toBe(true);
    expect(appliesToCode(["A"], "B" as VehicleCode)).toBe(false);
  });
});
