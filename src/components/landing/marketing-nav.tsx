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

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-3 sm:px-4 transition-[padding] duration-300 ease-glass",
        scrolled ? "pt-1.5 sm:pt-2" : "pt-3 sm:pt-4",
      )}
    >
      <div
        className={cn(
          "glass-panel mx-auto flex items-center justify-between gap-3 rounded-full border pl-5 pr-2 transition-all duration-300 ease-glass",
          scrolled
            ? "max-w-[820px] py-1 shadow-[0_18px_44px_-26px_hsl(var(--shadow)/0.7)]"
            : "max-w-5xl py-2 shadow-[0_10px_30px_-26px_hsl(var(--shadow)/0.5)]",
        )}
      >
        <Link
          href="/"
          aria-label="K53 Mentor AI home"
          className={cn(
            "shrink-0 origin-left rounded-full transition-transform duration-300 ease-glass focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25",
            scrolled && "scale-90",
          )}
        >
          <Logo />
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 md:flex">
          <ThemeToggle />
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full")}>
            Log in
          </Link>
          <Link href="/onboarding" className={cn(buttonVariants({ size: "sm" }), "rounded-full")}>
            Start free assessment
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="glass-2 mx-auto mt-2 max-w-5xl overflow-hidden rounded-2xl border p-2 md:hidden animate-fade-in">
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
        </div>
      )}
    </header>
  );
}
