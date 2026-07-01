"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Car,
  Layers,
  CalendarClock,
  Sparkles,
  Gauge,
  Bike,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { CategoryIcon } from "@/components/shared/category-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { OptionCard } from "@/components/onboarding/option-card";
import { useStudyStore } from "@/hooks/use-study-store";
import { vehicleClass } from "@/lib/billing/plans";
import { CATEGORIES } from "@/lib/content/categories";
import { cn } from "@/lib/utils";
import type {
  CategoryId,
  ConfidenceLevel,
  KnowledgeLevel,
  LicenceGoal,
  StudyFrequency,
  VehicleCode,
} from "@/types";

const TOTAL_STEPS = 7; // excluding the welcome screen

const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  1: "Totally lost",
  2: "Shaky",
  3: "Getting there",
  4: "Fairly good",
  5: "Pretty confident",
};

export function OnboardingWizard() {
  const router = useRouter();
  const { completeOnboarding, state, setVehicleClass } = useStudyStore();
  // The subscription track decides which codes are offered: car-only, the two
  // bike+heavy codes, or (no track yet, e.g. free trial) all three.
  const planClass = state.vehicleClass;

  const [step, setStep] = React.useState(0);
  const [goal, setGoal] = React.useState<LicenceGoal | null>(null);
  const [vehicleCode, setVehicleCode] = React.useState<VehicleCode | null>(null);
  const [testDate, setTestDate] = React.useState<string>("");
  const [noDate, setNoDate] = React.useState(false);
  const [driversTestDate, setDriversTestDate] = React.useState<string>("");
  const [noDriversDate, setNoDriversDate] = React.useState(false);
  const [priorAttempts, setPriorAttempts] = React.useState<number>(0);
  const [confidence, setConfidence] = React.useState<ConfidenceLevel | null>(null);
  const [worryCategories, setWorryCategories] = React.useState<CategoryId[]>([]);
  const [knowledge, setKnowledge] = React.useState<KnowledgeLevel | null>(null);
  const [frequency, setFrequency] = React.useState<StudyFrequency | null>(null);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  function toggleWorry(id: CategoryId) {
    setWorryCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  /** Set a value then auto-advance for single-tap steps. */
  function pick<T>(setter: (v: T) => void, value: T) {
    setter(value);
    window.setTimeout(next, 240);
  }

  function finish() {
    const code: VehicleCode = vehicleCode ?? (planClass === "bike_heavy" ? "A" : "8");
    completeOnboarding({
      goal: goal ?? "learners",
      vehicleCode: code,
      testDate: noDate ? null : testDate || null,
      driversTestDate: goal === "both" ? (noDriversDate ? null : driversTestDate || null) : null,
      confidence: confidence ?? 3,
      worryCategories,
      knowledgeLevel: knowledge ?? "some",
      studyFrequency: frequency ?? "steady",
      priorAttempts,
    });
    // Free/no-track users set their track from the code they chose here.
    if (!planClass) setVehicleClass(vehicleClass(code));
    router.push("/diagnostic");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background bg-app">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/">
          <Logo />
        </Link>
        <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Log in
        </Link>
      </header>

      {step > 0 && (
        <div className="mx-auto w-full max-w-lg px-6">
          <div className="flex items-center gap-3">
            <button onClick={back} className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {step}/{TOTAL_STEPS}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <div key={step} className="w-full max-w-lg animate-fade-in">
          {/* Step 0 — Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-8 w-8" />
              </div>
              <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
                Meet your AI driving coach
              </h1>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                K53 Mentor AI figures out exactly what you need to study — in the next 5 minutes.
                First, a few quick questions so your plan fits you.
              </p>
              <Button size="xl" className="mt-8 w-full sm:w-auto" onClick={next}>
                Get started <ArrowRight />
              </Button>
            </div>
          )}

          {/* Step 1 — Goal */}
          {step === 1 && (
            <Step title="What are you working toward?" subtitle="We'll tailor your plan to the right test.">
              <div className="space-y-3">
                <OptionCard selected={goal === "learners"} onClick={() => pick(setGoal, "learners")} icon={<GraduationCap className="h-5 w-5" />} title="Learner's licence" description="Rules of the road, signs and vehicle controls" />
                <OptionCard selected={goal === "drivers"} onClick={() => pick(setGoal, "drivers")} icon={<Car className="h-5 w-5" />} title="Driver's licence" description="Parking, manoeuvres and the yard test" />
                <OptionCard selected={goal === "both"} onClick={() => pick(setGoal, "both")} icon={<Layers className="h-5 w-5" />} title="Both" description="The full journey, learner's to licensed" />
              </div>
            </Step>
          )}

          {/* Step 2 — Vehicle code */}
          {step === 2 && (
            <Step
              title="Which licence are you after?"
              subtitle={
                planClass === "car"
                  ? "Your Car subscription covers Code 08."
                  : planClass === "bike_heavy"
                    ? "Your subscription covers motorcycle and heavy codes — pick the one you're learning."
                    : "This decides which controls, signs and content you'll get."
              }
            >
              <div className="space-y-3">
                {planClass !== "bike_heavy" && (
                  <OptionCard selected={vehicleCode === "8"} onClick={() => pick(setVehicleCode, "8")} icon={<Car className="h-5 w-5" />} title="Car · Code 08 (B)" description="Cars and light vehicles up to 3 500 kg" />
                )}
                {planClass !== "car" && (
                  <>
                    <OptionCard selected={vehicleCode === "A"} onClick={() => pick(setVehicleCode, "A")} icon={<Bike className="h-5 w-5" />} title="Motorcycle · Code A / A1" description="Any motorcycle — light (≤125 cc) or larger" />
                    <OptionCard selected={vehicleCode === "14"} onClick={() => pick(setVehicleCode, "14")} icon={<Gauge className="h-5 w-5" />} title="Heavy · Code 10 / 14" description="Rigid and articulated heavy vehicles over 3 500 kg" />
                  </>
                )}
              </div>
            </Step>
          )}

          {/* Step 3 — Test date(s) */}
          {step === 3 && (
            <Step
              title={goal === "both" ? "When are your tests?" : "When's your test?"}
              subtitle="We'll build your plan backward from this date — even a rough guess helps."
            >
              <div className="space-y-4">
                <div>
                  {goal === "both" && (
                    <p className="mb-1.5 text-sm font-medium text-foreground">Learner&apos;s test date</p>
                  )}
                  <Input
                    type="date"
                    value={testDate}
                    onChange={(e) => {
                      setTestDate(e.target.value);
                      setNoDate(false);
                    }}
                    className="h-12 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setNoDate(true);
                      setTestDate("");
                    }}
                    className={cn(
                      "mt-2 w-full rounded-lg border-2 py-3 text-sm font-medium transition-colors",
                      noDate ? "border-primary bg-primary/[0.04] text-primary" : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    I haven&apos;t booked yet
                  </button>
                </div>

                {goal === "both" && (
                  <div>
                    <p className="mb-1.5 text-sm font-medium text-foreground">Driver&apos;s test date</p>
                    <Input
                      type="date"
                      value={driversTestDate}
                      onChange={(e) => {
                        setDriversTestDate(e.target.value);
                        setNoDriversDate(false);
                      }}
                      className="h-12 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setNoDriversDate(true);
                        setDriversTestDate("");
                      }}
                      className={cn(
                        "mt-2 w-full rounded-lg border-2 py-3 text-sm font-medium transition-colors",
                        noDriversDate ? "border-primary bg-primary/[0.04] text-primary" : "border-border text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      I haven&apos;t booked yet
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <p className="mb-2 text-sm font-medium text-foreground">Have you taken this test before?</p>
                  <div className="flex flex-wrap gap-2">
                    {[0, 1, 2, 3].map((n) => (
                      <Chip key={n} active={priorAttempts === n} onClick={() => setPriorAttempts(n)}>
                        {n === 0 ? "First time" : n === 3 ? "3+ times" : `${n} time${n > 1 ? "s" : ""}`}
                      </Chip>
                    ))}
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  disabled={
                    (!testDate && !noDate) ||
                    (goal === "both" && !driversTestDate && !noDriversDate)
                  }
                  onClick={next}
                >
                  Continue <ArrowRight />
                </Button>
              </div>
            </Step>
          )}

          {/* Step 4 — Confidence */}
          {step === 4 && (
            <Step title="Right now, how ready do you feel?" subtitle="Be honest — this just helps us calibrate, not judge.">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-end justify-between gap-2">
                  {([1, 2, 3, 4, 5] as ConfidenceLevel[]).map((n) => (
                    <button
                      key={n}
                      onClick={() => pick<ConfidenceLevel>(setConfidence, n)}
                      className={cn(
                        "flex h-14 flex-1 items-center justify-center rounded-lg border-2 font-mono text-lg font-semibold transition-all",
                        confidence === n
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>{CONFIDENCE_LABELS[1]}</span>
                  <span>{CONFIDENCE_LABELS[5]}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={next}
                className="mx-auto mt-4 block text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Skip — not sure yet
              </button>
            </Step>
          )}

          {/* Step 5 — Worry categories */}
          {step === 5 && (
            <Step
              title="What worries you most?"
              subtitle="Pick as many as apply — we'll open with these before your diagnostic even starts."
            >
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <Chip
                    key={c.id}
                    active={worryCategories.includes(c.id)}
                    onClick={() => toggleWorry(c.id)}
                  >
                    <CategoryIcon id={c.id} className="h-3.5 w-3.5" />
                    {c.name}
                  </Chip>
                ))}
              </div>
              <Button size="lg" className="mt-6 w-full" onClick={next}>
                Continue <ArrowRight />
              </Button>
            </Step>
          )}

          {/* Step 6 — Habits */}
          {step === 6 && (
            <Step title="How will you study?" subtitle="We'll size your daily plan to match.">
              <div className="space-y-6">
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Your starting knowledge</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ["beginner", "Beginner"],
                        ["some", "Some basics"],
                        ["confident", "Confident"],
                      ] as [KnowledgeLevel, string][]
                    ).map(([k, label]) => (
                      <button
                        key={k}
                        onClick={() => setKnowledge(k)}
                        className={cn(
                          "rounded-lg border-2 px-2 py-3 text-sm font-medium transition-colors",
                          knowledge === k ? "border-primary bg-primary/[0.04] text-primary" : "border-border text-muted-foreground hover:border-primary/40",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">How often will you practise?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ["casual", "A few times a week"],
                        ["steady", "Daily, 10 min"],
                        ["intense", "Daily, 30 min+"],
                      ] as [StudyFrequency, string][]
                    ).map(([k, label]) => (
                      <button
                        key={k}
                        onClick={() => setFrequency(k)}
                        className={cn(
                          "rounded-lg border-2 px-2 py-3 text-xs font-medium transition-colors",
                          frequency === k ? "border-primary bg-primary/[0.04] text-primary" : "border-border text-muted-foreground hover:border-primary/40",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <Button size="lg" className="w-full" disabled={!knowledge || !frequency} onClick={next}>
                  Continue <ArrowRight />
                </Button>
                <button
                  type="button"
                  onClick={next}
                  className="mx-auto block text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Skip — use defaults
                </button>
              </div>
            </Step>
          )}

          {/* Step 7 — Ready */}
          {step === 7 && (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CalendarClock className="h-8 w-8" />
              </div>
              <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
                Let&apos;s find your weak spots
              </h1>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Most learners who fail K53 say the same thing afterward — they got caught out by
                something they hadn&apos;t practised. This quick check (15 questions, 7 categories,
                no pressure) shows you exactly where your gaps are, before test day does.
              </p>
              <Button size="xl" className="mt-8 w-full sm:w-auto" onClick={finish}>
                Start my diagnostic <ArrowRight />
              </Button>
            </div>
          )}
        </div>
      </div>
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
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}
