"use client";

import * as React from "react";
import { Volume2, Square } from "lucide-react";
import { useSpeechOutput } from "@/hooks/use-speech-output";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * A speaker toggle that reads the given text aloud (tap to play, tap again to
 * stop). Renders nothing where the browser has no speech synthesis, so callers
 * can drop it in unconditionally. Used on question and flashcard surfaces for
 * accessibility and hands-free study.
 */
export function SpeakButton({
  text,
  label = "Read aloud",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const { supported, speaking, speak, stop } = useSpeechOutput();
  if (!supported) return null;
  return (
    <button
      type="button"
      aria-label={speaking ? "Stop reading" : label}
      aria-pressed={speaking}
      onClick={() => {
        if (speaking) {
          stop();
        } else {
          speak(text);
          track("tts_used");
        }
      }}
      className={cn(
        "press flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
        speaking
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
        className,
      )}
    >
      {speaking ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );
}
