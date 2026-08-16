import React from "react";
import { useCurrentFrame } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { MOTION_BLUR } from "../config";

/**
 * MOTION BLUR, USED LIKE A SHUTTER — not like a filter.
 *
 * `<CameraMotionBlur>` re-renders its children `samples` times per frame at
 * sub-frame offsets. That is genuinely expensive: an 8-sample region costs
 * roughly 8× the render time for **every frame it covers**.
 *
 * ── Why `range` exists ──────────────────────────────────────────────────────
 * The first version had no `range`, and the fast move you want to blur is
 * always inside a component that is mounted far longer than the move itself.
 * The flashcard is on screen for 360 frames and is thrown for 20. The closing
 * camera is mounted for 595 frames and never moves fast at all. Wrapping the
 * component meant paying 8× for 955 frames to blur 20 of them — the full-length
 * render went from minutes to *stalled*, and the documentation below was simply
 * false.
 *
 * With `range`, the blur is armed only across the frames of the actual move and
 * children pass straight through everywhere else. There is no visual seam at
 * the boundary: with nothing moving, averaging eight identical sub-frames
 * returns the same image. Just make sure the boundaries land in slow motion.
 *
 * Armed for three moves, ~310 frames of the film's 3480:
 *
 *   1. The problem-act word slams (Scene 02) — four short sequences
 *   2. The lane-line launch into the reveal (Scene 03) — frames 40–190
 *   3. The flashcard throw (Scene 06) — frames 226–262
 *
 * The closing pull-back is deliberately *not* blurred: it travels about 20% of
 * frame width over ten seconds. There is nothing there to smear, and it cost
 * more than the rest of the film combined.
 *
 * Flip `MOTION_BLUR.enabled` off in config for fast preview renders; the film
 * stays correct, those three moves just get crisper.
 */
export const Shutter: React.FC<{
  readonly children: React.ReactNode;
  /** Scene-relative `[start, end]`. Omit to arm for the whole mount. */
  readonly range?: readonly [number, number];
}> = ({ children, range }) => {
  const frame = useCurrentFrame();

  const armed =
    MOTION_BLUR.enabled && (!range || (frame >= range[0] && frame <= range[1]));

  if (!armed) {
    return <>{children}</>;
  }

  return (
    <CameraMotionBlur
      shutterAngle={MOTION_BLUR.shutterAngle}
      samples={MOTION_BLUR.samples}
    >
      {children}
    </CameraMotionBlur>
  );
};
