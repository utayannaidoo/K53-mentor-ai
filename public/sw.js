/**
 * K53 Mentor service worker — cache-light PWA support tuned for prepaid data:
 *  - static assets (hashed /_next/static, sign images, favicon) cache-first
 *  - pages network-first with an offline fallback
 * The study data itself lives in localStorage, so an installed app can review
 * flashcards offline once the shell and content chunks are cached.
 */
const VERSION = "k53-sw-v1";
const OFFLINE_URL = "/offline";

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

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin (Supabase, PostHog)
  if (url.pathname.startsWith("/api/")) return; // API calls are always live

  // Immutable build assets + sign images: cache-first.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/signs/") || url.pathname === "/favicon.svg") {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // Page navigations: network-first, cached copy as fallback, then /offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(async () => (await caches.match(request)) ?? (await caches.match(OFFLINE_URL))),
    );
  }
});
