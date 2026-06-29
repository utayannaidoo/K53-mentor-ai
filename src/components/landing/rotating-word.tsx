"use client";

import * as React from "react";

const WORDS = [
  "road signs",
  "the rules of the road",
  "vehicle controls",
  "the yard test",
  "your exam-day nerves",
];

/**
 * Hero headline word that cross-fades through the K53 categories, mirroring the
 * design. Pauses for reduced-motion (shows the first word statically).
 */
export function RotatingWord() {
  const [index, setIndex] = React.useState(0);
  const [shown, setShown] = React.useState(true);

  React.useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const id = setInterval(() => {
      setShown(false);
      const swap = setTimeout(() => {
        setIndex((i) => (i + 1) % WORDS.length);
        setShown(true);
      }, 270);
      return () => clearTimeout(swap);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      aria-live="polite"
      className="inline-block text-primary transition-[opacity,transform] duration-300 ease-soft"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(-10px)",
      }}
    >
      {WORDS[index]}
    </span>
  );
}
