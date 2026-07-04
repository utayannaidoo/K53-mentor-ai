"use client";

import * as React from "react";

/** Minimal surface of the Web Speech API we rely on (no lib.dom types yet). */
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

type SpeechWindow = {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

/**
 * Dictation via the browser's built-in speech recognition (free, on-device or
 * browser-provided — no API cost). `supported` is false where the API doesn't
 * exist (e.g. Firefox), so callers can simply hide the mic.
 */
export function useSpeechInput(onText: (text: string) => void) {
  const [listening, setListening] = React.useState(false);
  const recRef = React.useRef<SpeechRecognitionLike | null>(null);
  const onTextRef = React.useRef(onText);
  onTextRef.current = onText;

  const supported = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    const w = window as unknown as SpeechWindow;
    return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
  }, []);

  const toggle = React.useCallback(() => {
    if (!supported) return;
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const w = window as unknown as SpeechWindow;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-ZA";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;
    rec.onresult = (e) => {
      const parts: string[] = [];
      for (let i = 0; i < e.results.length; i++) {
        const t = e.results[i][0]?.transcript;
        if (t) parts.push(t);
      }
      const text = parts.join(" ").trim();
      if (text) onTextRef.current(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, [supported, listening]);

  // Abort any in-flight recognition on unmount.
  React.useEffect(() => () => recRef.current?.abort(), []);

  return { supported, listening, toggle };
}
