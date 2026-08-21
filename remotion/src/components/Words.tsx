import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { display, displayItalic, mono } from "../fonts";
import { Sfx } from "./Sfx";
import { LEVEL, SFX } from "../audio";

/**
 * Word-by-word headline reveal.
 *
 * The original film did this by walking the DOM after load, replacing text
 * nodes with `<span class="w">` and writing a `--i` custom property onto each.
 * That works once, in a browser, at runtime — it cannot survive a render where
 * every frame is an independent React tree.
 *
 * Here the same split happens during render, over React children, so the copy
 * stays inline and editable in JSX:
 *
 *   <Words>Only <Num>4 in 10</Num> pass the learner’s first time.</Words>
 */

export type WordVariant = "rise" | "scale" | "slide" | "type";

/**
 * Marks a component whose text must animate as one unit. "4 in 10" is a single
 * figure, not three words, so it must not be torn apart by the stagger.
 */
type AtomicComponent = { __atomic?: boolean };

const Word: React.FC<{
  start: number;
  index: number;
  variant: WordVariant;
  children: React.ReactNode;
}> = ({ start, index, variant, children }) => {
  const frame = useCurrentFrame();

  if (variant === "type") {
    // Token streaming, not a character typewriter: it is what an LLM answer
    // actually looks like, and it survives multi-line wrapping.
    return (
      <span
        style={{
          display: "inline-block",
          opacity: interpolate(frame, [start, start + 5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.linear,
          }),
        }}
      >
        {/*
          A key click every other word. Every word is ~45ms apart, which is
          shorter than the tick itself — they would overlap into a buzz. Every
          second one reads as typing.
        */}
        {index % 2 === 0 ? (
          <Sfx src={SFX.tick} at={start} volume={LEVEL.tick} />
        ) : null}
        {children}
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-block",
        opacity: interpolate(frame, [start, start + 32], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        }),
        translate:
          variant === "slide"
            ? interpolate(frame, [start, start + 32], [-46, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.22, 1, 0.36, 1),
              }) + "px 0px"
            : "0px " +
              interpolate(
                frame,
                [start, start + 32],
                [variant === "scale" ? 0 : 22, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.22, 1, 0.36, 1),
                },
              ) +
              "px",
        scale: interpolate(
          frame,
          [start, start + 32],
          [variant === "scale" ? 0.72 : 0.955, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.22, 1, 0.36, 1),
            output: "perceptual-scale",
          },
        ),
        filter:
          "blur(" +
          interpolate(
            frame,
            [start, start + 32],
            [variant === "scale" ? 14 : 12, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.22, 1, 0.36, 1),
            },
          ) +
          "px)",
      }}
    >
      {children}
    </span>
  );
};

const walk = (
  node: React.ReactNode,
  counter: { n: number },
  from: number,
  stagger: number,
  variant: WordVariant,
): React.ReactNode => {
  if (typeof node === "string") {
    // Keep the whitespace runs as plain text so wrapping behaves normally.
    return node.split(/(\s+)/).map((part, i) => {
      if (part === "") {
        return null;
      }
      if (/^\s+$/.test(part)) {
        return part;
      }
      const index = counter.n++;
      return (
        <Word
          key={index + "-" + i}
          start={from + index * stagger}
          index={index}
          variant={variant}
        >
          {part}
        </Word>
      );
    });
  }

  if (Array.isArray(node)) {
    return node.map((child, i) => (
      <React.Fragment key={i}>
        {walk(child, counter, from, stagger, variant)}
      </React.Fragment>
    ));
  }

  if (React.isValidElement(node)) {
    if ((node.type as AtomicComponent).__atomic) {
      const index = counter.n++;
      return (
        <Word start={from + index * stagger} index={index} variant={variant}>
          {node}
        </Word>
      );
    }
    const children = (node.props as { children?: React.ReactNode }).children;
    if (children === undefined || children === null) {
      return node;
    }
    return React.cloneElement(
      node,
      undefined,
      walk(children, counter, from, stagger, variant),
    );
  }

  return node;
};

export const Words: React.FC<{
  /** Frame (within this scene) at which the first word starts. */
  from?: number;
  /** Frames between consecutive words. 1.6 ≈ the original's 0.052s at 30fps. */
  stagger?: number;
  variant?: WordVariant;
  children: React.ReactNode;
}> = ({ from = 0, stagger = 1.6, variant = "rise", children }) => {
  return <>{walk(children, { n: 0 }, from, stagger, variant)}</>;
};

/* ---------- inline typographic marks, usable inside <Words> ---------- */

/** Bold display weight. */
export const B: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <b style={{ fontFamily: display, fontWeight: 800, letterSpacing: "-0.03em" }}>
    {children}
  </b>
);

/** Italic display weight — the emphasised word in a headline. */
export const I: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <i
    style={{
      fontFamily: displayItalic,
      fontStyle: "italic",
      fontWeight: 800,
      letterSpacing: "-0.03em",
    }}
  >
    {children}
  </i>
);

/** Tabular figure in route green. Never split by the word stagger. */
export const Num: React.FC<{ children: React.ReactNode }> & AtomicComponent = ({
  children,
}) => (
  <b
    style={{
      fontFamily: mono,
      fontWeight: 700,
      letterSpacing: "-0.04em",
      color: C.route,
      fontFeatureSettings: '"tnum"',
    }}
  >
    {children}
  </b>
);
Num.__atomic = true;

/** Tabular figure in motorway blue. */
export const NumBlue: React.FC<{ children: React.ReactNode }> &
  AtomicComponent = ({ children }) => (
  <b
    style={{
      fontFamily: mono,
      fontWeight: 700,
      letterSpacing: "-0.04em",
      color: C.motorway,
      fontFeatureSettings: '"tnum"',
    }}
  >
    {children}
  </b>
);
NumBlue.__atomic = true;

/** Muted supporting copy. */
export const Dim: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: C.inkDim }}>{children}</span>
);
