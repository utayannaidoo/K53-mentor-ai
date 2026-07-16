import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "K53 Mentor AI — Pass your K53 licence faster";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share card (og:image + twitter:image). Brand-blue glass over a deep slate field. */
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
          backgroundColor: "#0b1020",
          backgroundImage:
            "radial-gradient(900px 500px at 15% 0%, rgba(72,128,224,0.35), transparent 60%), radial-gradient(700px 400px at 90% 100%, rgba(122,92,220,0.25), transparent 60%)",
          color: "#f4f7fc",
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
            color: "#8fb2ee",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9999,
              background: "#4880e0",
              boxShadow: "0 0 24px rgba(72,128,224,0.9)",
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
        <div style={{ marginTop: 28, fontSize: 32, color: "#aab8d4", maxWidth: 880 }}>
          AI-powered learner&apos;s &amp; driver&apos;s test prep for South Africa — 500+ real
          questions, mock exams, and a personal AI tutor.
        </div>
        <div
          style={{
            marginTop: 48,
            display: "flex",
            gap: 14,
            fontSize: 24,
            color: "#c9d6ec",
          }}
        >
          {["Signs", "Rules", "Controls", "Mock exams", "AI tutor"].map((t) => (
            <div
              key={t}
              style={{
                padding: "10px 22px",
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.07)",
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
