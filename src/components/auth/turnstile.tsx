"use client";

import * as React from "react";
import { isCaptchaConfigured, TURNSTILE_SCRIPT_SRC } from "@/lib/auth/captcha";

/**
 * Cloudflare Turnstile, GoTrue-native: Supabase verifies the token server-side
 * (secret in the dashboard), so this component only loads the widget when the
 * operator published a site key, collects its token, and exposes just enough
 * state for auth-form to stop doomed submits with an inline message. Without
 * the key it is a complete no-op — nothing renders, nothing loads, demo mode
 * never notices. Loaded via script tag from challenges.cloudflare.com by
 * design; deliberately not an npm dependency.
 */

// NEXT_PUBLIC_* is inlined at build time, so this snapshot is baked per deploy.
const CAPTCHA_ENABLED = isCaptchaConfigured();
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

interface TurnstileRenderParams {
  sitekey: string;
  theme: "auto";
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
}

/** The slice of the global `window.turnstile` API this module uses. */
interface TurnstileApi {
  render: (el: HTMLElement, params: TurnstileRenderParams) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
}

// Narrow accessor instead of `declare global` Window augmentation — keeps this
// file free of a global type that any future script could collide with.
function turnstileGlobal(): TurnstileApi | undefined {
  return (globalThis as { turnstile?: TurnstileApi }).turnstile;
}

let scriptPromise: Promise<TurnstileApi> | null = null;

/**
 * Load api.js exactly once per page (StrictMode double-mounts and login/signup
 * could otherwise both inject it). Resolves once window.turnstile exists;
 * rejects on script error or if Cloudflare is unreachable within ~10s so the
 * caller can fail into its warning state instead of waiting forever.
 */
function loadTurnstile(): Promise<TurnstileApi> {
  const ready = turnstileGlobal();
  if (ready) return Promise.resolve(ready);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    // A blocked/unreachable challenges.cloudflare.com must surface as the
    // inline "verification unavailable" message, not a silent spinner.
    const timer = setTimeout(() => {
      scriptPromise = null; // let a later mount retry from scratch
      reject(new Error("Turnstile script timed out"));
    }, 10_000);

    const settle = () => {
      clearTimeout(timer);
      const api = turnstileGlobal();
      if (api) resolve(api);
      else {
        scriptPromise = null;
        reject(new Error("Turnstile loaded without its API"));
      }
    };
    const fail = () => {
      clearTimeout(timer);
      scriptPromise = null;
      reject(new Error("Turnstile script failed to load"));
    };

    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${TURNSTILE_SCRIPT_SRC}"]`,
    );
    if (!script) {
      script = document.createElement("script");
      script.src = TURNSTILE_SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", settle);
    script.addEventListener("error", fail);
  });
  return scriptPromise;
}

export interface TurnstileController {
  /** Operator turned Turnstile on (site key baked in at build time). */
  enabled: boolean;
  /** Solved-challenge token; null until solved and after expiry/error. */
  token: string | null;
  /** Widget finished mounting and can accept interaction. */
  ready: boolean;
  /** Script failed/timed out or the widget errored — verification unavailable. */
  failed: boolean;
  /** Imperative handle; reset() forces a fresh challenge after a failed submit. */
  widget: { reset: () => void };
  /** Attach to the container div Turnstile renders into. */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useTurnstile(): TurnstileController {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetId = React.useRef<string | undefined>(undefined);
  const [token, setToken] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!CAPTCHA_ENABLED) return;
    let cancelled = false;
    loadTurnstile()
      .then((api) => {
        if (cancelled) return;
        const el = containerRef.current;
        if (!el) return;
        widgetId.current = api.render(el, {
          sitekey: SITE_KEY,
          theme: "auto",
          callback: (t) => setToken(t),
          // Token aged out unsolved — not an error; the widget re-issues a
          // challenge on its own, only the stale token must go.
          "expired-callback": () => setToken(null),
          "error-callback": () => {
            setToken(null);
            setFailed(true);
          },
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      const id = widgetId.current;
      if (id !== undefined) {
        turnstileGlobal()?.remove(id);
        widgetId.current = undefined;
      }
    };
  }, []);

  const reset = React.useCallback(() => {
    setToken(null);
    const id = widgetId.current;
    if (id !== undefined) turnstileGlobal()?.reset(id);
  }, []);

  return { enabled: CAPTCHA_ENABLED, token, ready, failed, widget: { reset }, containerRef };
}

/**
 * Renders the challenge slot plus the failure warning. Nothing without a site
 * key; the warning text is why `failed` blocks submit — the learner gets told
 * what happened instead of a raw GoTrue rejection after the fact.
 */
export function TurnstileChallenge({ controller }: { controller: TurnstileController }) {
  if (!controller.enabled) return null;
  return (
    <div className="space-y-1.5">
      {/* Cloudflare paints the challenge into this node; sizing comes from its iframe. */}
      <div ref={controller.containerRef} />
      {controller.failed && (
        <p role="alert" className="text-xs leading-relaxed text-muted-foreground">
          The verification check couldn&apos;t load just now — please retry in a moment, or refresh
          the page if it keeps failing.
        </p>
      )}
    </div>
  );
}
