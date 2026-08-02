"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudyStore } from "@/hooks/use-study-store";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { track } from "@/lib/analytics";
import { isPasswordValid } from "@/lib/auth/password";
import { shouldAuthPageSelfRedirect } from "@/lib/auth/auth-page-redirect";
import { PasswordRequirements } from "@/components/auth/password-requirements";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { signInLocal, isAuthed, ready } = useStudyStore();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // Signup succeeded but Supabase requires email confirmation before a
  // session exists — show the "check your inbox" panel instead of redirecting
  // into an app the middleware would immediately bounce back to /login.
  const [awaitingConfirmation, setAwaitingConfirmation] = React.useState(false);
  // Login was refused because the address is still unverified — offer a new
  // link instead of leaving the user stuck on a password they typed correctly.
  const [unconfirmed, setUnconfirmed] = React.useState(false);
  const [resent, setResent] = React.useState(false);
  // Why the auth callback sent them back here (expired link, wrong browser…).
  const [linkError, setLinkError] = React.useState<string | null>(null);

  // Enforce the password policy on real signups only. Login must never apply it
  // (existing accounts predate the rules), and demo mode's "any password works"
  // promise stays intact when Supabase isn't configured.
  const enforcePassword = mode === "signup" && isSupabaseConfigured;

  // Landing pricing buttons arrive as /signup?plan=…&cycle=…. Carry that choice
  // through auth so the user lands straight in that plan's checkout; the billing
  // page skips the charge if they already have a paid plan. Without a plan, fall
  // back to the normal post-auth router. (`track` used to ride along here too —
  // one plan now covers every licence code, so an old link's stray param is
  // simply dropped.)
  function postAuthDest(): string {
    const p = new URLSearchParams(window.location.search);
    const plan = p.get("plan");
    if (plan === "premium" || plan === "premium_plus") {
      const q = new URLSearchParams({ buy: plan });
      const c = p.get("cycle");
      if (c) q.set("cycle", c);
      return `/account/billing?${q.toString()}`;
    }
    return "/continue";
  }

  // Preserve the plan choice when switching between the login / signup links.
  const [linkQuery, setLinkQuery] = React.useState("");
  React.useEffect(() => setLinkQuery(window.location.search), []);

  // /auth/callback redirects here with a reason when a confirmation or reset
  // link can't be completed. Silence without explanation reads as "email
  // verification is broken", so always say which failure it was.
  React.useEffect(() => {
    // The callback only ever bounces to /login, and the copy below says so.
    if (mode !== "login") return;
    const reason = new URLSearchParams(window.location.search).get("error");
    if (!reason) return;
    setLinkError(
      reason === "expired"
        ? "That link has expired or was already used. Log in below — we'll send a fresh one if your email still needs confirming."
        : reason === "device"
          ? "That link has to be opened in the same browser you signed up in. Log in below and we'll email you a new one that works anywhere."
          : "We couldn't finish that sign-in. Try logging in below.",
    );
  }, [mode]);

  // Already signed in — hand off to the post-auth destination (checkout if a
  // plan was chosen, otherwise the router that decides onboarding vs dashboard).
  //
  // Demo mode only. In production the middleware makes this call server-side
  // before the page renders, and `isAuthed` is a localStorage flag that
  // outlives the auth cookie — trusting it here loops /login → /continue →
  // /dashboard → /login until WebKit's history throttle throws.
  // See shouldAuthPageSelfRedirect.
  React.useEffect(() => {
    if (shouldAuthPageSelfRedirect({ ready, isAuthed, supabaseConfigured: isSupabaseConfigured }))
      router.replace(postAuthDest());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isAuthed, router]);

  // A referral link (/signup?ref=CODE) parks the code until the account
  // exists; the study store claims it right after the first sign-in.
  React.useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref && /^[a-z0-9]{4,16}$/i.test(ref)) {
      try {
        window.localStorage.setItem("k53.ref", ref.toLowerCase());
      } catch {
        /* private mode */
      }
    }
  }, []);

  /** Where Supabase should send someone after they click an emailed link. */
  function confirmRedirect(): string {
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(postAuthDest())}`;
  }

  async function resendConfirmation() {
    const supabase = createClient();
    if (!supabase) return;
    setError(null);
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: confirmRedirect() },
    });
    if (resendError) setError(resendError.message);
    else setResent(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLinkError(null);
    setUnconfirmed(false);
    setResent(false);

    // Catch a weak password here so the user gets inline guidance instead of a
    // server-side rejection after the round-trip.
    if (enforcePassword && !isPasswordValid(password)) {
      setError("Your password doesn't meet all the requirements below yet.");
      return;
    }
    setLoading(true);

    // Production path: real Supabase auth when configured.
    const supabase = createClient();
    if (supabase) {
      const { data, error: authError } =
        mode === "signup"
          ? await supabase.auth.signUp({
              email,
              password,
              options: {
                data: { full_name: name },
                // The confirmation link lands on our callback, which exchanges
                // the code and forwards to the post-auth destination — same
                // pattern as the Google OAuth redirect below.
                emailRedirectTo: confirmRedirect(),
              },
            })
          : await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        // The password was right; the address just isn't verified yet. Say so
        // in plain language and put a fresh link one tap away.
        if (/email not confirmed|not confirmed/i.test(authError.message)) {
          setUnconfirmed(true);
          setError(null);
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }
      // Email confirmation is on: the account exists but there's no session
      // yet, so entering the app now would just bounce off the middleware.
      if (mode === "signup" && !data.session) {
        track("signup_completed", { method: "password" });
        setAwaitingConfirmation(true);
        setLoading(false);
        return;
      }
    }

    // Demo path / mirror profile into the local store.
    if (mode === "signup") track("signup_completed", { method: "password" });
    signInLocal(name || email.split("@")[0] || "Learner", email || "demo@k53mentor.ai");
    router.push(postAuthDest());
  }

  function continueAsGuest() {
    signInLocal("Demo learner", "demo@k53mentor.ai");
    router.push("/continue");
  }

  async function continueWithGoogle() {
    const supabase = createClient();
    if (!supabase) return;
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // The callback route exchanges the code and forwards to the post-auth
        // destination (checkout if a plan was chosen, else the routing handoff).
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(postAuthDest())}`,
      },
    });
    if (oauthError) setError(oauthError.message);
  }

  if (awaitingConfirmation) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ve sent a confirmation link to{" "}
          <span className="font-medium text-foreground">{email}</span>. Click it to activate
          your account, then log in.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Already confirmed?{" "}
          <Link href={`/login${linkQuery}`} className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      {linkError && (
        <p className="mb-5 rounded-xl border border-warning/30 bg-warning/[0.06] p-3 text-sm leading-relaxed text-foreground">
          {linkError}
        </p>
      )}
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        {mode === "signup" ? "Create your free account" : "Welcome back"}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {mode === "signup"
          ? "Save your readiness score and study plan."
          : "Log in to pick up where you left off."}
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Thando Mokoena" autoComplete="name" />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {mode === "login" && (
              <Link href="/reset-password" className="text-xs text-primary hover:underline">
                Forgot?
              </Link>
            )}
          </div>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === "signup" ? "new-password" : "current-password"} />
          {enforcePassword && <PasswordRequirements password={password} className="pt-1" />}
        </div>

        {/* role="alert" so screen readers actually announce the failure — this
            was silent text before, and it's the only feedback on a bad login. */}
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        {unconfirmed && (
          <div className="rounded-xl border border-warning/30 bg-warning/[0.06] p-3 text-sm leading-relaxed">
            {resent ? (
              <>
                New confirmation link sent to{" "}
                <span className="font-medium">{email}</span>. Open it, then log in here.
              </>
            ) : (
              <>
                <p>This email still needs confirming — check your inbox (and spam) for the link.</p>
                <button
                  type="button"
                  onClick={resendConfirmation}
                  className="mt-1.5 font-medium text-primary hover:underline"
                >
                  Send it again
                </button>
              </>
            )}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={loading}
          loadingText={mode === "signup" ? "Creating account…" : "Logging in…"}
        >
          {mode === "signup" ? "Create account" : "Log in"}
          <ArrowRight />
        </Button>

        {/* POPIA: consent belongs at the point of collection, not buried in a
            footer. Shown on signup only — the account already exists at login. */}
        {mode === "signup" && (
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        )}
      </form>

      {/* Google OAuth — production only (needs the Supabase Google provider
          enabled). The callback route lands the session and forwards on. */}
      {isSupabaseConfigured && (
        <>
          <div className="my-5 flex items-center gap-3 text-2xs uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <Button type="button" variant="outline" size="lg" className="w-full gap-2.5" onClick={continueWithGoogle}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.02.15 3.5 2.7.24.03c2.2-2.1 3.5-5.1 3.5-8.6z" />
              <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2a7.2 7.2 0 0 1-6.8-5l-.14.01-3.7 2.8-.05.13A12 12 0 0 0 12 24z" />
              <path fill="#FBBC05" d="M5.2 14.4a7.4 7.4 0 0 1 0-4.7l-.01-.16-3.7-2.9-.12.06a12 12 0 0 0 0 10.7l3.9-3z" />
              <path fill="#EB4335" d="M12 4.7c2.3 0 3.9 1 4.8 1.8l3.5-3.4C18 1.2 15.2 0 12 0A12 12 0 0 0 1.3 6.7l3.9 3a7.2 7.2 0 0 1 6.8-5z" />
            </svg>
            Continue with Google
          </Button>
        </>
      )}

      {/* Guest access is a demo-only convenience — in production every user
          signs up, so tier and usage always have a real account behind them. */}
      {!isSupabaseConfigured && (
        <>
          <div className="my-5 flex items-center gap-3 text-2xs uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <Button type="button" variant="outline" size="lg" className="w-full" onClick={continueAsGuest}>
            Continue as demo guest
          </Button>

          <p className="mt-3 text-center text-2xs text-muted-foreground">
            Demo mode — any email &amp; password works, and your progress saves to this browser.
          </p>
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href={`/login${linkQuery}`} className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href={`/signup${linkQuery}`} className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
