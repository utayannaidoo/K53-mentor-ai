import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CAMERA } from "../config";
import { CLAMP, EASE, drift } from "../lib/motion";
import { useStage } from "../lib/stage";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THE CAMERA RIG
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * There is no static shot in this film. Every scene is framed through this
 * component, which models a real camera rather than a CSS transform:
 *
 *   zoom   — dolly in/out along Z (a *push*, not a scale — the perspective
 *            genuinely changes, so foreground and background separate)
 *   pan    — lateral track, in stage units
 *   tilt   — vertical track
 *   yaw    — rotation around Y. This is what makes the reveal read as an orbit.
 *   pitch  — rotation around X
 *   roll   — rotation around Z. Never more than ~1°; beyond that it reads drunk.
 *   focus  — depth of field, as a blur in stage units. A focus *pull* is
 *            `focus={[10, 0]}` and is one of the most under-used tools in
 *            software video.
 *   handheld — a breathing operator. Two incommensurable sines per axis so it
 *            never visibly loops.
 *
 * All ranges are `[from, to]` and share a single `range={[startFrame, endFrame]}`,
 * because a real camera move has one duration, not seven.
 *
 * Cameras nest. `<Camera zoom={...}><Camera handheld={1}>…` composes a slow
 * programmed move with an independent operator wobble, which is how the reveal
 * and CTA are built.
 */

type Pair = readonly [number, number];

export interface CameraProps {
  readonly children: React.ReactNode;
  /** Frame window the move plays over. Defaults to the whole scene. */
  readonly range?: Pair;
  /** Dolly along Z, as a multiplier. `[1, 1.14]` is a slow push-in. */
  readonly zoom?: Pair;
  /** Lateral track in stage units. */
  readonly pan?: Pair;
  /** Vertical track in stage units. */
  readonly tilt?: Pair;
  /** Y-axis rotation in degrees. The orbit. */
  readonly yaw?: Pair;
  /** X-axis rotation in degrees. */
  readonly pitch?: Pair;
  /** Z-axis rotation in degrees. Keep it under 1.2. */
  readonly roll?: Pair;
  /** Depth of field, as blur in stage units. `[10, 0]` is a focus pull. */
  readonly focus?: Pair;
  /** Operator breathing, 0–2. 0.5 is barely there; 1 is documentary. */
  readonly handheld?: number;
  /** Which curve the programmed move rides. */
  readonly ease?: keyof typeof EASE;
  /** Unique per camera so two rigs in one scene don't shake in lockstep. */
  readonly seed?: number;
  readonly style?: React.CSSProperties;
}

export const Camera: React.FC<CameraProps> = ({
  children,
  range,
  zoom,
  pan,
  tilt,
  yaw,
  pitch,
  roll,
  focus,
  handheld = 0,
  ease = "glass",
  seed = 1,
  style,
}) => {
  const frame = useCurrentFrame();
  const { u } = useStage();
  const [a, b] = range ?? [0, 1];
  const curve = { easing: EASE[ease], ...CLAMP } as const;

  // Handheld is a *sub-pixel* effect at rest and only becomes visible on the
  // long lens (high zoom). Scaling it by amplitude here keeps wide shots calm.
  const shake = handheld * CAMERA.handheld;
  const hx = drift(frame, 1, seed) * shake;
  const hy = drift(frame, 0.86, seed + 11) * shake;
  const hr = drift(frame, 0.63, seed + 23) * shake;

  const z = zoom ? interpolate(frame, [a, b], zoom, curve) : 1;
  const px = pan ? interpolate(frame, [a, b], pan, curve) : 0;
  const py = tilt ? interpolate(frame, [a, b], tilt, curve) : 0;
  const ry = yaw ? interpolate(frame, [a, b], yaw, curve) : 0;
  const rx = pitch ? interpolate(frame, [a, b], pitch, curve) : 0;
  const rz = roll ? interpolate(frame, [a, b], roll, curve) : 0;
  const dof = focus ? interpolate(frame, [a, b], focus, curve) : 0;

  return (
    <AbsoluteFill
      style={{
        perspective: u(CAMERA.perspective),
        perspectiveOrigin: "50% 50%",
        // Blur belongs on the outer node: applying it inside would clip against
        // the 3D context and produce a visible edge on the focus pull.
        filter: dof > 0.05 ? `blur(${u(dof)}px)` : "none",
        ...style,
      }}
    >
      <AbsoluteFill
        style={{
          transformStyle: "preserve-3d",
          transform: [
            `translate3d(${u(px + hx * 3.2)}px, ${u(py + hy * 2.4)}px, 0)`,
            `rotateX(${rx + hy * 0.09}deg)`,
            `rotateY(${ry + hx * 0.12}deg)`,
            `rotateZ(${rz + hr * 0.07}deg)`,
            `scale(${z})`,
          ].join(" "),
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * A layer at a fixed distance from the camera.
 *
 * Because the rig uses real perspective, pushing a layer back in Z makes it
 * move *less* under pan and yaw — parallax for free, no per-layer maths. The
 * compensating scale keeps the layer's apparent size identical at rest, so you
 * can change `z` purely to tune how much it parallaxes without re-laying-out.
 *
 * Negative z = further away. The film's grammar:
 *   -900  atmosphere, particles behind everything
 *   -420  glow, background panels
 *      0  the subject
 *   +180  foreground dust and light leaks
 */
export const Depth: React.FC<{
  readonly children: React.ReactNode;
  readonly z: number;
  readonly style?: React.CSSProperties;
  readonly name?: string;
}> = ({ children, z, style, name }) => {
  const { u } = useStage();
  const depth = u(z);
  const perspective = u(CAMERA.perspective);

  return (
    <AbsoluteFill
      data-name={name}
      style={{
        transformStyle: "preserve-3d",
        transform: `translateZ(${depth * CAMERA.parallax}px) scale(${
          (perspective - depth * CAMERA.parallax) / perspective
        })`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
