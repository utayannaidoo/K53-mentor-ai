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

export function useInView<T extends HTMLElement>(): [React.RefObject<T | null>, boolean] {
  const ref = React.useRef<T>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
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
    return () => io.disconnect();
  }, []);

  return [ref, inView];
}
