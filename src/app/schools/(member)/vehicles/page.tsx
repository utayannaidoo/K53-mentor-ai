import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, glass, glassSubtle, formatDate } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { currentSchool } from "@/lib/schools/auth";
import { DEMO_SCHOOL } from "@/lib/schools/demo";
import { schoolVehicles } from "@/lib/schools/diary";
import { schoolDay } from "@/lib/schools/time";
import { vehicleLabel } from "@/lib/schools/diary-types";
import { ActionForm, Field } from "@/components/admin/action-form";
import { SelectField } from "@/components/schools/fields";
import { addVehicle } from "@/app/schools/diary-actions";

export const metadata: Metadata = { title: "Vehicles" };

const GROUP_LABEL = { car: "Car", motorcycle: "Motorcycle", heavy: "Heavy" } as const;
const STATUS_LABEL = { active: "In use", in_service: "At the garage", retired: "Retired" } as const;

/** Days from `today` until a `YYYY-MM-DD`, as calendar days. */
function daysUntil(today: string, date: string): number {
  return Math.round((Date.parse(`${date}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 86_400_000);
}

/**
 * The fleet. Every car, bike and truck the school books lessons in — so the
 * diary can stop two instructors taking the same one, and so a licence disc
 * about to expire is noticed before a traffic officer notices it.
 */
export default async function SchoolVehicles() {
  const school = (isSupabaseConfigured ? await currentSchool() : DEMO_SCHOOL)!;
  const vehicles = await schoolVehicles(school);
  const today = schoolDay(new Date(), school.timezone);
  const canManage = school.access === "full" && school.role !== "instructor";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Vehicles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {vehicles.length === 0
            ? "None yet"
            : `${vehicles.filter((v) => v.status === "active").length} in use`}
        </p>
      </div>

      {vehicles.length === 0 ? (
        <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
          Add each vehicle you teach in. Once a lesson has a vehicle on it, nobody else can book
          that vehicle for the same time.
        </Card>
      ) : (
        <Card className={cn(glass, "divide-y divide-border/50")}>
          {vehicles.map((vehicle) => {
            const days = vehicle.licence_disc_expires_on
              ? daysUntil(today, vehicle.licence_disc_expires_on)
              : null;
            return (
              <div key={vehicle.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 flex-1 truncate font-medium">{vehicleLabel(vehicle)}</span>
                  <Badge variant="outline">{GROUP_LABEL[vehicle.vehicle_group]}</Badge>
                  {vehicle.status !== "active" ? (
                    <Badge variant="secondary">{STATUS_LABEL[vehicle.status]}</Badge>
                  ) : null}
                  {days !== null && days < 0 ? (
                    <Badge variant="danger">disc expired</Badge>
                  ) : days !== null && days <= 30 ? (
                    <Badge variant="warning">disc due in {days}d</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-2xs text-muted-foreground">
                  {vehicle.transmission === "automatic" ? "Automatic" : "Manual"}
                  {vehicle.licence_disc_expires_on
                    ? ` · licence disc ${formatDate(vehicle.licence_disc_expires_on)}`
                    : ""}
                </p>
              </div>
            );
          })}
        </Card>
      )}

      {canManage ? (
        <details className="group" open={vehicles.length === 0}>
          <summary className="cursor-pointer list-none">
            <span className={cn(buttonVariants(), "press")}>Add a vehicle</span>
          </summary>
          <Card className={cn(glass, "mt-3 p-5")}>
            <ActionForm action={addVehicle} submitLabel="Add vehicle" pendingLabel="Adding…">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Registration" name="registration" placeholder="ND 123-456" required />
                <SelectField
                  label="Type"
                  name="vehicle_group"
                  defaultValue="car"
                  options={[
                    { value: "car", label: "Car (code 8)" },
                    { value: "motorcycle", label: "Motorcycle (code A/A1)" },
                    { value: "heavy", label: "Heavy (code 10/14)" },
                  ]}
                />
                <Field label="Make" name="make" placeholder="VW" />
                <Field label="Model" name="model" placeholder="Polo Vivo" />
                <SelectField
                  label="Gearbox"
                  name="transmission"
                  defaultValue="manual"
                  options={[
                    { value: "manual", label: "Manual" },
                    { value: "automatic", label: "Automatic" },
                  ]}
                />
                <Field label="Licence disc expires" name="licence_disc_expires_on" type="date" />
              </div>
            </ActionForm>
          </Card>
        </details>
      ) : school.role === "instructor" ? (
        <p className="text-2xs text-muted-foreground">The owner or office manages the fleet.</p>
      ) : null}
    </div>
  );
}
