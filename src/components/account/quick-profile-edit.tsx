"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { DateSelect } from "@/components/ui/date-select";
import { Button } from "@/components/ui/button";
import { useStudyStore } from "@/hooks/use-study-store";
import { SELECTABLE_CODES } from "@/lib/billing/plans";
import { groupOf } from "@/lib/content/vehicle";
import { cn } from "@/lib/utils";
import type { LicenceGoal, OnboardingData, VehicleCode } from "@/types";

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
  const { state, saveOnboarding } = useStudyStore();
  const onboarding = state.onboarding;
  // Every code, always. One plan covers all of them, so switching licence is a
  // study preference the learner owns — never a billing decision.
  const codes = SELECTABLE_CODES;

  const [goal, setGoal] = React.useState<LicenceGoal>("learners");
  const [vehicleCode, setVehicleCodeLocal] = React.useState<VehicleCode>("8");
  const [testDate, setTestDate] = React.useState("");
  const [testBooked, setTestBooked] = React.useState(false);
  const [driversTestDate, setDriversTestDate] = React.useState("");
  const [driversBooked, setDriversBooked] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Re-seed local state from the current profile whenever the sheet opens.
  // Works even with no onboarding yet (e.g. a Google sign-in that skipped the
  // wizard) so the licence code is always changeable.
  React.useEffect(() => {
    if (!open) return;
    if (onboarding) {
      setGoal(onboarding.goal);
      setVehicleCodeLocal(representativeCode(onboarding.vehicleCode));
      setTestDate(onboarding.testDate ?? "");
      setTestBooked(Boolean(onboarding.testDate));
      setDriversTestDate(onboarding.driversTestDate ?? "");
      setDriversBooked(Boolean(onboarding.driversTestDate));
    } else {
      setGoal("learners");
      setVehicleCodeLocal("8");
      setTestDate("");
      setTestBooked(false);
      setDriversTestDate("");
      setDriversBooked(false);
    }
  }, [open, onboarding]);

  async function save() {
    const patch = {
      goal,
      vehicleCode,
      testDate: testBooked ? testDate : null,
      driversTestDate: goal === "both" ? (driversBooked ? driversTestDate : null) : null,
    };
    // Keep the existing answers and completedAt when there are any; otherwise
    // scaffold a minimal profile around the chosen code (e.g. a Google sign-in
    // that skipped the wizard).
    const data: OnboardingData = onboarding
      ? { ...onboarding, ...patch }
      : {
          ...patch,
          confidence: 3,
          worryCategories: [],
          knowledgeLevel: "some",
          studyFrequency: "steady",
          priorAttempts: 0,
          completedAt: new Date().toISOString(),
        };

    setSaving(true);
    setError(null);
    try {
      // Awaited, not fire-and-forget: this used to reload the page 600ms after
      // a local-only update, which cancelled the debounced server write before
      // it ran. The edit never reached the profile row, and the next hydration
      // put the old licence code straight back.
      await saveOnboarding(data);
      onClose();
    } catch {
      setError("We couldn't save that just now — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} className="max-w-lg" label="Update study profile">
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
            <p className="mt-1.5 text-xs text-muted-foreground">
              Switch any time — your plan covers every licence code. Your questions,
              flashcards, mocks and yard-test modules follow this choice.
            </p>
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

        {error && (
          <p role="alert" className="mt-5 rounded-lg border border-destructive/30 bg-destructive/[0.06] px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving} loading={saving} loadingText="Saving…">
            Save changes
          </Button>
        </div>
      </Dialog>
    </>
  );
}
