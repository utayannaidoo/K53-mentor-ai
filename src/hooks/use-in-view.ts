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
 *
 * How much of the element has to show. 32px was too eager: `Reveal` wraps whole
 * sections, and a section is often 800–2000px tall, so a sliver of its top edge
 * appearing was enough to start the 700ms transition on everything inside it —
 * the lower half had finished animating long before anyone scrolled to it.
 */
const TRIGGER_PX = 140;

/**
 * Short elements never reach TRIGGER_PX without being fully on screen (and
 * then some), which is the proportional trap in reverse. Anything under
 * ~2 × TRIGGER_PX falls back to "half of it is showing" instead.
 */
function triggerFor(el: HTMLElement): number {
  return Math.min(TRIGGER_PX, Math.round(el.offsetHeight / 2));
}

/**
 * Failsafe: how long to give the observer before watching scroll ourselves.
 *
 * Most of the landing page's text sits inside Reveal wrappers, all starting at
 * opacity 0. That is fine when the observer fires, and a blank page when it
 * does not — a stalled callback, an exotic mobile browser, an embedded webview.
 * The animation is decoration; the content is the product. Never let the
 * decoration be the reason someone sees nothing.
 *
 * This used to reveal *everything* on the page when it expired, which broke the
 * effect it was protecting: two seconds after load — while you are still
 * reading the hero — every section below the fold had already animated in, so
 * scrolling down showed a page where nothing moved. The fallback now reproduces
 * the observer's geometry off scroll events instead of ignoring position, so
 * the worst case is a cheaper implementation of the same behaviour rather than
 * no behaviour at all. It is armed for anything still hidden at the deadline —
 * "the observer called back once" is not proof it will call back again, and an
 * observer that reports once and then stalls is precisely the failure this
 * exists to survive.
 */
const FAILSAFE_MS = 2000;

/**
 * One scroll listener for every fallback watcher on the page, not one each.
 * Watchers remove themselves as they fire, so the set only shrinks as you read
 * down the page. Deliberately not rAF-throttled: rAF is paused in exactly the
 * conditions this fallback exists for (background tabs, throttled devices),
 * and each watcher is a single getBoundingClientRect.
 */
const watchers = new Set<() => void>();

function runWatchers() {
  for (const check of [...watchers]) check();
}

function watch(check: () => void) {
  watchers.add(check);
  if (watchers.size === 1) {
    window.addEventListener("scroll", runWatchers, { passive: true });
    window.addEventListener("resize", runWatchers);
  }
  check();
}

function unwatch(check: () => void) {
  if (!watchers.delete(check)) return;
  if (watchers.size === 0) {
    window.removeEventListener("scroll", runWatchers);
    window.removeEventListener("resize", runWatchers);
  }
}

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

    const trigger = triggerFor(el);
    let failsafe = 0;

    /** Same geometry as the observer's rootMargin, measured directly. */
    function check() {
      const rect = el!.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top <= vh - trigger && rect.bottom >= 0) show();
    }

    function cleanup() {
      window.clearTimeout(failsafe);
      unwatch(check);
      io.disconnect();
    }

    function show() {
      setInView(true);
      cleanup();
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) show();
      },
      { threshold: 0, rootMargin: `0px 0px -${trigger}px 0px` },
    );
    io.observe(el);

    failsafe = window.setTimeout(() => watch(check), FAILSAFE_MS);

    return cleanup;
  }, []);

  return [ref, inView];
}
