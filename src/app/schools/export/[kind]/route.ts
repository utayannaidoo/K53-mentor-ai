import { isSupabaseConfigured } from "@/lib/env";
import { requireSchool } from "@/lib/schools/auth";
import { DEMO_SCHOOL } from "@/lib/schools/demo";
import { exportCsv, isExportKind } from "@/lib/schools/export";
import { schoolDay } from "@/lib/schools/time";

export const runtime = "nodejs";

/**
 * Download a school's records as CSV. The owner and office staff only — an
 * export is every learner's phone number in one file, which an instructor has
 * no need to carry around. Works on a read-only workspace: a lapsed school
 * keeps its records, and so does one about to close.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!isExportKind(kind)) return new Response("Not found", { status: 404 });

  let school = DEMO_SCHOOL;
  if (isSupabaseConfigured) {
    const guard = await requireSchool({ roles: ["owner", "assistant"] });
    if (!guard.ok) return new Response(guard.message, { status: 403 });
    school = guard.school;
  }

  let csv: string;
  try {
    csv = await exportCsv(school, kind);
  } catch (err) {
    console.error("[schools] export failed", kind, err);
    return new Response("The export could not be made. Please try again.", { status: 500 });
  }

  const day = schoolDay(new Date(), school.timezone);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${school.slug || "school"}-${kind}-${day}.csv"`,
      // A point-in-time copy of personal information: never cached anywhere.
      "cache-control": "no-store",
    },
  });
}
