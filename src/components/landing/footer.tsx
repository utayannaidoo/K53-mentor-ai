import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { APP_NAME } from "@/lib/constants";

const GROUPS = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/onboarding", label: "Free assessment" },
      { href: "/licence-prep", label: "Driver's licence prep" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#faq", label: "FAQ" },
      { href: "/#how", label: "How it works" },
      { href: "/login", label: "Log in" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/sources", label: "Content sources" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              The AI study coach for the South African K53 learner&apos;s and driver&apos;s
              licence. Diagnose, study smart, pass with confidence.
            </p>
            <div className="flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Secure payments
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Aligned to the official K53 manual
              </span>
            </div>
          </div>
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h4 className="text-sm font-semibold text-foreground">{g.title}</h4>
              <ul className="mt-3 space-y-2">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. Not affiliated with or endorsed by the RTMC.
          </p>
          <p>Made for South African roads. 🇿🇦</p>
        </div>
      </div>
    </footer>
  );
}
