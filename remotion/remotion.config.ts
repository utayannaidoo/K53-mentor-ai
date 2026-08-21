/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setOverwriteOutput(true);

// The promo is flat colour on cream with fine sign artwork and 1px glass
// edges. PNG keeps those free of the ringing JPEG puts around hard edges.
Config.setVideoImageFormat("png");

// Single source of truth for the sign catalogue: the Next app's public folder.
// `staticFile("signs/...")` resolves against this, so the film can never drift
// from the artwork the product actually ships.
//
// The sound design deliberately does NOT live here — it is imported from
// `src/sfx/` instead, which rspack resolves to an asset URL without any extra
// configuration. The web app has no business shipping the film's audio.
Config.setPublicDir("../public");
