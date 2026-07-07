"use client";

import * as React from "react";
import Link from "next/link";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { DateSelect } from "@/components/ui/date-select";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/shared/page-loader";
import { useStudyStore } from "@/hooks/use-study-store";
import { vehicleClass, selectableCodes, VEHICLE_CLASS_SHORT } from "@/lib/billing/plans";
import { groupOf } from "@/lib/content/vehicle";
import { cn } from "@/lib/utils";
import type { LicenceGoal, VehicleCode } from "@/types";

export const GOAL_LABEL: Record<LicenceGoal, string> = {
  learners: "Learner's licence",
  drivers: "Driver's licence",
  both: "Learner's + driver's",
};

const CODE_LABEL: Record<"8" | "A" | "14", string> = {
  "8": "Car · Code 08 (B)",
  A: "Motorcycle · Code A / A1",
  "14": "Heavy · Code 10 / 14",
};

/** The picker's representative code for whatever code the profile holds. */
function representativeCode(code: VehicleCode): VehicleCode {
  if (code === "8") return "8";
  return groupOf(code) === "motorcycle" ? "A" : "14";
}

export function QuickProfileEdit({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, updateOnboarding, completeOnboarding, setVehicleClass } = useStudyStore();
  const onboarding = state.onboarding;
  // Free learners can study any code; paid subscribers are scoped to the track
  // they bought (switching track is a plan change on the billing page).
  const codes = selectableCodes(state.tier, state.vehicleClass);

  const [goal, setGoal] = React.useState<LicenceGoal>("learners");
  const [vehicleCode, setVehicleCodeLocal] = React.useState<VehicleCode>("8");
  const [testDate, setTestDate] = React.useState("");
  const [testBooked, setTestBooked] = React.useState(false);
  const [driversTestDate, setDriversTestDate] = React.useState("");
  const [driversBooked, setDriversBooked] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Re-seed local state from the current profile whenever the sheet opens.
  // Works even with no onboarding yet (e.g. a Google sign-in that skipped the
  // wizard) so the licence code is always changeable.
  React.useEffect(() => {
    if (!open) return;
    const allowed = selectableCodes(state.tier, state.vehicleClass);
    if (onboarding) {
      setGoal(onboarding.goal);
      const rep = representativeCode(onboarding.vehicleCode);
      setVehicleCodeLocal(allowed.includes(rep) ? rep : allowed[0]);
      setTestDate(onboarding.testDate ?? "");
      setTestBooked(Boolean(onboarding.testDate));
      setDriversTestDate(onboarding.driversTestDate ?? "");
      setDriversBooked(Boolean(onboarding.driversTestDate));
    } else {
      setGoal("learners");
      setVehicleCodeLocal(allowed[0]);
      setTestDate("");
      setTestBooked(false);
      setDriversTestDate("");
      setDriversBooked(false);
    }
  }, [open, onboarding, state.vehicleClass, state.tier]);

  function save() {
    const patch = {
      goal,
      vehicleCode,
      testDate: testBooked ? testDate : null,
      driversTestDate: goal === "both" ? (driversBooked ? driversTestDate : null) : null,
    };
    if (onboarding) {
      updateOnboarding(patch);
    } else {
      // No onboarding yet — scaffold a minimal profile around the chosen code.
      completeOnboarding({
        ...patch,
        confidence: 3,
        worryCategories: [],
        knowledgeLevel: "some",
        studyFrequency: "steady",
        priorAttempts: 0,
      });
    }
    // A free learner's studied code owns their track; a paid subscriber's track
    // is set on billing and left untouched here.
    if (state.tier === "free" || !state.vehicleClass) {
      setVehicleClass(vehicleClass(vehicleCode));
    }
    setSaving(true);
    // A short, deliberate pause so the refresh reads as "applying your change"
    // rather than a jarring reload, and gives the local-store save time to flush.
    window.setTimeout(() => window.location.reload(), 600);
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} className="max-w-lg">
        <h2 className="font-display text-lg font-semibold">Update study profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Quick changes — no need to redo the full onboarding.
        </p>

        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Goal</label>
            <Select
              value={goal}
              onChange={(v) => setGoal(v as LicenceGoal)}
              options={(Object.keys(GOAL_LABEL) as LicenceGoal[]).map((g) => ({
                value: g,
                label: GOAL_LABEL[g],
              }))}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Licence code</label>
            <Select
              value={vehicleCode}
              onChange={(v) => setVehicleCodeLocal(v as VehicleCode)}
              options={codes.map((c) => ({ value: c, label: CODE_LABEL[c as keyof typeof CODE_LABEL] }))}
            />
            {state.tier !== "free" && state.vehicleClass ? (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Your {VEHICLE_CLASS_SHORT[state.vehicleClass]} plan covers{" "}
                {state.vehicleClass === "car" ? "Code 08 only" : "motorcycle & heavy codes only"}.{" "}
                <Link
                  href="/account/billing"
                  className="font-medium text-primary underline"
                  onClick={onClose}
                >
                  Change plan
                </Link>{" "}
                to switch track.
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Switch anytime — pick the licence you&apos;re actually studying for.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {goal === "both" ? "Learner's test date" : goal === "drivers" ? "Driver's test date" : "Test date"}
            </label>
            <DateSelect value={testDate} onChange={setTestDate} disabled={!testBooked} />
            <button
              type="button"
              onClick={() => setTestBooked((v) => !v)}
              className={cn(
                "mt-2 w-full rounded-lg border-2 py-2 text-sm font-medium transition-colors",
                !testBooked ? "border-primary bg-primary/[0.04] text-primary" : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {testBooked ? "Mark as not booked" : "Not booked yet"}
            </button>
          </div>

          {goal === "both" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Driver's test date</label>
              <DateSelect value={driversTestDate} onChange={setDriversTestDate} disabled={!driversBooked} />
              <button
                type="button"
                onClick={() => setDriversBooked((v) => !v)}
                className={cn(
                  "mt-2 w-full rounded-lg border-2 py-2 text-sm font-medium transition-colors",
                  !driversBooked ? "border-primary bg-primary/[0.04] text-primary" : "border-border text-muted-foreground hover:border-primary/40",
                )}
              >
                {driversBooked ? "Mark as not booked" : "Not booked yet"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>Save changes</Button>
        </div>
      </Dialog>

      {saving && (
        <div className="fixed inset-0 z-[100]">
          <PageLoader />
        </div>
      )}
    </>
  );
}
