import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "K53 Mentor AI — Pass your K53 licence faster";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card (og:image + twitter:image).
 *
 * Road Atlas palette, lifted from the dark-mode tokens in globals.css so the
 * card matches the product someone lands on: field `--background` (#0F1412,
 * the same value layout.tsx declares as themeColor), route green `--primary`
 * (#4EBC88), cream `--foreground` (#EBEFEC).
 *
 * Dark field on purpose — this renders against both light and dark feeds, and
 * WhatsApp (the SA sharing channel) crops it into a small tile where a dark
 * card with one bright accent stays legible and a light one washes out.
 */
const C = {
  field: "#0F1412",
  green: "#4EBC88",
  greenDeep: "#2C5F4F",
  cream: "#EBEFEC",
  muted: "#96A69E",
  hairline: "#2E3834",
};

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          backgroundColor: C.field,
          // One accent glow, per the palette restraint rule — a warm route-green
          // wash top-left, and a much fainter deep-green settle bottom-right.
          backgroundImage:
            "radial-gradient(900px 500px at 15% 0%, rgba(78,188,136,0.22), transparent 60%), radial-gradient(700px 400px at 90% 100%, rgba(44,95,79,0.28), transparent 60%)",
          color: C.cream,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 30,
            fontWeight: 600,
            color: C.green,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9999,
              background: C.green,
              boxShadow: "0 0 24px rgba(78,188,136,0.85)",
            }}
          />
          K53 Mentor AI
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.06,
            maxWidth: 950,
          }}
        >
          Pass your K53 licence faster
        </div>
        <div style={{ marginTop: 28, fontSize: 32, color: C.muted, maxWidth: 880 }}>
          AI-powered learner&apos;s &amp; driver&apos;s test prep for South Africa — 1,000+ real
          questions, mock exams, and a personal AI tutor.
        </div>
        <div
          style={{
            marginTop: 48,
            display: "flex",
            gap: 14,
            fontSize: 24,
            color: C.cream,
          }}
        >
          {["Signs", "Rules", "Controls", "Mock exams", "AI tutor"].map((t) => (
            <div
              key={t}
              style={{
                padding: "10px 22px",
                borderRadius: 9999,
                border: `1px solid ${C.hairline}`,
                background: "rgba(78,188,136,0.08)",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
