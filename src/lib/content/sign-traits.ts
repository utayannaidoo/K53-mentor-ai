import type { RoadSign } from "@/types";

/**
 * Shape and colour for every sign in the catalogue.
 *
 * Shape and colour are the two things a learner actually retains from a
 * roadside glance, and the catalogue records neither — only category,
 * subcategory, name and meaning. That left 439 verified signs sitting in a list
 * that can't be searched the way anyone remembers them, and made confusion-pair
 * drilling impossible.
 *
 * These are derived from the SARTSM sign classes, not authored per sign. That
 * is a deliberate limit: the same rule this codebase already applies to sign
 * *meanings* — "the only safe generator is one that can't author facts, just
 * recombine verified ones" — applies to visual claims too. Where a family
 * genuinely mixes shapes (regulatory control signs are octagons *and* inverted
 * triangles), the answer is "varies" and `confident` is false, rather than a
 * confident guess. Per-sign symbol descriptions ("black silhouette of two
 * children") remain a content task.
 */

export type SignShape =
  | "triangle"
  | "inverted-triangle"
  | "octagon"
  | "circle"
  | "rectangle"
  | "diamond"
  | "marking"
  | "varies";

export type SignColour = "red" | "blue" | "green" | "brown" | "yellow" | "white" | "varies";

export interface SignTraits {
  shape: SignShape;
  colour: SignColour;
  /** False when the family mixes shapes or colours and we won't guess. */
  confident: boolean;
}

const SHAPE_LABEL: Record<SignShape, string> = {
  triangle: "triangular",
  "inverted-triangle": "an upside-down triangle",
  octagon: "eight-sided",
  circle: "round",
  rectangle: "rectangular",
  diamond: "diamond-shaped",
  marking: "painted on the road surface",
  varies: "",
};

const COLOUR_LABEL: Record<SignColour, string> = {
  red: "red",
  blue: "blue",
  green: "green",
  brown: "brown",
  yellow: "yellow",
  white: "white",
  varies: "",
};

/** Human labels for the library's filter chips. */
export const SHAPE_FILTERS: { id: SignShape; label: string }[] = [
  { id: "triangle", label: "Triangle" },
  { id: "circle", label: "Circle" },
  { id: "rectangle", label: "Rectangle" },
  { id: "octagon", label: "Octagon" },
  { id: "diamond", label: "Diamond" },
];

export const COLOUR_FILTERS: { id: SignColour; label: string }[] = [
  { id: "red", label: "Red" },
  { id: "blue", label: "Blue" },
  { id: "green", label: "Green" },
  { id: "brown", label: "Brown" },
  { id: "yellow", label: "Yellow" },
];

/**
 * Match against the sign's NAME, not its meaning.
 *
 * Meanings are prose that routinely mention other signs — Yield's reads "You
 * need not stop if the way is clear", which matched /stop/ and classified a
 * triangular yield sign as an octagon. The name is the only field that
 * describes the sign itself.
 */
const named = (s: RoadSign, re: RegExp) => re.test(s.name);

/** Meanings are safe for coarse flags that no other sign's prose would carry. */
const has = (s: RoadSign, re: RegExp) => re.test(`${s.name} ${s.meaning}`);

export function traitsFor(sign: RoadSign): SignTraits {
  const sub = sign.subcategory;

  if (sign.category === "warning") {
    // Hazard marker plates are boards, not the standard warning triangle.
    if (/hazard marker/i.test(sub)) return { shape: "rectangle", colour: "varies", confident: false };
    // Temporary works signs are yellow diamonds; permanent warnings are
    // red-bordered triangles.
    if (has(sign, /\btemporary\b/i)) return { shape: "diamond", colour: "yellow", confident: true };
    return { shape: "triangle", colour: "red", confident: true };
  }

  if (sign.category === "regulatory") {
    if (/prohibition/i.test(sub)) return { shape: "circle", colour: "red", confident: true };
    if (/command/i.test(sub)) return { shape: "circle", colour: "blue", confident: true };
    if (/de-restriction/i.test(sub)) return { shape: "circle", colour: "white", confident: true };
    if (/reservation|comprehensive/i.test(sub))
      return { shape: "rectangle", colour: "blue", confident: true };
    if (/control/i.test(sub)) {
      // The only family that genuinely mixes shapes — resolve the two we can
      // name, and admit the rest. Yield is tested first and by name only:
      // its own meaning contains the word "stop".
      if (named(sign, /yield|give way/i))
        return { shape: "inverted-triangle", colour: "red", confident: true };
      if (named(sign, /\bstop\b/i)) return { shape: "octagon", colour: "red", confident: true };
      return { shape: "varies", colour: "varies", confident: false };
    }
    // Selective restriction and traffic signals span several presentations.
    return { shape: "varies", colour: "varies", confident: false };
  }

  if (sign.category === "information") return { shape: "rectangle", colour: "blue", confident: true };

  if (sign.category === "guidance") {
    if (/tourism/i.test(sub)) return { shape: "rectangle", colour: "brown", confident: true };
    // Guidance colour encodes road class (blue freeway, green rural, white
    // local) and the catalogue doesn't record which — shape is safe, colour isn't.
    return { shape: "rectangle", colour: "varies", confident: false };
  }

  return { shape: "marking", colour: "varies", confident: false };
}

/**
 * A description of what the sign *looks like*, with no hint of what it means —
 * so it can be read aloud to someone who can't see the image and still leave
 * the question answerable rather than answered.
 */
export function describeAppearance(sign: RoadSign): string | null {
  const { shape, colour, confident } = traitsFor(sign);
  if (!confident) return null;
  if (shape === "marking") return "a marking painted on the road surface";
  const shapeLabel = SHAPE_LABEL[shape];
  const colourLabel = COLOUR_LABEL[colour];
  if (!shapeLabel) return null;
  return colourLabel ? `${shapeLabel} and ${colourLabel}` : shapeLabel;
}

/** Two signs a learner could plausibly mix up at a glance. */
export function looksLike(a: RoadSign, b: RoadSign): boolean {
  if (a.id === b.id) return false;
  const ta = traitsFor(a);
  const tb = traitsFor(b);
  return ta.confident && tb.confident && ta.shape === tb.shape && ta.colour === tb.colour;
}

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

/**
 * Best catalogue match for a free-text sign name — used to tie a scanner result
 * back to a known sign so we can offer what it's confused with. Exact match
 * first, then containment; deliberately no fuzzy scoring, because a wrong match
 * would show a learner the wrong sign as "similar".
 */
export function findSignByName(name: string, pool: readonly RoadSign[]): RoadSign | null {
  const target = normalise(name);
  if (target.length < 3) return null;
  return (
    pool.find((s) => normalise(s.name) === target) ??
    pool.find((s) => {
      const n = normalise(s.name);
      return n.length >= 4 && (n.includes(target) || target.includes(n));
    }) ??
    null
  );
}

/** Signs sharing this one's silhouette — the ones it actually gets mixed up with. */
export function similarSigns(
  sign: RoadSign,
  pool: readonly RoadSign[],
  limit = 3,
): RoadSign[] {
  return pool.filter((s) => looksLike(sign, s)).slice(0, limit);
}
