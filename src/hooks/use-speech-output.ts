"use client";

import * as React from "react";

/**
 * Text-to-speech via the browser's built-in speech synthesis (free, on-device
 * or browser-provided — no API cost). Reads questions and flashcards aloud for
 * accessibility and for studying hands-free (e.g. in a taxi). `supported` is
 * false where the API is missing, so callers can simply hide the speaker.
 *
 * A South African English voice is preferred when the platform offers one,
 * falling back to any English voice, then the default.
 */
export function useSpeechOutput() {
  const [speaking, setSpeaking] = React.useState(false);

  const supported = React.useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    [],
  );

  const pickVoice = React.useCallback((): SpeechSynthesisVoice | null => {
    if (!supported) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    return (
      voices.find((v) => v.lang === "en-ZA") ??
      voices.find((v) => v.lang === "en-GB") ??
      voices.find((v) => v.lang.startsWith("en")) ??
      null
    );
  }, [supported]);

  const stop = React.useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = React.useCallback(
    (text: string) => {
      if (!supported || !text.trim()) return;
      // Cancel anything already queued so a new tap always starts fresh.
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const voice = pickVoice();
      if (voice) u.voice = voice;
      u.lang = voice?.lang ?? "en-ZA";
      u.rate = 0.95; // a touch slower — clearer for learners and non-native speakers
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    },
    [supported, pickVoice],
  );

  // Stop any in-flight speech on unmount so it never bleeds across screens.
  React.useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { supported, speaking, speak, stop };
}
