import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal-page";
import { APP_NAME, BUSINESS, SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact us",
  description: `How to reach ${APP_NAME} — support, billing questions, and privacy requests.`,
};

/**
 * Exists because every other route to us is behind a login.
 *
 * The privacy policy points people at their account page to exercise POPIA
 * rights, which is fine until the person asking is signed out, has been locked
 * out, or never had an account and simply wants to know what we hold. That is
 * exactly who a data-access request comes from, so it needs a door on the
 * public side of the app. ECTA s43 wants the operator details below on a
 * reachable page too.
 */
export default function ContactPage() {
  const hasBusinessDetails = Boolean(BUSINESS.legalName || BUSINESS.address);

  return (
    <LegalPage
      title="Contact us"
      intro="A real person reads this inbox. Whether it's a payment that went wrong, a question the app got wrong, or a request to see what we hold about you — this is the way in."
    >
      <section>
        <h2>Email</h2>
        <p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline">
            {SUPPORT_EMAIL}
          </a>
        </p>
        <p>
          We aim to reply within one business day. Billing and refund questions are usually
          resolved same-day — if it's about a payment, include the email address you paid with
          so we can find the transaction.
        </p>
      </section>

      <section>
        <h2>Refunds &amp; cancellations</h2>
        <p>
          You can cancel yourself at any time from Account → Billing, and there is a 7-day
          money-back window on a first subscription. The full policy, including what happens to
          access after you cancel, is on the{" "}
          <a href="/refunds" className="underline">
            refunds page
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Privacy requests (POPIA)</h2>
        <p>
          Under the Protection of Personal Information Act you may ask what personal information
          we hold about you, ask us to correct it, or ask us to delete it. Email the address
          above with &ldquo;POPIA request&rdquo; in the subject line — you do not need an account
          to ask, and we will not charge you for it.
        </p>
        <p>
          If you do have an account, the fastest route is Account → Delete account, which erases
          your personal information directly. Details of what we collect and who processes it are
          in the{" "}
          <a href="/privacy" className="underline">
            privacy policy
          </a>
          .
        </p>
        {BUSINESS.informationOfficer && (
          <p>
            Our Information Officer is {BUSINESS.informationOfficer}. If you are not satisfied
            with how we handle your request, you may complain to the Information Regulator of
            South Africa.
          </p>
        )}
      </section>

      {hasBusinessDetails && (
        <section>
          <h2>Who you&apos;re dealing with</h2>
          <ul>
            {BUSINESS.legalName && (
              <li>
                <strong>{BUSINESS.legalName}</strong>
                {BUSINESS.registrationNumber && ` (registration ${BUSINESS.registrationNumber})`}
              </li>
            )}
            {BUSINESS.address && <li>{BUSINESS.address}</li>}
            <li>{SUPPORT_EMAIL}</li>
          </ul>
        </section>
      )}

      <section>
        <h2>What we can&apos;t help with</h2>
        <p>
          We are not affiliated with the RTMC, the Department of Transport, or any Driving Licence
          Testing Centre, so we cannot book your test, change a booking, look up a result, or
          influence one. For any of those, contact your DLTC directly.
        </p>
      </section>
    </LegalPage>
  );
}
