/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RENDER CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Note: when using the Node APIs (`scripts/stills.mjs`), this file does not
 * apply — options are passed directly there instead.
 *
 * ── Why these settings ──────────────────────────────────────────────────────
 *
 * `setVideoImageFormat("png")` — not the jpeg default. This film is a dark
 * grade with wide, low-contrast gradients. JPEG intermediates quantise those
 * into visible contour rings, and no amount of encoder bitrate afterwards puts
 * the information back. PNG frames cost disk and a little time; banding costs
 * the whole look.
 *
 * `setCrf(15)` — h.264's default of 18 is tuned for daylight footage. Dark
 * gradients and film grain are the two hardest things for an encoder, and this
 * film is made of both. 15 is roughly a 60% larger file and the difference is
 * plainly visible in the glows.
 *
 * `setPixelFormat("yuv420p")` — kept, because it is the only chroma format
 * every player and social platform will accept. It is genuinely lossy for this
 * film: the accent green sits on near-black, and 4:2:0 throws away three
 * quarters of the colour resolution on exactly that kind of saturated edge, so
 * the thin green lines soften slightly. If you are mastering rather than
 * publishing, render ProRes instead — see `npm run render:master` — which keeps
 * 4:4:4 and gives a grade-able file.
 *
 * `setColorSpace("bt709")` — pinned rather than left to the encoder's guess, so
 * the greens do not shift between a browser preview and a player.
 *
 * `setConcurrency(null)` — let Remotion pick from the core count. Pinning it
 * high starves the browser instances when motion blur multiplies the work.
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setRspack(true);
Config.overrideWebpackConfig(enableTailwind);

Config.setVideoImageFormat("png");
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");
Config.setCrf(15);
Config.setOverwriteOutput(true);
Config.setConcurrency(null);
