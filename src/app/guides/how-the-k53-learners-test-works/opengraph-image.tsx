/**
 * Per-guide share card. An opengraph-image.tsx in a route folder overrides the
 * root site-wide card for that route only. Adding a guide = a catalogue entry
 * in ../guides.ts + one of these thin files pointing at its slug.
 */
import {
  contentType,
  guideOpenGraphAlt,
  makeGuideOpenGraphImage,
  size,
} from "@/components/landing/guide-opengraph-image";

const slug = "how-the-k53-learners-test-works";

// Declared literally, not re-exported: Next only honours route-config exports
// it can statically see in this file — a re-export silently falls back to the
// default runtime (build warning, edge caching lost).
export const runtime = "edge";
export { size, contentType };
export const alt = guideOpenGraphAlt(slug);

export default function OpenGraphImage() {
  return makeGuideOpenGraphImage(slug);
}
