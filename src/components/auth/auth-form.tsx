"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLocalProvider, useAuthLocal } from "@/components/auth/auth-local-provider";
import { isSupabaseConfigured } from "@/lib/env";
import { track } from "@/lib/analytics";
import { isPasswordValid } from "@/lib/auth/password";
import { checkAuthAttempt, recordAuthResult, type ThrottleSurface } from "@/lib/auth/client-throttle";
import { shouldAuthPageSelfRedirect } from "@/lib/auth/auth-page-redirect";
import { safeNextPath } from "@/lib/auth/safe-next";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { SITE_DOMAIN } from "@/lib/constants";

// AuthForm brings its own provider. The auth pages live in the (auth) route
// group, whose layout deliberately mounts nothing (that is the point — see
// that layout), so the form self-supplies the tiny localStorage context its
// three reads need instead of leaning on the app-wide study store.

/** Friendly backoff copy for a blocked attempt (client-throttle gate). */
function tooManyAttemptsCopy(retryAfterS: number): string {
  const mins = Math.max(1, Math.ceil(retryAfterS / 60));
  return `Too many attempts — please wait ${mins} minute${mins === 1 ? "" : "s"} before trying again.`;
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  return (
    <AuthLocalProvider>
      <AuthFormInner mode={mode} />
    </AuthLocalProvider>
  );
}

