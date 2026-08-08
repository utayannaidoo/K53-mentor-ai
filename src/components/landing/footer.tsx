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
      // Not /licence-prep — that route is auth-gated, so every signed-out
      // visitor who tapped this got a blank frame then an unexplained login
      // screen. Pricing is where the yard-test modules are actually described.
      { href: "/pricing", label: "Driver's licence prep" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/guides", label: "Guides" },
      { href: "/#faq", label: "FAQ" },
      { href: "/#how", label: "How it works" },
      { href: "/login", label: "Log in" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/contact", label: "Contact us" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/refunds", label: "Refund & cancellation" },
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
              {/* h3, not h4 — the page's last heading before this is an h2, and
                  skipping a level breaks heading-based navigation. */}
              <h3 className="text-sm font-semibold text-foreground">{g.title}</h3>
              <ul className="mt-3 space-y-2">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      // py-1 lifts these from a 17px tap target to ~28px.
                      className="inline-block py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
