"use client";

import * as React from "react";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * The way out of a dead end.
 *
 * Every screen that can strand a learner — a crashed boundary, a 404, a
 * checkout that will not start — renders this. Before it existed the support
 * address appeared on /contact, /refunds and /unsubscribed only, and /contact
 * is linked from the marketing footer, which the signed-in app shell does not
 * render: someone whose study page had just crashed had no route to a human
 * short of guessing a URL.
 *
 * The mailto arrives addressed, subject-lined and carrying the two facts we
 * would otherwise have to ask for — which page, and the error digest that ties
 * the report to a server log line. `window.location` is read after mount so the
 * server and first client render agree; the link works without it, it just
 * arrives with less context.
 */
export function supportMailtoHref({
  subject,
  reference,
  path,
}: {
  subject?: string;
  reference?: string;
  path?: string;
} = {}): string {
  const body = [
    "What happened:",
    "",
    "",
    "(Anything you can add helps — what you tapped, and what you saw.)",
    "",
    "— — — — —",
    path ? `Page: ${path}` : null,
    reference ? `Reference: ${reference}` : null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    subject ?? "K53 Mentor — I need help",
  )}&body=${encodeURIComponent(body)}`;
}

export function SupportLink({
  subject,
  reference,
  className,
  children,
}: {
  subject?: string;
  /** Error digest, transaction id — anything that ties the mail to a log line. */
  reference?: string;
  className?: string;
  /** Link text. Defaults to the address itself, which is the point. */
  children?: React.ReactNode;
}) {
  const [path, setPath] = React.useState<string | null>(null);
  React.useEffect(() => {
    setPath(window.location.pathname + window.location.search);
  }, []);

  return (
    <a
      href={supportMailtoHref({ subject, reference, path: path ?? undefined })}
      className={cn("font-medium text-primary underline underline-offset-2 hover:opacity-80", className)}
    >
      {children ?? SUPPORT_EMAIL}
    </a>
  );
}

/**
 * The standard one-line sign-off for an error surface. Deliberately quiet —
 * it sits under the retry, not in place of it, because most of these screens
 * recover on a reload and an email is the second thing to try, not the first.
 */
export function SupportLine({
  subject,
  reference,
  className,
  lead = "Still stuck?",
}: {
  subject?: string;
  reference?: string;
  className?: string;
  lead?: string;
}) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      {lead} Email <SupportLink subject={subject} reference={reference} /> and we&apos;ll help.
    </p>
  );
}
