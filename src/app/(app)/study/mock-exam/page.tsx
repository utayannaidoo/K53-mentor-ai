import { Suspense } from "react";
import { MockExam } from "@/components/study/mock-exam";
import { DrivingLoader } from "@/components/ui/driving-loader";

export default async function MockExamPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; section?: string }>;
}) {
  // Keying on mode/section remounts the paper picker when a query-only
  // navigation lands here — e.g. a failed mock's "Close the Signs gap" drill
  // link while already on this route. The component reads its config from the
  // URL once at mount and would otherwise stay parked on the results screen.
  const { mode, section } = await searchParams;
  return (
    <Suspense fallback={<DrivingLoader label="Setting up your exam" />}>
      <MockExam key={`${mode ?? ""}-${section ?? ""}`} />
    </Suspense>
  );
}
