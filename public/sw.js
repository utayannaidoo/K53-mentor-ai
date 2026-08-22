/**
 * K53 Mentor service worker — cache-light PWA support tuned for prepaid data:
 *  - static assets (hashed /_next/static, sign images, favicon) cache-first
 *  - pages network-first with an offline fallback
 * The study data itself lives in localStorage, so an installed app can review
 * flashcards offline once the shell and content chunks are cached.
 */
const VERSION = "k53-sw-v1";
const OFFLINE_URL = "/offline";
// Cap on cached sign images. The catalogue holds ~440 PNGs; a learner who
// browses the whole library on a small prepaid device shouldn't be able to
// fill Cache Storage to quota with images they may never look at again.
// Insertion-order eviction is a decent recency proxy: entries are added as
// they are first fetched, so the oldest cached are the longest unrequested.
const MAX_SIGN_ENTRIES = 200;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll([OFFLINE_URL, "/favicon.svg"])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// A failed put (quota exceeded, private mode) must never surface as an
// unhandled rejection inside respondWith — the network response is already in
// hand and is returned either way.
function putSafe(request, response) {
  return caches.open(VERSION).then((cache) => cache.put(request, response));
}

async function putSignThenTrim(request, response) {
  const cache = await caches.open(VERSION);
  await cache.put(request, response);
  const keys = await cache.keys();
  const signKeys = keys.filter((k) => new URL(k.url).pathname.startsWith("/signs/"));
  for (let i = 0; i < signKeys.length - MAX_SIGN_ENTRIES; i++) {
    await cache.delete(signKeys[i]);
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin (Supabase, PostHog)
  if (url.pathname.startsWith("/api/")) return; // API calls are always live

  // Immutable build assets + sign images: cache-first.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/signs/") || url.pathname === "/favicon.svg") {
    event.respondWith(
      caches.match(request).then((hit) => {
        if (hit) return hit;
        return fetch(request).then((res) => {
          const copy = res.clone();
          // Sign images are the only unbounded family — trim as we go.
          if (url.pathname.startsWith("/signs/")) {
            event.waitUntil(putSignThenTrim(request, copy).catch(() => {}));
          } else {
            event.waitUntil(putSafe(request, copy).catch(() => {}));
          }
          return res;
        });
      }),
    );
    return;
  }

  // Page navigations: network-first, cached copy as fallback, then /offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          event.waitUntil(putSafe(request, copy).catch(() => {}));
          return res;
        })
        .catch(async () => (await caches.match(request)) ?? (await caches.match(OFFLINE_URL))),
    );
  }
});
