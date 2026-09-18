/**
 * Test day: what to bring, and how the school's learners have done.
 *
 * The documents list is the fixed set 0039 accepts, in the order a learner
 * should gather them. Missing one at the testing centre is a wasted booking
 * and a lost fee, which is the whole reason the checklist exists.
 */

export const TEST_DOCUMENTS = [
  { id: "id_copy", label: "ID (original and a certified copy)" },
  { id: "proof_of_address", label: "Proof of address" },
  { id: "learners_licence", label: "Learner's licence" },
  { id: "eye_test", label: "Eye test" },
  { id: "photos", label: "ID photos" },
] as const;

export type TestDocument = (typeof TEST_DOCUMENTS)[number]["id"];

export function isTestDocument(value: string): value is TestDocument {
  return TEST_DOCUMENTS.some((d) => d.id === value);
}

export type EnquiryStatus = "new" | "contacted" | "booked" | "lost";
export type EnquirySource = "walk_in" | "phone" | "whatsapp" | "website" | "referral" | "other";

export const SOURCE_LABEL: Record<EnquirySource, string> = {
  walk_in: "Walk-in",
  phone: "Phone call",
  whatsapp: "WhatsApp",
  website: "Website",
  referral: "Referral",
  other: "Other",
};

export interface Enquiry {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: EnquirySource;
  licence_code: string | null;
  message: string | null;
  status: EnquiryStatus;
  next_follow_up_on: string | null;
  converted_learner_id: string | null;
  created_at: string;
}

export interface TestResult {
  id: string;
  learner_id: string;
  test_type: "learners" | "drivers";
  taken_on: string;
  centre: string | null;
  result: "passed" | "failed";
  instructor_id: string | null;
  notes: string | null;
}

/**
 * An open enquiry to act on today: new ones straight away, contacted ones
 * once their follow-up date arrives (or if nobody set one).
 */
export function isDueToday(enquiry: Enquiry, today: string): boolean {
  if (enquiry.status === "new") return true;
  if (enquiry.status !== "contacted") return false;
  return !enquiry.next_follow_up_on || enquiry.next_follow_up_on <= today;
}

/**
 * Pass rate over a window, counting every ATTEMPT. A learner who fails twice
 * then passes is one pass in three — which is the honest number, and the one
 * a school can defend if a parent asks where its "94%" came from.
 */
export function passRate(
  results: TestResult[],
  sinceDay: string,
  testType: TestResult["test_type"] = "drivers",
): { passed: number; attempts: number; rate: number | null } {
  const inWindow = results.filter((r) => r.test_type === testType && r.taken_on >= sinceDay);
  const passed = inWindow.filter((r) => r.result === "passed").length;
  return {
    passed,
    attempts: inWindow.length,
    rate: inWindow.length === 0 ? null : passed / inWindow.length,
  };
}
