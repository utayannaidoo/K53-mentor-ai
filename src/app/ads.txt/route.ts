import { ADSENSE_CLIENT } from "@/lib/ads";

/**
 * /ads.txt — tells ad buyers that Google is authorised to sell this site's
 * inventory. AdSense flags the account until it can fetch this. Generated from
 * the same env var that turns ads on, so the two cannot disagree; 404 when ads
 * are not configured.
 */
export function GET() {
  if (!ADSENSE_CLIENT) return new Response("Not found", { status: 404 });
  const publisher = ADSENSE_CLIENT.replace(/^ca-/, "");
  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
