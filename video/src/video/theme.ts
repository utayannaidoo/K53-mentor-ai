/**
 * NIGHT ATLAS — the film's colour, type and material system.
 *
 * These are not invented brand colours. They are the app's own dark-mode
 * tokens (`src/app/globals.css`, `.dark`) resolved from HSL to hex so the film
 * and the product are literally the same material. Route-marker green is the
 * signature; motorway blue is the only secondary; ochre and red appear once
 * each, as *problem* colours, and never again after the reveal.
 *
 * Rule of restraint: at most two accent hues on screen at once.
 */

export const PALETTE = {
  /** hsl(160 12% 7%) — the app's `--background` after dark. Near-black, green-biased. */
  void: "#101413",
  /** One stop deeper than `void`. Used for true black-out beats and vignette cores. */
  abyss: "#070909",
  /** hsl(160 11% 10%) — `--card`. The glass fill before opacity. */
  slate: "#171C1A",
  /** hsl(158 9% 20%) — `--border`. Hairlines and rims. */
  hairline: "#2E3834",

  /** hsl(140 12% 93%) — `--foreground`. Never pure white; white reads cheap on black. */
  ink: "#EBEFEC",
  /** hsl(150 8% 62%) — `--muted-foreground`. Supporting copy, labels. */
  mute: "#96A69E",

  /** hsl(152 45% 52%) — `--primary`. Route-marker green. THE colour. */
  green: "#4DBC88",
  /** hsl(152 50% 62%) — `--primary-light`. Gradient top-stop and glow core. */
  greenLift: "#68CC9C",
  /** hsl(150 50% 56%) — `--success`. Reserved for confirmed/passed states. */
  success: "#57C78F",

  /** hsl(214 80% 62%) — `--accent`. Motorway blue. Secondary only. */
  blue: "#5194EC",
  /** hsl(36 90% 60%) — `--warning`. Problem-act only. */
  ochre: "#F5AB3D",
  /** hsl(4 78% 67%) — `--danger`. Problem-act only. */
  red: "#ED7269",
} as const;

/**
 * Tracking. Sizes live in the scenes (in stage units — see `useStage()`), but
 * tracking is a system-level decision: it is what makes display type at 128
 * units and at 240 units look like the same typeface being used by the same
 * person. The `display` value mirrors the app's
 * `.font-display { letter-spacing: -0.022em }`.
 *
 * The faces themselves are loaded in `type/fonts.ts`, which is the single
 * source of truth for them — a second copy of the family names here would only
 * be a second thing to keep in sync.
 */
export const TRACKING = {
  hero: "-0.045em",
  display: "-0.032em",
  title: "-0.022em",
  body: "-0.01em",
  /** Eyebrow / label caps. */
  label: "0.14em",
} as const;

/**
 * Glass recipe, ported from the app's three-tier system. `alpha` is the fill
 * opacity over `slate`; `blur` is the backdrop blur in stage units.
 *
 * Tier discipline from the design system: adjacent surfaces must not share a
 * tier, or their edges stop separating.
 */
export const GLASS = {
  subtle: { alpha: 0.42, blur: 14, rim: 0.06, specular: 0.1 },
  card: { alpha: 0.56, blur: 22, rim: 0.09, specular: 0.16 },
  float: { alpha: 0.68, blur: 32, rim: 0.13, specular: 0.24 },
} as const;
