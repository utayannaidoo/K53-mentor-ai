import { SIGNS } from "@/lib/content/signs";
import { describeAppearance } from "@/lib/content/sign-traits";

/**
 * Alt text for a road sign the learner is being asked to identify.
 *
 * The constraint is two-sided: the alt must not name the sign's meaning (that
 * is the answer), but "Road sign for this question about signs" — what we shipped
 * before — describes nothing, so a blind learner cannot answer a single sign
 * question. Signs are the largest category in the real test.
 *
 * South African signs follow a strict visual grammar by family, so naming the
 * family conveys genuine perceptual information (shape, colour, border) while
 * leaving hundreds of candidate signs open. That is the same information a
 * sighted learner gets from a glance.
 *
 * This is a floor, not a ceiling: per-sign visual descriptions ("black symbol of
 * two children walking") belong in the sign catalogue and would let a blind
 * learner answer as precisely as a sighted one. That is a content task.
 */
const FAMILY_DESCRIPTION: Record<string, string> = {
  regulatory:
    "a regulatory sign — round or octagonal, in red, blue, or black on white",
  warning: "a warning sign — triangular, with a red border on a white background",
  guidance: "a guidance sign — rectangular, in blue, green, or white",
  information: "an information sign — rectangular, usually blue or white",
  marking: "a road marking painted on the road surface",
};

/** Family segment of an extracted sign path, e.g. /signs/warning/warning-012-03.png. */
function familyOf(image?: string): string | null {
  const match = image?.match(/\/signs\/([a-z]+)\//);
  return match ? match[1] : null;
}

/** Image path → catalogue entry, so alt text can describe the actual sign. */
const BY_IMAGE: Map<string, (typeof SIGNS)[number]> = new Map(
  SIGNS.filter((s) => s.image).map((s) => [s.image, s]),
);

/**
 * @param image  Sign image path, when the question renders an extracted PNG.
 * @param categoryId Question category, used only as a fallback label.
 */
export function signQuestionAlt(image?: string, categoryId?: string): string {
  // Best case: the catalogue knows this exact sign's shape and colour, which is
  // what a sighted learner gets from a glance — and still leaves hundreds of
  // candidates open, so it describes without answering.
  const sign = image ? BY_IMAGE.get(image) : undefined;
  const appearance = sign ? describeAppearance(sign) : null;
  if (appearance) return `The road sign to identify: ${appearance}.`;

  const description = FAMILY_DESCRIPTION[familyOf(image) ?? ""];
  if (description) return `The road sign to identify: ${description}.`;

  const topic = categoryId?.replace(/_/g, " ");
  return topic
    ? `The road sign to identify, from the ${topic} category.`
    : "The road sign to identify.";
}
