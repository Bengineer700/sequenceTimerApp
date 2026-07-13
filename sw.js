/* Sequence PWA service worker */
// CACHE_VERSION identifies this build. Installed apps update when it changes.
// If you deploy via the included GitHub Action, it auto-stamps this with the
// commit hash on every push — you don't need to touch it.
// If you host another way (e.g. Netlify Drop), bump it manually (v3 -> v4 ...)
// whenever you change any app file.
const CACHE_VERSION = 'sequence-v3';
const APP_SHELL = [
  '.',
  'index.html',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'apple-touch-icon.png',
  'favicon-32.png'
];

// Install: precache the local app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate: drop old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
//  - Navigations: network-first, fall back to cached index.html when offline.
//  - Same-origin assets: cache-first.
//  - Cross-origin (Google Fonts, etc.): stale-while-revalidate so they work offline.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('index.html'))
    );
    return;
  }

  if (sameOrigin) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          return res;
        })
      )
    );
    return;
  }

  // Cross-origin: stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE_VERSION).then((cache) =>
      cache.match(req).then((cached) => {
        const network = fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    )
  );
});
