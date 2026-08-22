"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkAuthAttempt, recordAuthResult } from "@/lib/auth/client-throttle";

export default function ResetPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [errorCopy, setErrorCopy] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorCopy(null);
    // Soft client-side backoff under GoTrue's own limits (see client-throttle)
    // — reset requests are email-bomb bait. Fails open; GoTrue stays the hard
    // gate. Checked before setLoading so a blocked tap never shows the spinner.
    const gate = checkAuthAttempt("reset");
    if (!gate.allowed) {
      const mins = Math.max(1, Math.ceil(gate.retryAfterS / 60));
      setErrorCopy(
        `Too many attempts — please wait ${mins} minute${mins === 1 ? "" : "s"} before trying again.`,
      );
      return;
    }
    setLoading(true);
    // The result was never checked, so rate-limited requests and SMTP outages
    // both landed on "Check your email" — a promise nothing would keep.
    // Enumeration-safety stays intact: an unknown address still shows the same
    // success screen as a known one. Rate limiting and transport failures are
    // different — they fail whatever the address, so naming them helps the
    // real user and leaks nothing about accounts.
    let failure: string | null = null;
    // Land on the callback (which establishes the recovery session) then
    // forward to the page where the user actually sets a new password.
    // Built from the page's own origin — same reasoning as the checkout
    // callback: a stale NEXT_PUBLIC_SITE_URL must never send the reset
    // link to a different deployment than the one the user is on.
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password/update`;
    try {
      // Proxied through /api/auth/request-reset so the server can apply a real
      // per-IP daily cap; the route replays this through the SSR client, which
      // keeps the PKCE code_verifier in cookies exactly as before.
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo }),
      });
      if (res.ok) {
        recordAuthResult("reset", true);
      } else if (res.status === 429) {
        recordAuthResult("reset", false);
        failure = "Too many reset emails have been requested just now. Please wait a few minutes and try again.";
      } else {
        recordAuthResult("reset", false);
        failure = "We couldn't send the email just now. Please check your connection and try again.";
      }
    } catch {
      recordAuthResult("reset", false);
      failure = "We couldn't send the email just now. Please check your connection and try again.";
    }
    // Brief delay so the action feels real in demo mode.
    setTimeout(() => {
      setLoading(false);
      if (failure) setErrorCopy(failure);
      else setSent(true);
    }, 500);
  }

  return (
    <AuthShell>
      {sent ? (
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/12 text-success">
            <MailCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists for <span className="font-medium text-foreground">{email}</span>,
            we&apos;ve sent a link to reset your password.
          </p>
          {/*
            Unlike the confirmation and magic-link emails, this one is a PKCE
            link: the verifier lives in this browser's cookies, so it can only
            be completed here. That is deliberate — the recovery session it
            produces is what /reset-password/update expects — which makes it a
            thing to explain rather than fix. Said here, before they walk off to
            their phone, because afterwards the only remedy is starting over.
          */}
          <p className="mt-5 rounded-xl border border-warning/30 bg-warning/[0.06] p-3 text-left text-sm leading-relaxed text-foreground">
            <span className="font-medium">Open the link on this device.</span>{" "}
            A password reset link only works in the browser that asked for it. If you open it
            somewhere else, come back here and request a new one.
          </p>
          <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to log in
          </Link>
        </div>
      ) : (
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Reset your password</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link.
          </p>
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {errorCopy && (
              <p
                role="alert"
                className="rounded-xl border border-danger/30 bg-danger/[0.06] p-3 text-sm leading-relaxed text-danger"
              >
                {errorCopy}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loading}
              loadingText="Sending…"
            >
              Send reset link
            </Button>
          </form>
          <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to log in
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
