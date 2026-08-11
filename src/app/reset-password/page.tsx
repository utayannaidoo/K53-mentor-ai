"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.resetPasswordForEmail(email, {
        // Land on the callback (which establishes the recovery session) then
        // forward to the page where the user actually sets a new password.
        // Built from the page's own origin — same reasoning as the checkout
        // callback: a stale NEXT_PUBLIC_SITE_URL must never send the reset
        // link to a different deployment than the one the user is on.
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password/update`,
      });
    }
    // Brief delay so the action feels real in demo mode.
    setTimeout(() => {
      setLoading(false);
      setSent(true);
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
