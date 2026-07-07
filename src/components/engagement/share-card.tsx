"use client";

import * as React from "react";
import { Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudyStore } from "@/hooks/use-study-store";
import { RANKS } from "@/lib/engagement";

/**
 * WhatsApp-ready progress card: rendered on a canvas in Road Atlas colours
 * (canvas can't read CSS variables, so the palette is inlined), shared via
 * the Web Share API where available, downloadable everywhere else.
 */

const W = 1080;
const H = 608;
const C = {
  paper: "#F8F5EC",
  ink: "#1D2724",
  green: "#2C5F4F",
  greenLight: "#3F7A63",
  blue: "#1D5FB4",
  muted: "#6B7570",
  card: "#FFFFFF",
};

function draw(canvas: HTMLCanvasElement, d: { name: string; rank: string; readiness: number; streak: number; cp: number }) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = W;
  canvas.height = H;

  // Paper background + route-green header band
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.green;
  ctx.fillRect(0, 0, W, 148);

  // Road stripe motif under the header
  ctx.fillStyle = C.greenLight;
  ctx.fillRect(0, 148, W, 10);
  ctx.setLineDash([36, 28]);
  ctx.strokeStyle = C.paper;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 153);
  ctx.lineTo(W, 153);
  ctx.stroke();
  ctx.setLineDash([]);

  // Header text
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 44px system-ui, -apple-system, sans-serif";
  ctx.fillText("K53 MENTOR AI", 56, 76);
  ctx.font = "400 26px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("Driving Passport", 56, 116);

  // Name + rank
  ctx.fillStyle = C.ink;
  ctx.font = "700 52px system-ui, sans-serif";
  ctx.fillText(d.name, 56, 246);
  ctx.fillStyle = C.blue;
  ctx.font = "600 34px system-ui, sans-serif";
  ctx.fillText(`★ ${d.rank}`, 56, 300);

  // Stat blocks
  const stats = [
    { label: "READINESS", value: `${d.readiness}%` },
    { label: "DAY STREAK", value: `${d.streak}` },
    { label: "CONFIDENCE PTS", value: `${d.cp}` },
  ];
  stats.forEach((s, i) => {
    const x = 56 + i * 330;
    ctx.fillStyle = C.card;
    ctx.strokeStyle = "#E2DDCB";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, 348, 300, 150, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = C.green;
    ctx.font = "700 56px system-ui, sans-serif";
    ctx.fillText(s.value, x + 28, 424);
    ctx.fillStyle = C.muted;
    ctx.font = "600 20px system-ui, sans-serif";
    ctx.fillText(s.label, x + 28, 468);
  });

  // Footer
  ctx.fillStyle = C.muted;
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.fillText("Studying for my learner's with k53mentor.ai — come pass with me 🚗", 56, 560);
}

export function ShareCard() {
  const { state, readiness } = useStudyStore();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [canShare, setCanShare] = React.useState(false);

  const data = React.useMemo(
    () => ({
      name: state.profile?.name?.split(" ")[0] ?? "Learner",
      rank: RANKS[Math.min(state.rankAchieved, RANKS.length - 1)].name,
      readiness: readiness.readiness,
      streak: state.streak.current,
      cp: state.cp,
    }),
    [state.profile, state.rankAchieved, state.streak.current, state.cp, readiness.readiness],
  );

  React.useEffect(() => {
    if (canvasRef.current) draw(canvasRef.current, data);
    setCanShare(typeof navigator !== "undefined" && "share" in navigator && "canShare" in navigator);
  }, [data]);

  async function toBlob(): Promise<Blob | null> {
    return new Promise((res) => canvasRef.current?.toBlob((b) => res(b), "image/png"));
  }

  async function share() {
    const blob = await toBlob();
    if (!blob) return;
    const file = new File([blob], "k53-progress.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text: "My K53 progress 🚗" }).catch(() => {});
    } else {
      download(blob);
    }
  }

  function download(blob?: Blob) {
    const go = (b: Blob) => {
      const url = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = url;
      a.download = "k53-progress.png";
      a.click();
      URL.revokeObjectURL(url);
    };
    if (blob) go(blob);
    else void toBlob().then((b) => b && go(b));
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl border border-border shadow-soft"
        style={{ aspectRatio: `${W}/${H}` }}
        aria-label="Shareable progress card"
      />
      <div className="mt-3 flex gap-2">
        {canShare && (
          <Button size="sm" className="gap-1.5" onClick={share}>
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
        )}
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => download()}>
          <Download className="h-3.5 w-3.5" /> Download image
        </Button>
      </div>
    </div>
  );
}
