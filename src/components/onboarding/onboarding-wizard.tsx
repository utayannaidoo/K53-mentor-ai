"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bike,
  CalendarClock,
  Car,
  Clock3,
  Gauge,
  GraduationCap,
  Layers,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionCard } from "@/components/onboarding/option-card";
import { useStudyStore } from "@/hooks/use-study-store";
import { track } from "@/lib/analytics";
import { cn, daysUntil, glassFloat, glassSubtle, isPastDate, localIsoDate } from "@/lib/utils";
import type { LicenceGoal, OnboardingData, VehicleCode } from "@/types";

/** Goal, vehicle, date, then the informed starting-check choice. */
const TOTAL_STEPS = 4;
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

const GOAL_LABEL: Record<LicenceGoal, string> = {
  learners: "Learner's licence",
  drivers: "Driver's licence",
  both: "Learner's and driver's licences",
};

const CODE_LABEL: Record<VehicleCode, string> = {
  "8": "Car (Code 08)",
  A: "Motorcycle (Code A)",
  A1: "Motorcycle (Code A1)",
  "10": "Heavy vehicle (Code 10)",
  "14": "Heavy vehicle (Code 14)",
};

function weeksAway(dateStr: string): number | null {
  const days = daysUntil(dateStr);
  if (days === null || days < 0) return null;
  return Math.max(1, Math.round(days / 7));
}

export function OnboardingWizard() {
  const router = useRouter();
  const { completeOnboarding, skipDiagnostic, state, isAuthed } = useStudyStore();
  const firstName = state.profile?.name?.split(" ")[0] ?? null;
  const startedAt = React.useRef(Date.now());

  const [step, setStep] = React.useState(0);
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
          // Old seven-step drafts safely land on the new decision screen once
          // their three durable answers have already been collected.
          setStep(Math.min(Math.max(draft.step, 0), TOTAL_STEPS));
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
  const back = () => setStep((current) => Math.max(current - 1, 0));

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
      // Progressive-personalisation answers now use neutral defaults. They
      // remain editable later without delaying the learner's first value.
      confidence: 3,
      worryCategories: [],
      knowledgeLevel: "some",
      studyFrequency: "steady",
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

      {step > 0 && (
        <div className="mx-auto w-full max-w-lg px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={back}
              className="press -m-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-glass"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {step}/{TOTAL_STEPS}
            </span>
          </div>
        </div>
      )}

      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center px-6 py-8">
        <div key={step} className="w-full max-w-lg animate-fade-in">
          {step === 0 && (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-8 w-8" />
              </div>
              <h1 className="mt-6 text-balance font-display text-3xl font-semibold tracking-tight">
                Get your first study plan in under a minute
              </h1>
              <p className="mx-auto mt-3 max-w-md text-balance text-muted-foreground">
                Three quick choices set the right test, vehicle and pace. Then you can measure your
                starting point or begin studying straight away.
              </p>
              <Button size="xl" className="mt-8 w-full sm:w-auto" onClick={next}>
                Build my plan <ArrowRight />
              </Button>
            </div>
          )}

          {step === 1 && (
            <Step title="What are you working toward?" subtitle="We'll tailor the plan to the test you need next.">
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
              subtitle="A date helps us pace the plan. Not booked yet is a perfectly good answer."
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

                <Button
                  size="lg"
                  className="w-full"
                  disabled={
                    (!testDate && !noDate) ||
                    testDateInPast ||
                    (goal === "both" && ((!driversTestDate && !noDriversDate) || driversDateInPast))
                  }
                  onClick={next}
                >
                  See my plan <ArrowRight />
                </Button>
              </div>
            </Step>
          )}

          {step === 4 && (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CalendarClock className="h-8 w-8" />
              </div>
              <h1 className="mt-6 text-balance font-display text-3xl font-semibold tracking-tight">
                {firstName ? `${firstName}, your plan is ready` : "Your plan is ready"}
              </h1>
              <p className="mx-auto mt-2 max-w-md text-balance text-muted-foreground">
                One optional starting check can make it more precise.
              </p>

              <div className={cn(glassFloat, "mx-auto mt-6 max-w-md rounded-2xl border p-5 text-left")}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SummaryRow label="Goal" value={GOAL_LABEL[goal ?? "learners"]} />
                  <SummaryRow label="Vehicle" value={CODE_LABEL[vehicleCode ?? "8"]} />
                  <SummaryRow label="Test date" value={dateSummary(testDate)} />
                  <SummaryRow label="Today's plan" value="About 10 minutes" />
                </div>
              </div>

              <section
                aria-labelledby="starting-check-explained"
                className={cn(glassSubtle, "mx-auto mt-4 max-w-md rounded-2xl border p-4 text-left")}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  About the starting check
                </p>
                <h2 id="starting-check-explained" className="mt-1 font-display text-base font-semibold">
                  A quick baseline, not another test to pass
                </h2>
                <div className="mt-3 space-y-2">
                  <CheckFact
                    icon={<Clock3 />}
                    title="15 questions · about 5 minutes"
                    detail="It samples all 7 K53 study categories."
                  />
                  <CheckFact
                    icon={<BarChart3 />}
                    title="A plan based on your answers"
                    detail="Your first tasks target the gaps the check finds."
                  />
                  <CheckFact
                    icon={<ShieldCheck />}
                    title="No pass or fail"
                    detail="It only shows where it makes sense to begin."
                  />
                </div>
              </section>

              <p className="mx-auto mt-4 max-w-md text-balance text-sm text-muted-foreground">
                You can study first instead. Until you take the check, we&apos;ll keep readiness and
                category scores unmeasured rather than guessing them.
              </p>
              <Button size="xl" className="mt-6 w-full sm:w-auto" onClick={() => completeSetup("starting_check")}>
                Start my 5-minute check <ArrowRight />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => completeSetup("study_first")}
                className="mx-auto mt-2 w-full text-muted-foreground sm:w-auto"
              >
                Study first — measure me later
              </Button>
            </div>
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

function dateSummary(date: string): string {
  if (!date) return "Not booked — steady pace";
  const weeks = weeksAway(date);
  return weeks === null ? "Booked" : `In ${weeks} ${weeks === 1 ? "week" : "weeks"}`;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function CheckFact({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/35 px-3 py-2.5">
      <span className="mt-0.5 text-primary [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      <span>
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{detail}</span>
      </span>
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
