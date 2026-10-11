"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Bike, Car, Gauge, GraduationCap, Layers } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionCard } from "@/components/onboarding/option-card";
import { useStudyStore } from "@/hooks/use-study-store";
import { track } from "@/lib/analytics";
import { cn, isPastDate, localIsoDate } from "@/lib/utils";
import type { LicenceGoal, OnboardingData, VehicleCode } from "@/types";

/**
 * Goal, vehicle, date — then straight into the starting check.
 *
 * Every landing CTA says "Start free assessment", so the assessment has to be
 * the destination. This used to open on an intro screen and close on a "your
 * plan is ready" summary (a plan can't be ready before a single answer), so a
 * visitor saw six screens before question one. The date stays: it drives the
 * dashboard's countdown and the plan's pace.
 */
const TOTAL_STEPS = 3;
const DRAFT_KEY = "k53mentor.onboarding.draft.v1";

interface WizardDraft {
  step: number;
  goal: LicenceGoal | null;
  vehicleCode: VehicleCode | null;
  testDate: string;
  noDate: boolean;
  driversTestDate: string;
  noDriversDate: boolean;
}

const GOALS: readonly LicenceGoal[] = ["learners", "drivers", "both"];
const VEHICLE_CODES: readonly VehicleCode[] = ["8", "10", "14", "A1", "A"];

