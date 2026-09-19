/**
 * What a diary write says when the database refuses it.
 *
 * The database is where the diary's rules live (0036): the double-booking
 * guard, the cross-school foreign keys, row-level security. So those refusals
 * are the normal path, not edge cases, and each one needs a sentence an
 * instructor standing next to a car can act on. Anything unrecognised falls
 * back rather than showing Postgres text.
 */
export type DiaryErrorKind =
  | "instructor_clash"
  | "vehicle_clash"
  | "not_allowed"
  | "wrong_school"
  | "bad_times"
  | "duplicate"
  | "unknown";

export function classifyDiaryError(error: { code?: string; message?: string } | null): DiaryErrorKind {
  if (!error) return "unknown";
  const message = error.message ?? "";
  switch (error.code) {
    case "23P01":
      return message.includes("no_vehicle_overlap") ? "vehicle_clash" : "instructor_clash";
    case "42501":
      return "not_allowed";
    case "23503":
      return "wrong_school";
    case "23514":
      return "bad_times";
    case "23505":
      return "duplicate";
    default:
      return "unknown";
  }
}

export function diaryErrorMessage(
  error: { code?: string; message?: string } | null,
  fallback: string,
): string {
  switch (classifyDiaryError(error)) {
    case "instructor_clash":
      return "That instructor already has something booked at that time.";
    case "vehicle_clash":
      return "That vehicle is already booked at that time.";
    case "not_allowed":
      return "That isn't allowed for your role, or the workspace is read-only.";
    case "wrong_school":
      return "That learner, vehicle or instructor isn't part of your school.";
    case "bad_times":
      return "Check the details: a lesson needs a learner, and has to end after it starts.";
    case "duplicate":
      return "That's already on your list.";
    default:
      return fallback;
  }
}
