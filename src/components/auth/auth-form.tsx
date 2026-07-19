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

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { signInLocal, isAuthed, ready } = useStudyStore();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Landing pricing buttons arrive as /signup?plan=…&track=…&cycle=…. Carry that
  // choice through auth so the user lands straight in that plan's checkout; the
  // billing page skips the charge if they already have a paid plan. Without a
  // plan, fall back to the normal post-auth router.
  function postAuthDest(): string {
    const p = new URLSearchParams(window.location.search);
    const plan = p.get("plan");
    if (plan === "premium" || plan === "premium_plus") {
      const q = new URLSearchParams({ buy: plan });
      const t = p.get("track");
      const c = p.get("cycle");
      if (t) q.set("track", t);
      if (c) q.set("cycle", c);
      return `/account/billing?${q.toString()}`;
    }
    return "/continue";
  }

  // Preserve the plan choice when switching between the login / signup links.
  const [linkQuery, setLinkQuery] = React.useState("");
  React.useEffect(() => setLinkQuery(window.location.search), []);

  // Already signed in — hand off to the post-auth destination (checkout if a
  // plan was chosen, otherwise the router that decides onboarding vs dashboard).
  React.useEffect(() => {
    if (ready && isAuthed) router.replace(postAuthDest());
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Production path: real Supabase auth when configured.
    const supabase = createClient();
    if (supabase) {
      const { error: authError } =
        mode === "signup"
          ? await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
          : await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
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

  return (
    <div>
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
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

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