function AuthFormInner({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { signInLocal, isAuthed, ready } = useAuthLocal();
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
  // Signup bounced off an existing account — the single most common signup
  // failure, and the raw Supabase message ("User already registered") reads
  // like an error rather than the good news that they're already in.
  const [duplicate, setDuplicate] = React.useState(false);
  // Why the auth callback sent them back here (expired link, wrong browser…).
  const [linkError, setLinkError] = React.useState<string | null>(null);

  // Failure feedback renders BELOW the submit button, which on a phone sits
  // under the open keyboard — without this scroll a bad login looks like
  // nothing happened. One ref serves both panels: they never render together.
  const alertRef = React.useRef<HTMLParagraphElement>(null);
  const noticeRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = unconfirmed || duplicate ? noticeRef.current : alertRef.current;
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [error, duplicate, unconfirmed]);

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
      // A plan beats a `next`: clicking a pricing CTA is a deliberate purchase
      // intent, where `next` is only ever wherever the middleware bounced them.
      const q = new URLSearchParams({ buy: plan });
      const c = p.get("cycle");
      if (c) q.set("cycle", c);
      return `/account/billing?${q.toString()}`;
    }
    // Someone who asked for a protected page and got bounced to /login carries
    // it in `?next=`. Hand it to /continue rather than jumping there directly —
    // it still has to clear onboarding and the diagnostic first, and a brand new
    // account that skipped straight to a deep link would land on a page it has
    // no context for (or, for licence-prep, no plan for).
    const next = safeNextPath(p.get("next"));
    return next ? `/continue?next=${encodeURIComponent(next)}` : "/continue";
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
        : // "device" means the PKCE verifier cookie is missing, i.e. the link
          // was opened somewhere other than the browser that requested it.
          //
          // This used to promise "a new one that works anywhere", which was
          // true while signup confirmation was also PKCE. It no longer is —
          // confirmation, magic link and email change all use token_hash and
          // work cross-device — so in practice this now fires for password
          // reset, where same-browser is deliberate and permanent. Sending
          // someone away expecting a link without that constraint just
          // produces the same failure a second time.
          reason === "device"
          ? "That reset link has to be opened in the same browser you requested it from. Ask for a new one below and open it on this device."
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

  // One resend at a time: the link stays tappable until the request resolves,
  // and rapid taps each fired a fresh GoTrue email until the provider's own
  // limiter kicked in.
  const resending = React.useRef(false);
  async function resendConfirmation() {
    if (!isSupabaseConfigured || resending.current) return;
    // Same soft gate as handleSubmit — repeated resends are email bombs in
    // waiting, and this blunts them before GoTrue's limiter has to.
    const gate = checkAuthAttempt("resend");
    if (!gate.allowed) {
      setError(tooManyAttemptsCopy(gate.retryAfterS));
      return;
    }
    resending.current = true;
    setError(null);
    try {
      // Proxied through /api/auth/resend-confirmation so the server can apply
      // a real per-IP daily cap — GoTrue's own limiter was the only bound on
      // how many emails one IP could trigger.
      const res = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo: confirmRedirect() }),
      });
      if (res.ok) {
        recordAuthResult("resend", true);
        setResent(true);
      } else if (res.status === 429) {
        recordAuthResult("resend", false);
        setError(
          "Too many confirmation emails have been requested just now. Please wait a few minutes and try again.",
        );
      } else {
        recordAuthResult("resend", false);
        setError("We couldn't send the email just now. Please try again.");
      }
    } catch {
      recordAuthResult("resend", false);
      setError("We couldn't send the email just now. Please check your connection and try again.");
    } finally {
      resending.current = false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLinkError(null);
    setUnconfirmed(false);
    setResent(false);
    setDuplicate(false);

    // Catch a weak password here so the user gets inline guidance instead of a
    // server-side rejection after the round-trip.
    if (enforcePassword && !isPasswordValid(password)) {
      setError("Your password doesn't meet all the requirements below yet.");
      return;
    }

    // Soft backoff UNDER GoTrue's own limits (see client-throttle): stops
    // accidental spam and casual scripted abuse, fails open on storage errors,
    // and never touches demo mode — there is nothing to gate without Supabase.
    const surface: ThrottleSurface = mode === "signup" ? "signup" : "login";
    const gate = isSupabaseConfigured ? checkAuthAttempt(surface) : null;
    if (gate && !gate.allowed) {
      setError(tooManyAttemptsCopy(gate.retryAfterS));
      return;
    }
    setLoading(true);

    // Production path: real Supabase auth when configured. Loaded on demand —
    // see resendConfirmation above.
    if (isSupabaseConfigured) {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      if (!supabase) {
        setLoading(false);
        return;
      }
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
        recordAuthResult(surface, false);
        // The password was right; the address just isn't verified yet. Say so
        // in plain language and put a fresh link one tap away.
        if (/email not confirmed|not confirmed/i.test(authError.message)) {
          // GoTrue verified the password here — recording a failure would lock
          // the real user out of the very form the resend flow tells them to
          // come back to. Count it as success so their history stays clean.
          recordAuthResult(surface, true);
          setUnconfirmed(true);
          setError(null);
        } else if (/already registered|already exists/i.test(authError.message)) {
          setDuplicate(true);
          setError(null);
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }
      // Credentials accepted (full session, or account created and awaiting
      // confirmation) — clear this surface's failure history entirely.
      recordAuthResult(surface, true);
      // Email confirmation is on: the account exists but there's no session
      // yet, so entering the app now would just bounce off the middleware.
      if (mode === "signup" && !data.session) {
        track("signup_completed", { method: "password" });
        setAwaitingConfirmation(true);
        setLoading(false);
        return;
      }
    }

    // Demo path / mirror profile into the local store. Awaited, never
    // fire-and-forget: the profile must be durably in localStorage BEFORE
    // router.push unmounts this page — across route groups nothing carries it
    // in memory, and a write still in flight is a write lost (see
    // auth-local-provider for the full race).
    if (mode === "signup") track("signup_completed", { method: "password" });
    await signInLocal(name || email.split("@")[0] || "Learner", email || `demo@${SITE_DOMAIN}`);
    router.push(postAuthDest());
  }

  async function continueAsGuest() {
    await signInLocal("Demo learner", `demo@${SITE_DOMAIN}`);
    router.push("/continue");
  }

  async function continueWithGoogle() {
    if (!isSupabaseConfigured) return;
    setError(null);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    if (!supabase) return;
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
              // Negative-margin padding: the label row's height stays put, but
              // a bare text-xs link was a ~16px tap target in the one place
              // locked-out users tap most.
              <Link
                href="/reset-password"
                className="-my-2 inline-flex items-center rounded-md px-2 py-2 text-xs text-primary hover:underline"
              >
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
          <p ref={alertRef} role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        {unconfirmed && (
          <div ref={noticeRef} className="rounded-xl border border-warning/30 bg-warning/[0.06] p-3 text-sm leading-relaxed">
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
                  className="-mx-2 -my-1 mt-1.5 inline-flex items-center rounded-md px-2 py-2 font-medium text-primary hover:underline"
                >
                  Send it again
                </button>
              </>
            )}
          </div>
        )}

        {/* An existing account is a routing problem, not a dead end: the fix
            is one tap away, carrying whatever plan choice brought them here. */}
        {duplicate && (
          <div ref={noticeRef} className="rounded-xl border border-warning/30 bg-warning/[0.06] p-3 text-sm leading-relaxed">
            You already have an account with this email —{" "}
            <Link href={`/login${linkQuery}`} className="font-medium text-primary hover:underline">
              log in instead
            </Link>{" "}
            (there&apos;s a “Forgot?” link there if the password has slipped your mind).
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
