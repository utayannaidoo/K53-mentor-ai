"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function MarketingNav() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const headerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape and tap-outside close the menu. Without these the only way out was
  // tapping the hamburger again, which is not where anyone's thumb goes.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-50 px-3 sm:px-4 transition-[padding] duration-500 ease-glass",
        scrolled ? "pt-1.5 sm:pt-2" : "pt-3 sm:pt-4",
      )}
    >
      <div
        className={cn(
          "glass-panel mx-auto flex items-center justify-between gap-3 rounded-full border pl-5 pr-2 transition-all duration-500 ease-glass",
          scrolled
            ? "max-w-[850px] py-1 shadow-[0_18px_44px_-26px_hsl(var(--shadow)/0.7)]"
            : "max-w-5xl py-2 shadow-[0_10px_30px_-26px_hsl(var(--shadow)/0.5)]",
        )}
      >
        <Link
          href="/"
          aria-label="K53 Mentor AI home"
          className={cn(
            "shrink-0 origin-left rounded-full transition-transform duration-500 ease-glass focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25",
            scrolled && "scale-90",
          )}
        >
          <Logo textClassName="hidden xs:inline" />
        </Link>

        {/* The desktop row switches on at `lg`, not `md`. Its three parts need
            about 890px (152 logo + 337 links + 284 CTA, plus the pill's padding
            and gaps), so turning it on at 768 overflowed every tablet in
            portrait by up to 75px. Below that the pill keeps the compact
            cluster, which fits with room to spare. */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex">
          <ThemeToggle />
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full")}>
            Log in
          </Link>
          <Link href="/onboarding" className={cn(buttonVariants({ size: "sm" }), "rounded-full")}>
            Start free assessment
          </Link>
        </div>

        {/* Mobile: the header carried no CTA at all, so across the whole
            landing page there was nothing to tap without scrolling back up. */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* h-11 override over size "sm": this is the top-of-funnel CTA and a
              36px pill fails touch-target minimums. Padding stays px-3.5 — the
              360px width budget that drops the wordmark has no slack (see
              tailwind.config.ts screens.xs). */}
          <Link
            href="/onboarding"
            className={cn(buttonVariants({ size: "sm" }), "h-11 rounded-full px-3.5")}
          >
            Start free
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="marketing-mobile-menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="marketing-mobile-menu"
          aria-label="Main"
          className="glass-2 mx-auto mt-2 max-w-5xl overflow-hidden rounded-2xl border p-2 lg:hidden animate-fade-in"
        >
          <div className="flex flex-col gap-0.5">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2">
              {/* The toggle used to be desktop-only, so a phone in dark mode had
                  no way to change theme on any marketing page. */}
              <ThemeToggle />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
              >
                Log in
              </Link>
              <Link
                href="/onboarding"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ size: "sm" }), "flex-1")}
              >
                Start free
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
