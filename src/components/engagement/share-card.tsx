"use client";

import * as React from "react";
import { Share2, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { useStudyStore } from "@/hooks/use-study-store";
import { buildPassport, passportMessage } from "@/lib/share/passport";
import { documentFonts, drawPassport, type ShareFormat } from "@/lib/share/draw-passport";
import { isSupabaseConfigured } from "@/lib/env";
import { track } from "@/lib/analytics";

/**
 * The share surface: a Driving Passport rendered to canvas, plus the message
 * that goes with it.
 *
 * Two objects ship, not one, because they reach different people. The image is
 * what gets posted to a WhatsApp Status or an Instagram Story; the text is what
 * survives being pasted into a group chat, where an image is a thumbnail
 * someone has to tap and six lines of coloured squares are not. Wordle proved
 * which of those travels further, so Copy sits next to Share rather than behind
 * a menu.
 *
 * The layout maths and palette live in `lib/share/draw-passport.ts`; what the
 * card is allowed to *claim* lives in `lib/share/passport.ts`. This file only
 * wires them to the store, the fonts and the platform share sheet.
 */

const FORMATS: { id: ShareFormat; label: string; hint: string }[] = [
  { id: "card", label: "Chat card", hint: "4:5 — WhatsApp, Instagram feed" },
  { id: "story", label: "Status", hint: "9:16 — WhatsApp Status, Stories" },
];

export function ShareCard() {
  const { state, readiness } = useStudyStore();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [format, setFormat] = React.useState<ShareFormat>("card");
  const [canShare, setCanShare] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [referralCode, setReferralCode] = React.useState<string | null>(null);

  // The invite code turns a share into a signup: the receiver gets a code, both
  // sides get 250 CP (see /api/referral). Absent in demo mode, and the card
  // falls back to its issue date in that corner.
  React.useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    fetch("/api/referral")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!cancelled && typeof j?.code === "string") setReferralCode(j.code);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const passport = React.useMemo(
    () => buildPassport(state, readiness, { referralCode }),
    [state, readiness, referralCode],
  );

  React.useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    const paint = () => {
      if (!cancelled && canvasRef.current) {
        drawPassport(canvasRef.current, passport, format, documentFonts());
      }
    };
    paint();
    // Overpass and JetBrains Mono load with `display: swap`, so the first paint
    // can land before the faces do — every measured width above (fitted names,
    // pill widths, tracked labels) would then be computed against a fallback.
    // Repainting once the document's fonts settle is what keeps the layout
    // true rather than approximately true.
    document.fonts?.ready.then(paint).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [passport, format]);

  const message = React.useMemo(() => passportMessage(passport), [passport]);

  async function toBlob(): Promise<Blob | null> {
    return new Promise((resolve) => canvasRef.current?.toBlob(resolve, "image/png"));
  }

  function saveBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `k53-driving-passport-${format}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function share() {
    const blob = await toBlob();
    const file = blob
      ? new File([blob], "k53-driving-passport.png", { type: "image/png" })
      : null;
    try {
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: message });
      } else {
        // Desktop Safari and most desktop Chrome can share text but not files.
        // Sending the message alone still lands the link and the score.
        await navigator.share({ text: message });
      }
      track("share_card_shared", { format });
    } catch {
      // A dismissed share sheet throws AbortError — nothing to report.
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      track("share_text_copied", { format });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — Share and Download still work */
    }
  }

  async function download() {
    const blob = await toBlob();
    if (!blob) return;
    saveBlob(blob);
    track("share_card_downloaded", { format });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {FORMATS.map((f) => (
          <Chip
            key={f.id}
            active={format === f.id}
            onClick={() => setFormat(f.id)}
            title={f.hint}
          >
            {f.label}
          </Chip>
        ))}
      </div>

      <div className="mt-3 flex justify-center">
        <canvas
          ref={canvasRef}
          className="rounded-2xl border border-border/60 shadow-soft-lg"
          style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: 620 }}
          aria-label={`Driving Passport: ${passport.hero.label.toLowerCase()} ${passport.hero.value}${passport.hero.unit}, ${passport.work.questions} questions, ${passport.work.cards} flashcards, ${passport.work.mocks} mock exams`}
          role="img"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {canShare && (
          <Button size="sm" className="gap-1.5" onClick={share}>
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
        )}
        <Button
          size="sm"
          variant={canShare ? "outline" : "default"}
          className="gap-1.5"
          onClick={copy}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy message"}
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={download}>
          <Download className="h-3.5 w-3.5" /> Save image
        </Button>
      </div>

      <details className="group mt-3">
        <summary className="cursor-pointer list-none text-xs text-muted-foreground transition-colors hover:text-foreground">
          <span className="underline underline-offset-4 decoration-border">
            Preview the message
          </span>
        </summary>
        <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-border/60 bg-muted/40 p-3 font-sans text-xs leading-relaxed text-muted-foreground">
          {message}
        </pre>
      </details>
    </div>
  );
}
