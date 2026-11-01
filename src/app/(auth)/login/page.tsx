import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Log in",
  description:
    "Log in to K53 Mentor AI to continue your K53 study plan, practice questions and mock exams.",
  // A form, not content: kept out of the index and the sitemap.
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <AuthShell>
      <AuthForm mode="login" />
    </AuthShell>
  );
}
