"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Scroll-lock refcount. Two stacked Dialogs each set body overflow hidden;
 * an unconditional reset on cleanup meant whichever closed FIRST un-locked
 * the background while the other was still open.
 */
let openDialogs = 0;
let prevBodyOverflow = "";
function lockBodyScroll() {
  if (openDialogs === 0) {
    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  openDialogs += 1;
}
function unlockBodyScroll() {
  openDialogs = Math.max(0, openDialogs - 1);
  if (openDialogs === 0) document.body.style.overflow = prevBodyOverflow;
}

export function Dialog({
  open,
  onClose,
  children,
  className,
  label,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  /** Accessible name announced by screen readers when the dialog opens. */
  label?: string;
}) {
  const [mounted, setMounted] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  // Latest-callback ref: callers pass inline arrows, so `onClose` gets a new
  // identity on every parent render. With it in the deps, this effect — which
  // steals focus and re-subscribes listeners — re-ran on every keystroke of
  // the parent (worst during tutor streaming), yanking focus back to the
  // panel mid-interaction. The effect now runs only on open/close.
  const onCloseRef = React.useRef(onClose);
  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onClose = onCloseRef.current;
    // Focus management: move focus into the dialog on open, keep Tab cycling
    // inside it, and hand focus back to the opener on close.
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter(
        (el) =>
          // offsetParent is null not only for display:none but also for
          // position:fixed descendants, which used to drop legitimately
          // focusable fixed buttons from the Tab cycle.
          el.offsetParent !== null ||
          getComputedStyle(el).position === "fixed" ||
          el === document.activeElement,
      );
      if (focusables.length === 0) {
        e.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    lockBodyScroll();
    return () => {
      document.removeEventListener("keydown", onKey);
      unlockBodyScroll();
      opener?.focus?.();
    };
  }, [open]);

  if (!open || !mounted) return null;

  // Portalled to <body> — rendering this inside a `glass`/backdrop-filter
  // ancestor would make that ancestor the containing block for our fixed
  // overlay (a CSS spec quirk), clipping the backdrop and panel to that
  // ancestor's box instead of the viewport.
  return createPortal(
    // Bottom padding clears the home indicator (viewportFit=cover) so a sheet's
    // content never sits under it on a notched phone; `max()` keeps desktop
    // spacing identical.
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center">
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-md animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "glass relative flex max-h-[85dvh] w-full max-w-md flex-col animate-modal-in overflow-y-auto rounded-lg p-6 focus:outline-none",
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          // 40×40 of tappable area rather than the icon's own 24. The offset
          // and padding are picked to cancel out — the glyph's centre stays
          // exactly 28px in from the top-right corner, as it was at `right-4
          // top-4 p-1` — so only the hit box grows.
          className="absolute right-2 top-2 rounded-full p-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
