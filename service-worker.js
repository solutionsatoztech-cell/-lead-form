const CACHE_NAME = "lead-form-v2";
const FILES_TO_CACHE = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  const url = new URL(event.request.url);

  // Only ever handle same-origin GET requests for our own static files.
  // Everything else (Supabase API calls, WhatsApp links, etc.) is left
  // completely untouched so the browser handles it normally.
  if (event.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(function () {
        return caches.match(event.request);
      })
      .then(function (response) {
        // Always resolve to a real Response, never undefined
        return response || new Response("Offline", { status: 503, statusText: "Offline" });
      })
  );
});
