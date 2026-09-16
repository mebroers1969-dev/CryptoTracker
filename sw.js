self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', function(event) {
  // Laat alle netwerkverzoeken (zoals Binance API) gewoon doorgaan
  event.respondWith(fetch(event.request).catch(function() {
    return caches.match(event.request);
  }));
});