export function OnboardingWizard() {
  const router = useRouter();
  const { completeOnboarding, skipDiagnostic, isAuthed } = useStudyStore();
  const startedAt = React.useRef(Date.now());

  const [step, setStep] = React.useState(1);
  const [goal, setGoal] = React.useState<LicenceGoal | null>(null);
  const [vehicleCode, setVehicleCode] = React.useState<VehicleCode | null>(null);
  const [testDate, setTestDate] = React.useState("");
  const [noDate, setNoDate] = React.useState(false);
  const [driversTestDate, setDriversTestDate] = React.useState("");
  const [noDriversDate, setNoDriversDate] = React.useState(false);

  const todayIso = React.useMemo(() => localIsoDate(), []);
  const testDateInPast = isPastDate(testDate || null);
  const driversDateInPast = isPastDate(driversTestDate || null);

  // Restore after mount so static prerender and browser hydration stay identical.
  const restored = React.useRef(false);
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<WizardDraft>;
        if (typeof draft.step === "number") {
          // Drafts from the older intro/summary flows land on the nearest
          // question that still exists.
          setStep(Math.min(Math.max(draft.step, 1), TOTAL_STEPS));
        }
        if (draft.goal && GOALS.includes(draft.goal)) setGoal(draft.goal);
        if (draft.vehicleCode && VEHICLE_CODES.includes(draft.vehicleCode)) {
          setVehicleCode(draft.vehicleCode);
        }
        if (typeof draft.testDate === "string") setTestDate(draft.testDate);
        if (typeof draft.noDate === "boolean") setNoDate(draft.noDate);
        if (typeof draft.driversTestDate === "string") {
          setDriversTestDate(draft.driversTestDate);
        }
        if (typeof draft.noDriversDate === "boolean") {
          setNoDriversDate(draft.noDriversDate);
        }
      }
    } catch {
      // Corrupt or unavailable storage means a fresh start, never a blocked flow.
    }
    restored.current = true;
  }, []);

  React.useEffect(() => {
    if (!restored.current) return;
    const draft: WizardDraft = {
      step,
      goal,
      vehicleCode,
      testDate,
      noDate,
      driversTestDate,
      noDriversDate,
    };
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // The flow still works when storage is blocked; it simply cannot resume.
    }
  }, [step, goal, vehicleCode, testDate, noDate, driversTestDate, noDriversDate]);

  const next = () => setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  const back = () => setStep((current) => Math.max(current - 1, 1));

  // Show a selection before auto-advancing and ignore fast double taps.
  const advancing = React.useRef(false);
  React.useEffect(() => {
    advancing.current = false;
  }, [step]);

  function pick<T>(setter: (value: T) => void, value: T) {
    if (advancing.current) return;
    advancing.current = true;
    setter(value);
    window.setTimeout(next, 240);
  }

  function answers(): Omit<OnboardingData, "completedAt"> {
    return {
      goal: goal ?? "learners",
      vehicleCode: vehicleCode ?? "8",
      // Not asked here, so recorded as unanswered — never a made-up choice
      // saved to the profile as if the learner had given it. Consumers fall
      // back to neutral behaviour on null / empty.
      confidence: null,
      worryCategories: [],
      knowledgeLevel: null,
      studyFrequency: null,
      priorAttempts: 0,
      testDate: noDate || testDateInPast ? null : testDate || null,
      driversTestDate:
        goal === "both"
          ? noDriversDate || driversDateInPast
            ? null
            : driversTestDate || null
          : null,
    };
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
  }

  function completeSetup(path: "starting_check" | "study_first") {
    const data = answers();
    completeOnboarding(data);
    track("onboarding_completed", {
      path,
      goal: data.goal,
      vehicle_code: data.vehicleCode,
      has_test_date: Boolean(data.testDate),
      elapsed_seconds: Math.max(0, Math.round((Date.now() - startedAt.current) / 1000)),
    });
    clearDraft();

    if (path === "starting_check") {
      router.push("/diagnostic");
      return;
    }

    skipDiagnostic();
    // Guests save their setup first; signed-in learners can enter the practice
    // step immediately through the post-auth router.
    router.push(isAuthed ? "/continue" : "/signup");
  }

  const primaryDateLabel = goal === "drivers" ? "Driver's test date" : "Learner's test date";
  const datesChosen =
    (Boolean(testDate) || noDate) &&
    !testDateInPast &&
    (goal !== "both" || ((Boolean(driversTestDate) || noDriversDate) && !driversDateInPast));

  return (
    <div className="flex min-h-dvh flex-col bg-background bg-app">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" aria-label="K53 Mentor AI home">
          <Logo />
        </Link>
        {!isAuthed && (
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Log in
          </Link>
        )}
      </header>

      <div className="mx-auto w-full max-w-lg px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={back}
            // Kept in the layout on step one so the progress bar doesn't jump
            // sideways when the button appears.
            className={cn(
              "press -m-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25",
              step === 1 && "invisible",
            )}
            aria-label="Back"
            aria-hidden={step === 1 || undefined}
            tabIndex={step === 1 ? -1 : undefined}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500 ease-glass"
              style={{ width: `${(step / (TOTAL_STEPS + 1)) * 100}%` }}
            />
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {step}/{TOTAL_STEPS}
          </span>
        </div>
      </div>

      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center px-6 py-8">
        <div key={step} className="w-full max-w-lg animate-fade-in">
          {step === 1 && (
            <Step
              title="What are you working toward?"
              subtitle="Three quick taps, then a 15-question starting check — about 5 minutes, no pass or fail."
            >
              <div className="space-y-3">
                <OptionCard selected={goal === "learners"} onClick={() => pick(setGoal, "learners")} icon={<GraduationCap className="h-5 w-5" />} title="Learner's licence" description="Rules of the road, signs and vehicle controls" />
                <OptionCard selected={goal === "drivers"} onClick={() => pick(setGoal, "drivers")} icon={<Car className="h-5 w-5" />} title="Driver's licence" description="Parking, manoeuvres and the yard test" />
                <OptionCard selected={goal === "both"} onClick={() => pick(setGoal, "both")} icon={<Layers className="h-5 w-5" />} title="Both" description="The full journey from learner to licensed driver" />
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step
              title="Which licence code are you studying?"
              subtitle="This controls the vehicle-specific questions you see. You can change it later."
            >
              <div className="space-y-3">
                <OptionCard selected={vehicleCode === "8"} onClick={() => pick(setVehicleCode, "8")} icon={<Car className="h-5 w-5" />} title="Car · Code 08 (B)" description="Cars and light vehicles up to 3 500 kg" />
                <OptionCard selected={vehicleCode === "A"} onClick={() => pick(setVehicleCode, "A")} icon={<Bike className="h-5 w-5" />} title="Motorcycle · Code A / A1" description="Light and larger motorcycles" />
                <OptionCard selected={vehicleCode === "14"} onClick={() => pick(setVehicleCode, "14")} icon={<Gauge className="h-5 w-5" />} title="Heavy · Code 10 / 14" description="Rigid and articulated heavy vehicles" />
              </div>
            </Step>
          )}

          {step === 3 && (
            <Step
              title={goal === "both" ? "When are your tests?" : "When's your test?"}
              subtitle="A date paces your plan and starts a countdown. Not booked yet is a perfectly good answer."
            >
              <div className="space-y-5">
                <DateChoice
                  id="primary-test-date"
                  label={primaryDateLabel}
                  value={testDate}
                  min={todayIso}
                  notBooked={noDate}
                  invalid={testDateInPast}
                  onChange={(value) => {
                    setTestDate(value);
                    setNoDate(false);
                  }}
                  onNotBooked={() => {
                    setNoDate(true);
                    setTestDate("");
                  }}
                />

                {goal === "both" && (
                  <DateChoice
                    id="drivers-test-date"
                    label="Driver's test date"
                    value={driversTestDate}
                    min={todayIso}
                    notBooked={noDriversDate}
                    invalid={driversDateInPast}
                    onChange={(value) => {
                      setDriversTestDate(value);
                      setNoDriversDate(false);
                    }}
                    onNotBooked={() => {
                      setNoDriversDate(true);
                      setDriversTestDate("");
                    }}
                  />
                )}

                <div>
                  <Button
                    size="lg"
                    className="w-full"
                    disabled={!datesChosen}
                    onClick={() => completeSetup("starting_check")}
                  >
                    Start my 5-minute check <ArrowRight />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    disabled={!datesChosen}
                    onClick={() => completeSetup("study_first")}
                    className="mt-2 w-full text-muted-foreground"
                  >
                    Study first — measure me later
                  </Button>
                </div>
              </div>
            </Step>
          )}
        </div>
      </main>
    </div>
  );
}

function DateChoice({
  id,
  label,
  value,
  min,
  notBooked,
  invalid,
  onChange,
  onNotBooked,
}: {
  id: string;
  label: string;
  value: string;
  min: string;
  notBooked: boolean;
  invalid: boolean;
  onChange: (value: string) => void;
  onNotBooked: () => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <Input
        id={id}
        type="date"
        value={value}
        min={min}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 text-base"
      />
      {invalid && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-danger">
          That date has passed. Pick an upcoming date or choose not booked yet.
        </p>
      )}
      <Button
        type="button"
        variant={notBooked ? "secondary" : "outline"}
        size="lg"
        onClick={onNotBooked}
        aria-pressed={notBooked}
        className={cn("mt-2 w-full", notBooked && "border-primary/50 text-primary")}
      >
        I haven&apos;t booked yet
      </Button>
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-balance font-display text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-balance text-muted-foreground">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}
