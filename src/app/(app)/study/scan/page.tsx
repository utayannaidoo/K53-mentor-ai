import { PageHeader } from "@/components/app/app-shell";
import { SignScanner } from "@/components/study/sign-scanner";

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Sign scanner"
        description="Photograph any road sign and learn what it means — and what to do."
      />
      <SignScanner />
    </div>
  );
}
