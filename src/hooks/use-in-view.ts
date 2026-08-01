"use client";

import * as React from "react";

/**
 * Fires once when an element scrolls into view.
 *
 * The trigger point is deliberately expressed in *pixels*, not percentages:
 * a ratio threshold (`0.12`) plus a percentage rootMargin (`-8%`) both scale
 * with the element and the viewport, so on a tall screen — iPad portrait and
 * landscape, big desktop windows — a section had to travel 150–250px up from
 * the fold before it revealed, which reads as the animation firing late. An
 * absolute bottom margin fires at the same visual moment on every device.
 */
const OPTIONS: IntersectionObserverInit = {
  threshold: 0,
  rootMargin: "0px 0px -32px 0px",
};

/**
 * Failsafe: reveal everything after this long regardless of the observer.
 *
 * ~92% of the landing page's text sits inside Reveal wrappers, all starting at
 * opacity 0. That is fine when the observer fires, and a blank page when it does
 * not — a stalled callback, an exotic mobile browser, an embedded webview. The
 * animation is decoration; the content is the product. Never let the decoration
 * be the reason someone sees nothing.
 */
const FAILSAFE_MS = 2000;

export function useInView<T extends HTMLElement>(): [React.RefObject<T | null>, boolean] {
  const ref = React.useRef<T>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduced motion: there is no animation to trigger, so don't gate content
    // on a scroll position — show it now.
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, OPTIONS);
    io.observe(el);
    const failsafe = window.setTimeout(() => {
      setInView(true);
      io.disconnect();
    }, FAILSAFE_MS);
    return () => {
      window.clearTimeout(failsafe);
      io.disconnect();
    };
  }, []);

  return [ref, inView];
}
