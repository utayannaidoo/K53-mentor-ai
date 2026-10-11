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

/** The ad unit shown inside the signed-in app. */
export const ADSENSE_SLOT_APP = /^\d{6,20}$/.test(process.env.NEXT_PUBLIC_ADSENSE_SLOT_APP?.trim() ?? "")
  ? (process.env.NEXT_PUBLIC_ADSENSE_SLOT_APP as string).trim()
  : "";

export const isAdsConfigured = ADSENSE_CLIENT !== "" && ADSENSE_SLOT_APP !== "";

export const ADSENSE_SCRIPT_SRC = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

/**
 * Routes that never carry an ad, whatever the plan.
 *
 * - The tutor sizes itself to the viewport; anything below it pushes the
 *   composer under the tab bar (see AppShell).
 * - Mock exams are timed and tap-dense — an ad there costs the learner marks
 *   and invites the accidental clicks AdSense policy forbids.
 * - Account and billing are where someone pays or cancels; an ad beside a card
 *   form is the wrong neighbour.
 * - Onboarding, the diagnostic and the eye test are focused single-task flows.
 */
const AD_FREE_PREFIXES = [
  "/tutor",
  "/study/mock-exam",
  "/account",
  "/onboarding",
  "/diagnostic",
  "/eye-test",
  "/welcome",
  "/continue",
];

export function routeAllowsAds(pathname: string): boolean {
  return !AD_FREE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
