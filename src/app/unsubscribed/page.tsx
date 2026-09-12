import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal-page";
import { SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Unsubscribed",
  description: "You have been removed from K53 Mentor AI emails.",
  robots: { index: false, follow: false },
};

/**
 * Where the one-click unsubscribe link lands. Three outcomes, said plainly —
 * a page that always claims success would be the one thing worse than the
 * emails.
 */
export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const status = (await searchParams).status;
  const failed = status === "error";
  const invalid = status === "invalid";

  return (
    <LegalPage
      title={failed || invalid ? "We couldn't unsubscribe you" : "You're unsubscribed"}
      intro={
        invalid
          ? "That link isn't valid — it may have been broken across two lines by your email app, or it belongs to a different address."
          : failed
            ? "Something went wrong on our side, so your address may still be on the list."
            : "We've removed your address. You won't get study reminders or plan emails from us again."
      }
    >
      <section>
        <h2>{failed || invalid ? "What to do" : "What this means"}</h2>
        {failed || invalid ? (
          <p>
            Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with the word
            &ldquo;unsubscribe&rdquo; and we&apos;ll take the address off by hand. A real person
            reads that inbox.
          </p>
        ) : (
          <p>
            This covers everything we send, including study reminders and plan emails. If you have
            an account, your progress is untouched — signing in still works, and you can turn
            reminders back on from your account page.
          </p>
        )}
      </section>
      <section>
        <h2>Changed your mind?</h2>
        <p>
          Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and ask us to put the
          address back. We don&apos;t re-add anyone automatically.
        </p>
      </section>
    </LegalPage>
  );
}
