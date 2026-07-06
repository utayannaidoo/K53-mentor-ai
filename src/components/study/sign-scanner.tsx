"use client";

import * as React from "react";
import Link from "next/link";
import { Camera, Upload, ScanLine, RotateCcw, Sparkles, AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { fileToScaledBase64, type EncodedImage } from "@/lib/image";
import { cn, glass, glassFloat } from "@/lib/utils";
import { useStudyStore } from "@/hooks/use-study-store";
import { hasFeature } from "@/lib/billing/plans";
import { Paywall } from "@/components/app/paywall";

interface ScanResult {
  isSign: boolean;
  name: string;
  category: string;
  meaning: string;
  k53: string;
  confidence: "high" | "medium" | "low";
}

type Phase =
  | { kind: "idle" }
  | { kind: "preview"; image: EncodedImage; previewUrl: string }
  | { kind: "loading"; previewUrl: string }
  | { kind: "result"; previewUrl: string; result: ScanResult | null; text: string }
  | { kind: "error"; message: string };

const CATEGORY_BADGE: Record<string, "danger" | "warning" | "default" | "secondary"> = {
  regulatory: "danger",
  warning: "warning",
  information: "default",
  guidance: "default",
  marking: "secondary",
};

export function SignScanner() {
  const { state } = useStudyStore();
  const [phase, setPhase] = React.useState<Phase>({ kind: "idle" });
  const [hint, setHint] = React.useState("");
  const cameraRef = React.useRef<HTMLInputElement>(null);
  const uploadRef = React.useRef<HTMLInputElement>(null);

  // Vision calls are the priciest AI in the app — paid plans only. The server
  // enforces the same rule (/api/vision → 403 for free), this is just the UX.
  if (!hasFeature(state.tier, "scanner")) {
    return (
      <Paywall
        icon={<Camera className="h-6 w-6" />}
        title="Scanner is a Premium tool"
        description="Photograph any road sign and the AI identifies it, explains what it means, and tells you what K53 expects you to do. Included in Premium and Premium Plus."
        cta="Upgrade to unlock"
      />
    );
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      const image = await fileToScaledBase64(file);
      setPhase({
        kind: "preview",
        image,
        previewUrl: `data:${image.mediaType};base64,${image.data}`,
      });
    } catch {
      setPhase({ kind: "error", message: "Couldn't read that image — try another photo." });
    }
  }

  async function identify(image: EncodedImage, previewUrl: string) {
    setPhase({ kind: "loading", previewUrl });
    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image, hint: hint.trim() || undefined }),
      });
      if (res.status === 429) {
        const j = await res.json().catch(() => null);
        const wait = Math.ceil(Number(j?.retryAfter ?? 60) / 60);
        setPhase({
          kind: "error",
          message: `You've hit today's scan limit — it resets in about ${wait} minute${wait === 1 ? "" : "s"} to a few hours. The sign library is always open meanwhile.`,
        });
        return;
      }
      const j = await res.json();
      if (j.unavailable) {
        setPhase({
          kind: "error",
          message:
            "The scanner needs the AI provider, which isn't available right now. Describe the sign to the tutor instead — it can identify signs from a description.",
        });
        return;
      }
      if (!res.ok) throw new Error("scan failed");
      setPhase({ kind: "result", previewUrl, result: j.result ?? null, text: j.text ?? "" });
    } catch {
      setPhase({ kind: "error", message: "Something went wrong scanning that — please try again." });
    }
  }

  function reset() {
    setPhase({ kind: "idle" });
    setHint("");
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* Hidden inputs: rear camera on mobile; plain picker on desktop. */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {phase.kind === "idle" && (
        <Card className={cn(glassFloat, "p-8 text-center")}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ScanLine className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">
            Point at any road sign
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Snap a sign you don&apos;t recognise — on the road, in the manual, anywhere — and get
            its name, meaning and exactly what K53 expects you to do.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => cameraRef.current?.click()}>
              <Camera className="h-4 w-4" /> Take a photo
            </Button>
            <Button size="lg" variant="outline" onClick={() => uploadRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload one
            </Button>
          </div>
        </Card>
      )}

      {(phase.kind === "preview" || phase.kind === "loading" || phase.kind === "result") && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={phase.previewUrl}
          alt="Your sign photo"
          className="mx-auto max-h-72 rounded-2xl border border-border shadow-soft"
        />
      )}

      {phase.kind === "preview" && (
        <Card className={cn(glass, "mt-4 p-5")}>
          <Input
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="Optional hint — e.g. “the round blue one”"
          />
          <div className="mt-3 flex gap-3">
            <Button className="flex-1" onClick={() => identify(phase.image, phase.previewUrl)}>
              <ScanLine className="h-4 w-4" /> Identify this sign
            </Button>
            <Button variant="outline" onClick={reset} aria-label="Start over">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {phase.kind === "loading" && (
        <Card className={cn(glass, "mt-4 flex items-center justify-center gap-3 p-6")}>
          <Spinner className="h-5 w-5" />
          <p className="text-sm text-muted-foreground">Reading the sign…</p>
        </Card>
      )}

      {phase.kind === "result" && (
        <Card className={cn(glass, "mt-4 animate-scale-in p-6")}>
          {phase.result ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  {phase.result.name}
                </h2>
                {phase.result.isSign && (
                  <Badge variant={CATEGORY_BADGE[phase.result.category] ?? "secondary"}>
                    {phase.result.category}
                  </Badge>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground">{phase.result.meaning}</p>
              {phase.result.k53 && (
                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
                  <p className="text-sm font-semibold text-primary">What K53 expects you to do</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground">{phase.result.k53}</p>
                </div>
              )}
              {phase.result.confidence !== "high" && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  I&apos;m not fully certain — a clearer, closer photo helps.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm leading-relaxed text-foreground">{phase.text}</p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="outline" onClick={reset}>
              <Camera className="h-4 w-4" /> Scan another
            </Button>
            <Link href="/tutor" className={cn(buttonVariants({ variant: "ai" }))}>
              <Sparkles className="h-4 w-4" /> Ask the tutor about it
            </Link>
          </div>
        </Card>
      )}

      {phase.kind === "error" && (
        <Card className={cn(glass, "mt-4 p-6 text-center")}>
          <p className="text-sm leading-relaxed text-foreground">{phase.message}</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Try again
            </Button>
            <Link href="/study/signs" className={cn(buttonVariants({ variant: "outline" }))}>
              Browse the sign library
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
