import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { SchoolContext } from "@/lib/schools/auth";
import { DEMO_ENQUIRIES, DEMO_TEST_RESULTS } from "@/lib/schools/demo";
import type { Enquiry, EnquiryStatus, TestResult } from "@/lib/schools/test-day";

/**
 * Reads for the two ends of a learner's time with a school: the enquiry that
 * came before they signed up, and the tests that end it (0039). Through the
 * signed-in user's own client, like every school read.
 */

const ENQUIRY_COLUMNS =
  "id, name, phone, email, source, licence_code, message, status, next_follow_up_on, converted_learner_id, created_at";
const RESULT_COLUMNS = "id, learner_id, test_type, taken_on, centre, result, instructor_id, notes";

async function client() {
  return isSupabaseConfigured ? await createClient() : null;
}

export async function schoolEnquiries(
  school: SchoolContext,
  statuses?: EnquiryStatus[],
): Promise<Enquiry[]> {
  const supabase = await client();
  if (!supabase) {
    return statuses ? DEMO_ENQUIRIES.filter((e) => statuses.includes(e.status)) : DEMO_ENQUIRIES;
  }
  let query = supabase
    .from("school_enquiries")
    .select(ENQUIRY_COLUMNS)
    .eq("school_id", school.schoolId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (statuses) query = query.in("status", statuses);
  const { data } = await query;
  return (data ?? []) as Enquiry[];
}

export async function learnerTestResults(school: SchoolContext, learnerId: string): Promise<TestResult[]> {
  const supabase = await client();
  if (!supabase) {
    // Newest first, like the query below — so demo mode shows what production shows.
    return DEMO_TEST_RESULTS.filter((r) => r.learner_id === learnerId).sort((x, y) =>
      y.taken_on.localeCompare(x.taken_on),
    );
  }
  const { data } = await supabase
    .from("school_test_results")
    .select(RESULT_COLUMNS)
    .eq("school_id", school.schoolId)
    .eq("learner_id", learnerId)
    .order("taken_on", { ascending: false });
  return (data ?? []) as TestResult[];
}

/** Every result since a day — for pass rates. */
export async function schoolTestResults(school: SchoolContext, sinceDay: string): Promise<TestResult[]> {
  const supabase = await client();
  if (!supabase) {
    return DEMO_TEST_RESULTS.filter((r) => r.taken_on >= sinceDay).sort((x, y) =>
      y.taken_on.localeCompare(x.taken_on),
    );
  }
  const { data } = await supabase
    .from("school_test_results")
    .select(RESULT_COLUMNS)
    .eq("school_id", school.schoolId)
    .gte("taken_on", sinceDay)
    .order("taken_on", { ascending: false });
  return (data ?? []) as TestResult[];
}
