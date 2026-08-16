import { Suspense } from "react";
import { MockExam } from "@/components/study/mock-exam";
import { DrivingLoader } from "@/components/ui/driving-loader";

export default function MockExamPage() {
  return (
    <Suspense fallback={<DrivingLoader label="Setting up your exam" />}>
      <MockExam />
    </Suspense>
  );
}
