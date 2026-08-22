import { ImageResponse } from "next/og";
import { GUIDES } from "@/app/guides/guides";

/**
 * Per-guide share cards (og:image + twitter:image) for /guides/<slug>.
 *
 * Same Road Atlas palette as the root opengraph-image so every card reads as
 * one brand family, but laid out as an article card — headline first — because
 * these pages exist to rank in SA search and WhatsApp crops the card into a
 * small tile where the actual guide title is the hook.
 */
const C = {
  field: "#0F1412",
  green: "#4EBC88",
  greenDeep: "#2C5F4F",
  cream: "#EBEFEC",
  muted: "#96A69E",
  hairline: "#2E3834",
};

// `runtime` is NOT exported from here on purpose: Next only honours
// route-config exports it can statically see in the route file itself, so each
// thin opengraph-image.tsx declares `export const runtime = "edge"` literally.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function guideFor(slug: string) {
  const guide = GUIDES.find((entry) => entry.slug === slug);
  if (!guide) {
    throw new Error(
      `[guide-opengraph-image] Unknown guide slug "${slug}" — add it to src/app/guides/guides.ts first.`,
    );
  }
  return guide;
}

/**
 * Greedy word wrap, one string per rendered line. Satori has no text-wrap
 * control worth relying on, so lines are broken here; a stub final line
 * (e.g. a lone "2026)") pulls words down from the line above.
 */
function wrapLines(text: string, maxChars: number, minTailChars: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(" ")) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  lines.push(current);
  while (lines.length >= 2 && lines[lines.length - 1].length < minTailChars) {
    const previous = lines[lines.length - 2].split(" ");
    const moved = previous.pop();
    if (!moved || previous.length < 1) break;
    lines[lines.length - 1] = `${moved} ${lines[lines.length - 1]}`;
    lines[lines.length - 2] = previous.join(" ");
  }
  return lines;
}

/** Description gets two lines at most; longer copy closes with an ellipsis. */
function descriptionLines(text: string): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(" ")) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > 58 && current) {
      lines.push(current);
      if (lines.length === 2) return [lines[0], `${lines[1]}…`];
      current = word;
    } else {
      current = candidate;
    }
  }
  lines.push(current);
  return lines;
}

export function makeGuideOpenGraphImage(slug: string): ImageResponse {
  const guide = guideFor(slug);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          backgroundColor: C.field,
          // Glow accents mirrored from the root card, flipped so the two cards
          // feel related without being identical.
          backgroundImage:
            "radial-gradient(900px 500px at 85% 0%, rgba(78,188,136,0.20), transparent 60%), radial-gradient(700px 400px at 10% 100%, rgba(44,95,79,0.30), transparent 60%)",
          color: C.cream,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              background: C.green,
              boxShadow: "0 0 24px rgba(78,188,136,0.65)",
              color: C.field,
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            K
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 600,
              color: C.muted,
              letterSpacing: "0.02em",
            }}
          >
            K53 Mentor AI · Guide
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 30,
            maxWidth: 1000,
          }}
        >
          {wrapLines(guide.title, 31, 14).map((line) => (
            <div
              key={line}
              style={{
                display: "flex",
                fontSize: 56,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              {line}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 20,
            maxWidth: 980,
          }}
        >
          {descriptionLines(guide.description).map((line) => (
            <div key={line} style={{ display: "flex", fontSize: 30, lineHeight: 1.4, color: C.muted }}>
              {line}
            </div>
          ))}
        </div>

        {/* Honest footer line, echoing the root card's chip row position. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: "auto",
            paddingTop: 28,
            borderTop: `1px solid ${C.hairline}`,
            fontSize: 24,
            color: C.cream,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              display: "flex",
              borderRadius: 9999,
              background: C.green,
              boxShadow: "0 0 24px rgba(78,188,136,0.85)",
            }}
          />
          Free practice test included
        </div>
      </div>
    ),
    size,
  );
}

export function guideOpenGraphAlt(slug: string): string {
  const guide = guideFor(slug);
  return `${guide.title} — K53 Mentor AI guide`;
}
