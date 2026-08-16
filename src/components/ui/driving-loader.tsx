"use client";

import * as React from "react";
import { Car, Bike, Truck } from "lucide-react";
import { useStudyStore } from "@/hooks/use-study-store";
import { groupOf, type VehicleGroup } from "@/lib/content/vehicle";
import { studyCodeOf } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

/**
 * The wait before a study session opens, shown as the learner's own vehicle
 * holding a lane.
 *
 * Reuses the shell's vehicle mapping rather than a second one: a motorcycle
 * learner waits behind a bike, a Code 10/14 learner behind a truck. Never
 * replaces the app-shell skeleton or a button spinner — this is for the moment
 * a session is being built, not for every wait in the app.
 */
const VEHICLE_ICON = { car: Car, motorcycle: Bike, heavy: Truck } as const;

export function DrivingLoader({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const { state } = useStudyStore();
  const group: VehicleGroup = groupOf(studyCodeOf(state));
  // An undefined lookup here renders as a component and throws — the same
  // crash `groupOf` documents. Belt and braces, exactly as the shell does it.
  const Vehicle = VEHICLE_ICON[group] ?? Car;

  return (
    <div
      role="status"
      // The loader is built the moment the boundary mounts and simply waits
      // out of sight. At 350ms it cuts in whole — no fade, nothing assembling
      // itself in front of the learner — and the vehicle pulls away from frame
      // one, because `reveal`, `drive` and `bob` share the same delay. A warm
      // route unmounts this before any of them fire, so a fast load still shows
      // nothing at all.
      className={cn("flex animate-reveal justify-center py-20", className)}
    >
      <div className="relative h-9 w-28 overflow-hidden" aria-hidden>
        {/* Centring lives on the wrapper so the bob keyframes own the icon's
            transform outright. With no base transform to fight, the resting
            frame is simply "not animating" — which is what reduced motion
            leaves behind once it forces the animation to a single 0.001ms run. */}
        <span className="absolute left-1/2 top-0.5 -translate-x-1/2">
          <Vehicle className="h-6 w-6 animate-bob text-primary" />
        </span>
        {/* Twice the stage width so the strip never runs out mid-loop. */}
        <span className="road-dashes absolute bottom-2 left-0 h-0.5 w-[200%] animate-drive" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
