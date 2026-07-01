"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  ClipboardCheck,
  GraduationCap,
  Lightbulb,
  Eye,
  Gauge,
  Cog,
  CircleDot,
  ArrowLeftRight,
  Sun,
  Volume2,
  TriangleAlert,
  CloudFog,
  Droplets,
  RectangleHorizontal,
  Columns2,
  Armchair,
  Wind,
  Snowflake,
  SunDim,
  Thermometer,
  Fuel,
  CircleAlert,
  Disc,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CONTROL_GROUPS,
  COCKPIT_DRILL,
  TRANSMISSIONS,
  DRIVE_OFF_MANUAL,
  DRIVE_OFF_AUTO,
  type CarControl,
} from "@/lib/content/controls";
import { useStudyStore } from "@/hooks/use-study-store";
import { groupOf } from "@/lib/content/vehicle";
import {
  MOTORCYCLE_CONTROLS,
  HEAVY_CONTROLS,
  type VehicleControlItem,
} from "@/lib/content/vehicle-controls";
import { MotorcycleDiagram, HeavyDiagram } from "@/components/study/vehicle-controls-diagram";
import { cn, glass } from "@/lib/utils";

const GROUP_ICON: Record<string, LucideIcon> = {
  lights: Lightbulb,
  visibility: Eye,
  dashboard: Gauge,
};

/** Maps an `icon` name (control or transmission) to its lucide component. */
const ICONS: Record<string, LucideIcon> = {
  ArrowLeftRight,
  Sun,
  Volume2,
  TriangleAlert,
  CloudFog,
  Droplets,
  RectangleHorizontal,
  Columns2,
  Armchair,
  Wind,
  Snowflake,
  SunDim,
  Gauge,
  Thermometer,
  Fuel,
  CircleAlert,
  Disc,
  ShieldCheck,
  Cog,
  CircleDot,
};

function ControlIcon({ control }: { control: CarControl }) {
  const Icon = control.icon ? ICONS[control.icon] : null;
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      {Icon ? <Icon className="h-[1.05rem] w-[1.05rem]" /> : null}
    </span>
  );
}

/** A control row for the motorcycle / heavy reference list. */
function VehicleControlRow({ control }: { control: VehicleControlItem }) {
  return (
    <div className="py-4 first:pt-2 last:pb-0">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-medium text-foreground">{control.name}</h3>
        {control.inTest ? (
          <Badge variant="secondary" className="gap-1">
            <GraduationCap className="h-3 w-3" /> K53 test
          </Badge>
        ) : (
          <Badge variant="outline">Good to know</Badge>
        )}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground/80">Where: </span>
        {control.where}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground/80">What it does: </span>
        {control.does}
      </p>
    </div>
  );
}

