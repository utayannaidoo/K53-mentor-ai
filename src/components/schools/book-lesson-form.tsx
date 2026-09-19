import { ActionForm, Field } from "@/components/admin/action-form";
import { SelectField } from "@/components/schools/fields";
import { bookLesson } from "@/app/schools/diary-actions";
import type { SchoolContext } from "@/lib/schools/auth";
import {
  learnerName,
  vehicleLabel,
  type Instructor,
  type Learner,
  type Vehicle,
} from "@/lib/schools/diary-types";

/**
 * Book a lesson — or block out time — on the diary.
 *
 * An instructor books only for themselves, so they are not offered the
 * instructor picker at all; the owner and the office see everyone. The
 * database enforces the same rule, so hiding the picker is courtesy, not
 * security.
 */
export function BookLessonForm({
  school,
  learners,
  instructors,
  vehicles,
  day,
  defaultTime,
  defaultLearnerId,
  packageOptions = [],
}: {
  school: SchoolContext;
  learners: Learner[];
  instructors: Instructor[];
  vehicles: Vehicle[];
  day: string;
  defaultTime: string;
  defaultLearnerId?: string;
  /** Packages this booking can draw from, already labelled ("Thabo · 10 lessons, 6 left"). */
  packageOptions?: { value: string; label: string }[];
}) {
  const bookable = learners.filter((l) => l.status !== "passed" && l.status !== "left");
  const activeVehicles = vehicles.filter((v) => v.status === "active");

  return (
    <ActionForm action={bookLesson} submitLabel="Book it" pendingLabel="Booking…">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="What"
          name="kind"
          defaultValue="lesson"
          options={[
            { value: "lesson", label: "Lesson" },
            { value: "test", label: "Test (driver's)" },
            { value: "assessment", label: "Assessment" },
            { value: "block", label: "Blocked time (no learner)" },
          ]}
        />
        <SelectField
          label="Learner"
          name="learner_id"
          defaultValue={defaultLearnerId ?? ""}
          options={[
            { value: "", label: "— choose —" },
            ...bookable.map((l) => ({ value: l.id, label: learnerName(l) })),
          ]}
          hint={bookable.length === 0 ? "Add a learner first, under Learners." : undefined}
        />
        {school.role === "instructor" ? (
          <p className="self-end text-2xs text-muted-foreground sm:col-span-2">
            This goes on your own diary.
          </p>
        ) : (
          <SelectField
            label="Instructor"
            name="instructor_id"
            defaultValue={school.memberId}
            options={instructors.map((i) => ({ value: i.id, label: i.displayName }))}
          />
        )}
        <SelectField
          label="Vehicle"
          name="vehicle_id"
          defaultValue=""
          options={[
            { value: "", label: "No vehicle" },
            ...activeVehicles.map((v) => ({ value: v.id, label: vehicleLabel(v) })),
          ]}
        />
        <Field label="Date" name="day" type="date" defaultValue={day} required />
        <Field label="Start" name="time" type="time" defaultValue={defaultTime} required />
        <Field
          label="Minutes"
          name="minutes"
          type="number"
          defaultValue={school.defaultLessonMinutes}
          required
        />
        <Field label="Pickup address" name="pickup_address" placeholder="Where to fetch them" />
        <SelectField
          label="Pay from"
          name="package_id"
          defaultValue={packageOptions.length === 1 && defaultLearnerId ? packageOptions[0].value : ""}
          options={[{ value: "", label: "No package — price below" }, ...packageOptions]}
        />
        <Field
          label="Price (R)"
          name="price"
          placeholder="e.g. 350"
          hint="Charged once the lesson happens. Leave blank if it's on a package."
        />
      </div>
    </ActionForm>
  );
}
