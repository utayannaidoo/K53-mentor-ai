// Guide-specific OG card — convention documented in how-the-k53-learners-test-works.
import {
  contentType,
  guideOpenGraphAlt,
  makeGuideOpenGraphImage,
  size,
} from "@/components/landing/guide-opengraph-image";

const slug = "k53-road-signs-explained";

// Declared literally, not re-exported: Next only honours route-config exports
// it can statically see in this file — a re-export silently falls back to the
// default runtime (build warning, edge caching lost).
export const runtime = "edge";
export { size, contentType };
export const alt = guideOpenGraphAlt(slug);

export default function OpenGraphImage() {
  return makeGuideOpenGraphImage(slug);
}
