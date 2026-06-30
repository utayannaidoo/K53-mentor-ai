"use client";

import * as React from "react";
import Lenis from "lenis";

/**
 * Inertial (eased) scrolling for the marketing experience — the "gliding"
 * feel of a polished product site. Lenis lerps the *real* document scroll,
 * so `position: sticky`, `scroll-margin` and IntersectionObserver all keep
 * working (unlike transform-based fake scrollers).
 *
 * Renders no DOM. Disabled entirely under reduced-motion, and yields wheel
 * control inside any element marked `data-lenis-prevent` (e.g. inner scroll
 * panes) so nested scrolling stays native.
 */
export function SmoothScroll() {
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      // Weighty feel = friction + glide. Duration/easing mode (instead of a
      // single lerp) gives each scroll impulse a long, eased settle — a firm
      // initial grab that then glides out via the exponential ease-out tail.
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // <1 multiplier adds friction: the same wheel motion travels less, so
      // the scroll reads as heavier / more resistant.
      wheelMultiplier: 0.85,
      smoothWheel: true,
      // Native momentum already feels right on touch; don't override it.
      syncTouch: false,
      prevent: (node) => node.hasAttribute("data-lenis-prevent"),
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Ease in-page anchor jumps (#features, …) through Lenis instead of the
    // browser's instant/native smooth scroll, leaving room for the sticky nav.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest('a[href^="#"]');
      const href = anchor?.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80 });
      history.pushState(null, "", href);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
