const CACHE_NAME = 'bizos-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// 1. Service Worker Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static app shell assets.');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Clearing old service worker cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Network Fetch interceptor
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Exclude API requests and WebSockets
  if (url.pathname.includes('/api/') || req.method !== 'GET') {
    return;
  }

  // Handle static assets (JS, CSS, images, fonts) -> Stale While Revalidate
  if (
    url.pathname.includes('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/fonts/')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(req).then((cachedResponse) => {
          const fetchPromise = fetch(req).then((networkResponse) => {
            cache.put(req, networkResponse.clone());
            return networkResponse;
          }).catch(() => cachedResponse); // Silent fallback on offline
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Handle HTML document routes -> Network First, falling back to cache
  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        // Cache successful document requests
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Retrieve from cache when offline
        return caches.match(req).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback root page cache if route match fails
          return caches.match('/');
        });
      })
  );
});