export function ControlsGuide() {
  const { state } = useStudyStore();
  const group = state.onboarding ? groupOf(state.onboarding.vehicleCode) : "car";

  if (group !== "car") {
    const isMoto = group === "motorcycle";
    const controls = isMoto ? MOTORCYCLE_CONTROLS : HEAVY_CONTROLS;
    return (
      <div className="mx-auto max-w-3xl">
        <Link
          href="/study"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Study
        </Link>
        <PageHeader
          title={isMoto ? "Motorcycle controls" : "Heavy-vehicle controls"}
          description={
            isMoto
              ? "Every control on the bike — what it is, where it sits and what it does — including the hand and foot controls examiners check."
              : "The heavy-vehicle controls — air brakes, coupling and the cab controls — what each one is and how to use it safely."
          }
        />

        <Card className={cn(glass, "p-4 sm:p-6")}>
          <h2 className="font-display text-lg font-semibold">
            {isMoto ? "The controls of a motorcycle" : "The heavy-vehicle dashboard"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Layouts differ between makes and models, but the function of each control is the same.
          </p>
          <div
            className={cn(
              "mt-4 rounded-xl border border-border p-3 sm:p-5",
              // The motorcycle diagram uses a fixed manual-style palette (like
              // the car diagram's static image), so it needs a light backing
              // for contrast in dark mode — the heavy diagram tracks theme.
              isMoto ? "bg-white" : "bg-background/40",
            )}
          >
            {isMoto ? <MotorcycleDiagram /> : <HeavyDiagram />}
          </div>
        </Card>

        <Card className={cn(glass, "mt-6 p-6")}>
          <h2 className="font-display text-lg font-semibold">Every control explained</h2>
          <div className="mt-4 divide-y divide-border">
            {controls.map((c) => (
              <VehicleControlRow key={c.name} control={c} />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/study"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Study
      </Link>
      <PageHeader
        title="Car controls"
        description="What every control in the car is, what it does, and how to pull away — built on the K53 manual plus the everyday controls it leaves out."
      />

      {/* Labelled diagram from the manual */}
      <Card className={cn(glass, "p-4 sm:p-6")}>
        <h2 className="font-display text-lg font-semibold">The controls of a vehicle</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Straight from the K53 manual. Layouts differ between makes and models, but the function of
          each control is the same.
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/diagrams/car-controls.png"
            alt="Labelled diagram of a car's controls: mirrors, wiper, indicator, steering wheel, hooter, accelerator, foot brake, clutch, gear lever and parking brake"
            className="mx-auto w-full max-w-2xl"
          />
        </div>
      </Card>

      {/* Pre-drive cockpit drill */}
      <Card className={cn(glass, "mt-6 p-6")}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ClipboardCheck className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">Pre-drive cockpit drill</h2>
            <p className="text-sm text-muted-foreground">Set the car up before you move off.</p>
          </div>
        </div>
        <ol className="mt-5 space-y-3">
          {COCKPIT_DRILL.map((s) => (
            <li key={s.n} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-semibold text-primary">
                {s.n}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-foreground">{s.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {/* How to drive off */}
      <Card className={cn(glass, "mt-6 p-6")}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Play className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">How to pull away</h2>
            <p className="text-sm text-muted-foreground">Moving off smoothly in a manual car.</p>
          </div>
        </div>
        <ol className="mt-5 space-y-3">
          {DRIVE_OFF_MANUAL.map((s) => (
            <li key={s.n} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-semibold text-primary">
                {s.n}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-foreground">{s.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-5 rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">Driving an automatic?</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{DRIVE_OFF_AUTO}</p>
        </div>
      </Card>

      {/* Manual vs automatic */}
      <Card className={cn(glass, "mt-6 p-6")}>
        <h2 className="font-display text-lg font-semibold">Manual vs automatic</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The diagram above shows a manual. Here's how the two gearboxes differ.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {TRANSMISSIONS.map((t) => {
            const Icon = ICONS[t.icon] ?? Cog;
            return (
              <div key={t.type} className="rounded-xl border border-border bg-background/40 p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-base font-semibold">{t.type}</h3>
                </div>
                <p className="mt-2.5 text-sm text-muted-foreground">{t.summary}</p>
                <ul className="mt-3 space-y-1.5">
                  {t.points.map((p) => (
                    <li key={p} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Control groups */}
      {CONTROL_GROUPS.map((group) => {
        const Icon = GROUP_ICON[group.id] ?? Gauge;
        return (
          <Card key={group.id} className={cn(glass, "mt-6 p-6")}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold">{group.title}</h2>
                <p className="text-sm text-muted-foreground">{group.blurb}</p>
              </div>
            </div>
            <div className="mt-4 divide-y divide-border">
              {group.controls.map((c) => (
                <div key={c.name} className="flex gap-3 py-4 first:pt-2 last:pb-0">
                  <ControlIcon control={c} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-foreground">{c.name}</h3>
                      {c.inTest ? (
                        <Badge variant="secondary" className="gap-1">
                          <GraduationCap className="h-3 w-3" /> K53 test
                        </Badge>
                      ) : (
                        <Badge variant="outline">Good to know</Badge>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground/80">What it is: </span>
                      {c.what}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground/80">What it does: </span>
                      {c.use}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
