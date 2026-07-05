"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useStudyStore } from "@/hooks/use-study-store";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { signInLocal, isAuthed, hasDiagnostic, ready } = useStudyStore();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (ready && isAuthed) router.replace(hasDiagnostic ? "/dashboard" : "/onboarding");
  }, [ready, isAuthed, hasDiagnostic, router]);

  const destination = () =>
    mode === "signup" || !hasDiagnostic ? "/onboarding" : "/dashboard";

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
    signInLocal(name || email.split("@")[0] || "Learner", email || "demo@k53mentor.ai");
    router.push(destination());
  }

  function continueAsGuest() {
    signInLocal("Demo learner", "demo@k53mentor.ai");
    router.push(hasDiagnostic ? "/dashboard" : "/onboarding");
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

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : (
            <>
              {mode === "signup" ? "Create account" : "Log in"}
              <ArrowRight />
            </>
          )}
        </Button>
      </form>

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
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
