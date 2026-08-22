import type { Metadata } from "next";

/**
 * The reset flow is a functional URL — it arrives by email link carrying a
 * token, and `/update` is meaningless without one. Left indexable, crawlers
 * filed both as thin pages and the update variant could surface in results for
 * "reset password" queries, sending people to a dead form.
 */
export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
