"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Bike, Car, Gauge, GraduationCap, Layers } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/shared/category-icon";
import { OptionCard } from "@/components/onboarding/option-card";
import { useStudyStore } from "@/hooks/use-study-store";
import { CATEGORIES } from "@/lib/content/categories";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { CategoryId, LicenceGoal, OnboardingData, VehicleCode } from "@/types";

/**
 * Three taps, then studying.
 *
 * This used to end in a 15-question starting check, and almost everyone who
 * signed up took it and never came back — the first thing the app asked of
 * them was a test. Now it asks what they find hard and starts them there.
 * The test date moved out too: it can be set from Today or Account whenever
 * the learner books, and it was the one screen here that needed typing.
 */
const TOTAL_STEPS = 3;
// v2: the date step is gone and "what's hard" took its place, so a v1 draft's
// step number would land on the wrong screen.
const DRAFT_KEY = "k53mentor.onboarding.draft.v2";

interface WizardDraft {
  step: number;
  goal: LicenceGoal | null;
  vehicleCode: VehicleCode | null;
  hardest: CategoryId[];
}

const GOALS: readonly LicenceGoal[] = ["learners", "drivers", "both"];
const VEHICLE_CODES: readonly VehicleCode[] = ["8", "10", "14", "A1", "A"];
const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function OnboardingWizard() {
  const router = useRouter();
  const { completeOnboarding, skipDiagnostic, isAuthed } = useStudyStore();
  const startedAt = React.useRef(Date.now());

  const [step, setStep] = React.useState(1);
  const [goal, setGoal] = React.useState<LicenceGoal | null>(null);
  const [vehicleCode, setVehicleCode] = React.useState<VehicleCode | null>(null);
  // In the order tapped: the first is where the plan starts.
  const [hardest, setHardest] = React.useState<CategoryId[]>([]);

  // Restore after mount so static prerender and browser hydration stay identical.
  const restored = React.useRef(false);
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<WizardDraft>;
        if (typeof draft.step === "number") {
          setStep(Math.min(Math.max(draft.step, 1), TOTAL_STEPS));
        }
        if (draft.goal && GOALS.includes(draft.goal)) setGoal(draft.goal);
        if (draft.vehicleCode && VEHICLE_CODES.includes(draft.vehicleCode)) {
          setVehicleCode(draft.vehicleCode);
        }
        if (Array.isArray(draft.hardest)) {
          setHardest(draft.hardest.filter((id) => CATEGORY_IDS.includes(id)));
        }
      }
    } catch {
      // Corrupt or unavailable storage means a fresh start, never a blocked flow.
    }
    restored.current = true;
  }, []);

  React.useEffect(() => {
    if (!restored.current) return;
    const draft: WizardDraft = { step, goal, vehicleCode, hardest };
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // The flow still works when storage is blocked; it simply cannot resume.
    }
  }, [step, goal, vehicleCode, hardest]);

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

  function toggleHardest(id: CategoryId) {
    setHardest((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
    );
  }

  function answers(): Omit<OnboardingData, "completedAt"> {
    return {
      goal: goal ?? "learners",
      vehicleCode: vehicleCode ?? "8",
      // Not asked here, so recorded as unanswered — never a made-up choice
      // saved to the profile as if the learner had given it. Consumers fall
      // back to neutral behaviour on null / empty.
      confidence: null,
      worryCategories: hardest,
      knowledgeLevel: null,
      studyFrequency: null,
      priorAttempts: 0,
      testDate: null,
      driversTestDate: null,
    };
  }

  function finish() {
    const data = answers();
    completeOnboarding(data);
    // Marks the account as past the old starting check, which older devices
    // and the account sync still read.
    skipDiagnostic();
    track("onboarding_completed", {
      path: "study",
      goal: data.goal,
      vehicle_code: data.vehicleCode,
      hardest_count: data.worryCategories.length,
      elapsed_seconds: Math.max(0, Math.round((Date.now() - startedAt.current) / 1000)),
    });
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
    // Guests save their setup first; signed-in learners go through the
    // post-auth router, which starts their first practice.
    router.push(isAuthed ? "/continue" : "/signup");
  }

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
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
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
            <Step title="What are you studying for?" subtitle="Three quick taps and you're studying.">
              <div className="space-y-3">
                <OptionCard selected={goal === "learners"} onClick={() => pick(setGoal, "learners")} icon={<GraduationCap className="h-5 w-5" />} title="Learner's licence" description="Rules of the road, signs and vehicle controls" />
                <OptionCard selected={goal === "drivers"} onClick={() => pick(setGoal, "drivers")} icon={<Car className="h-5 w-5" />} title="Driver's licence" description="Parking, manoeuvres and the yard test" />
                <OptionCard selected={goal === "both"} onClick={() => pick(setGoal, "both")} icon={<Layers className="h-5 w-5" />} title="Both" description="The full journey from learner to licensed driver" />
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step
              title="Which licence code?"
              subtitle="This decides the vehicle questions you see. You can change it any time."
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
              title="What do you find hardest?"
              subtitle="Pick any that apply. We'll start you there — or skip it and study everything."
            >
              <div className="space-y-2.5">
                {CATEGORIES.map((category) => (
                  <OptionCard
                    key={category.id}
                    selected={hardest.includes(category.id)}
                    onClick={() => toggleHardest(category.id)}
                    icon={<CategoryIcon id={category.id} className="h-5 w-5" />}
                    title={category.name}
                    description={category.description}
                    className="p-3.5"
                  />
                ))}
              </div>
              <Button size="lg" className="mt-6 w-full" onClick={finish}>
                {hardest.length > 0 ? "Start studying" : "Not sure — start studying"} <ArrowRight />
              </Button>
            </Step>
          )}
        </div>
      </main>
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
