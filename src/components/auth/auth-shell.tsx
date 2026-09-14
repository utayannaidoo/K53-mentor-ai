import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SupportLink } from "@/components/shared/support-link";
import { SUPPORT_EMAIL } from "@/lib/constants";

const POINTS = [
  "Free starting check + readiness score",
  "A tutor that explains, not just answers",
  "Spaced-repetition that adapts to you",
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <Link href="/" className="relative">
          <Logo className="[&_span]:text-primary-foreground" />
        </Link>
        <div className="relative">
          <h2 className="max-w-md font-display text-3xl font-semibold leading-tight tracking-tight">
            Stop guessing what to study. Know exactly what&apos;s left to fix.
          </h2>
          <ul className="mt-8 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-primary-foreground/90">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/15">
                  <Check className="h-3 w-3" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-primary-foreground/70">
          Built for the South African K53 — every question follows the official test format.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 lg:justify-end">
          <Link href="/" className="lg:hidden">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">{children}</div>
          {/*
            Login, signup and both reset screens share this shell, and the
            (auth) route group deliberately mounts nothing else — no app nav, no
            marketing footer. Someone whose confirmation mail never arrived or
            whose reset link won't take cannot be told to sign in first, so this
            is their only route to a human. One copy here rather than one per
            screen, so it can't go missing from whichever screen is added next.
          */}
          <p className="mt-8 w-full max-w-sm text-center text-xs text-muted-foreground">
            Can&apos;t get in? Email{" "}
            <SupportLink subject="K53 Mentor — I can't sign in">{SUPPORT_EMAIL}</SupportLink>
          </p>
        </div>
      </div>
    </div>
  );
}
