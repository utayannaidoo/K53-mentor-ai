import { PLAN_MAP, showsAds } from "@/lib/billing/plans";
import type { SubscriptionTier } from "@/types";

/**
 * Ad configuration (Google AdSense).
 *
 * Like every other integration, ads activate from env alone and the app runs
 * without them: with no publisher id set, no ad script is ever requested and
 * every slot renders nothing in production.
 *
 * `NEXT_PUBLIC_*` is inlined at build time, so changing either value needs a
 * redeploy. The same publisher id also widens the CSP (next.config.mjs) and
 * fills /ads.txt — one switch for all three.
 */

/** AdSense publisher id, e.g. "ca-pub-1234567890123456". */
const rawClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() ?? "";

export const ADSENSE_CLIENT = /^ca-pub-\d{10,20}$/.test(rawClient) ? rawClient : "";

/** The ad unit every slot serves, in the signed-in app and on public pages. */
export const ADSENSE_SLOT_APP = /^\d{6,20}$/.test(process.env.NEXT_PUBLIC_ADSENSE_SLOT_APP?.trim() ?? "")
  ? (process.env.NEXT_PUBLIC_ADSENSE_SLOT_APP as string).trim()
  : "";

export const isAdsConfigured = ADSENSE_CLIENT !== "" && ADSENSE_SLOT_APP !== "";

export const ADSENSE_SCRIPT_SRC = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

/**
 * Routes where the app shell does not add its ad below the page.
 *
 * No ad at all:
 * - The tutor sizes itself to the viewport; anything below it pushes the
 *   composer under the tab bar (see AppShell).
 * - Account and billing are where someone pays or cancels; an ad beside a card
 *   form is the wrong neighbour.
 * - Onboarding, /welcome and /continue are the signup funnel, and every ad
 *   impression in the app depends on people getting through them.
 * - The eye test is a focused single-task flow.
 *
 * The screen places its own ad, because only it knows what is on screen:
 * - Practice sessions change from question to results with no route change, so
 *   a shell slot would show one stale ad throughout. It would also land on
 *   "All caught up" and other empty states, and AdSense does not allow ads on
 *   screens without content.
 * - Mock exams are timed and tap-dense. An ad during one costs the learner marks
 *   and invites the accidental clicks AdSense policy forbids, so it appears only
 *   on the results.
 */
const NO_SHELL_AD_PREFIXES = [
  "/tutor",
  "/account",
  "/onboarding",
  "/eye-test",
  "/welcome",
  "/continue",
  "/study/questions",
  "/study/flashcards",
  "/study/scenarios",
  "/study/mock-exam",
];

/** Whether the app shell adds its ad below this route's content. */
export function shellPlacesAd(pathname: string): boolean {
  return !NO_SHELL_AD_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** The plan this browser last saw, from the study state blob. Null if unknown. */
function cachedTier(stateBlob: string | null): SubscriptionTier | null {
  if (!stateBlob) return null;
  try {
    const tier = (JSON.parse(stateBlob) as { tier?: unknown } | null)?.tier;
    return typeof tier === "string" && tier in PLAN_MAP ? (tier as SubscriptionTier) : null;
  } catch {
    return null;
  }
}

/** A live Supabase session cookie, chunked or not. Not its PKCE verifier cookie. */
const SESSION_COOKIE = /(?:^|;\s*)sb-[^=;]+-auth-token(?:\.\d+)?=/;

/**
 * Whether a visitor on a public page, where no study store is mounted, gets ads.
 *
 * A stranger does; that is who these pages are for. A browser that has cached a
 * plan follows that plan. The case left is someone signed in here whose plan this
 * browser has never seen: they may be paying, and "no ads" is what they paid for,
 * so they get none until the app has run once and the plan is known.
 *
 * It is a per-browser guess in one direction only. Someone who pays on another
 * device still sees public-page ads here until they next open the app here.
 */
export function publicVisitorSeesAds(stateBlob: string | null, cookies: string): boolean {
  const tier = cachedTier(stateBlob);
  if (tier) return showsAds(tier);
  return !SESSION_COOKIE.test(cookies);
}
