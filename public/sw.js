self.addEventListener('install', () => {
  // Skip waiting to ensure the service worker activates immediately
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // Claim clients so the service worker controls the page immediately
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests to the network (no caching)
  // This satisfies the PWA requirement for a fetch handler without implementing offline support.
  event.respondWith(fetch(event.request));
});
