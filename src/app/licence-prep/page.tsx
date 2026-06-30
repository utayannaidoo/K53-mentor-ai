"use client";

import Link from "next/link";
import { Car, Bike, Truck, Clock, ArrowRight, Lock, Sparkles, CheckCircle2, Wrench } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import { useStudyStore } from "@/hooks/use-study-store";
import { hasFeature } from "@/lib/billing/plans";
import { DRIVER_MODULES } from "@/lib/content/driver-modules";
import { groupOf } from "@/lib/content/vehicle";
import { cn, glass } from "@/lib/utils";

const DIFFICULTY = { 1: "Easy", 2: "Moderate", 3: "Advanced" } as const;

/** Yard-test modules currently only exist for cars; gate other groups. */
const GROUP_LABEL = { car: "Car", motorcycle: "Motorcycle", heavy: "Heavy-vehicle" } as const;
const GROUP_ICON = { car: Car, motorcycle: Bike, heavy: Truck } as const;
const GROUP_BLURB = {
  car: "Parallel parking, alley docking, three-point turns and more",
  motorcycle: "Slow ride, figure-8, incline starts and emergency stops",
  heavy: "Coupling, air-brake checks and the pre-trip inspection",
} as const;

export default function LicencePrepPage() {
  const { state } = useStudyStore();
  const unlocked = hasFeature(state.tier, "licencePrep");
  const group = state.onboarding ? groupOf(state.onboarding.vehicleCode) : "car";

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Driver's licence prep"
        description="Step-by-step cook-mode guides for the K53 yard test."
      />

      {!unlocked && (
        <Card className="mb-6 flex flex-wrap items-center justify-between gap-4 border-primary/25 bg-primary/[0.06] p-5 shadow-glass backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium text-foreground">Unlock yard-test mastery</p>
              <p className="text-sm text-muted-foreground">
                {GROUP_BLURB[group]} — Premium Plus.
              </p>
            </div>
          </div>
          <Link href="/account/billing" className={cn(buttonVariants())}>
            Upgrade to Premium Plus <ArrowRight />
          </Link>
        </Card>
      )}

      {group !== "car" ? (
        (() => {
          const GroupIcon = GROUP_ICON[group];
          return (
            <Card className={cn(glass, "flex flex-col items-center gap-3 p-10 text-center")}>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GroupIcon className="h-6 w-6" />
              </span>
              <h3 className="font-display text-lg font-semibold">
                {GROUP_LABEL[group]} yard-test guides are on the way
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Step-by-step cook-mode modules for {GROUP_LABEL[group].toLowerCase()} —{" "}
                {GROUP_BLURB[group].toLowerCase()} — are being built for your licence code. Your
                questions, flashcards and scenarios are already tailored to it.
              </p>
              <Badge variant="secondary" className="gap-1">
                <Wrench className="h-3 w-3" /> Coming soon
              </Badge>
            </Card>
          );
        })()
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DRIVER_MODULES.map((m) => {
          const done = state.driverProgress[m.id]?.length ?? 0;
          const pct = Math.round((done / m.steps.length) * 100);
          const complete = done === m.steps.length;
          return (
            <Link
              key={m.id}
              href={unlocked ? `/licence-prep/${m.id}` : "/account/billing"}
              className="group"
            >
              <Card className={cn(glass, "hover-elevate flex h-full flex-col p-5")}>
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Car className="h-5 w-5" />
                  </span>
                  {unlocked ? (
                    complete ? (
                      <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Done</Badge>
                    ) : (
                      <Badge variant="secondary">{DIFFICULTY[m.difficulty]}</Badge>
                    )
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{m.name}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{m.summary}</p>

                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {m.estMinutes} min</span>
                  <span>·</span>
                  <span>{m.steps.length} steps</span>
                </div>
                {unlocked && (
                  <div className="mt-3">
                    <Progress value={pct} tone={complete ? "success" : "primary"} />
                    <p className="mt-1.5 text-2xs text-muted-foreground">{done}/{m.steps.length} practised</p>
                  </div>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
      )}
    </div>
  );
}
