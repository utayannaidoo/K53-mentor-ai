import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const POINTS = [
  "Free AI diagnostic + readiness score",
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
          “Passed with 61/64 after failing twice.” — Lerato M., Johannesburg
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
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
