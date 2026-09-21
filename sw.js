const CACHE_NAME = 'crypto-tracker-v2';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(APP_SHELL);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function(name) {
              return name !== CACHE_NAME;
            })
            .map(function(name) {
              return caches.delete(name);
            })
        );
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function(event) {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Externe diensten zoals Binance, Firebase en TradingView
  // blijven netwerk-first.
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request).catch(function() {
        return caches.match(request);
      })
    );
    return;
  }

  // Eigen app-bestanden: eerst uit de lokale cache.
  event.respondWith(
    caches.match(request).then(function(cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then(function(networkResponse) {
        if (networkResponse && networkResponse.ok) {
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, responseToCache);
          });
        }

        return networkResponse;
      });
    })
  );
});