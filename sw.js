const CACHE_NAME = 'hunggeroff-v4';
const STATIC_CACHE = 'hunggeroff-static-v4';
const DYNAMIC_CACHE = 'hunggeroff-dynamic-v4';

const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './image/logo.JPG',
    './image/logo2.png',
    './imageProductos/CHEDDAR.png',
    './imageProductos/LATINA.png',
    './imageProductos/PORKY (1).png',
    './imageProductos/RANCHÍZ.png',
    './adiciones.html',
    './asados.html',
    './bebidas.html'
];

// Install event - Force update
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Opened static cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force activation of new service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - Network first for HTML, cache first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // For HTML pages, try cache first for faster load, then network
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          // Return cached version immediately if available
          if (cachedResponse) {
            // Update cache in background
            fetch(request).then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
            }).catch(() => {});
            return cachedResponse;
          }
          // If not cached, fetch from network
          return fetch(request).then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  }
  // For images and other assets, try cache first, then network
  else if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|css|js|woff|woff2)$/)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            // Return cached version immediately
            return response;
          }
          // If not in cache, fetch and cache
          return fetch(request).then((fetchResponse) => {
            // Only cache successful responses
            if (fetchResponse && fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              // Cache in background to not block response
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone).catch(() => {
                  // Ignore cache errors
                });
              });
            }
            return fetchResponse;
          }).catch(() => {
            // If fetch fails, try to return from cache as fallback
            return caches.match(request);
          });
        })
    );
  }
  // For other requests, try network first
  else {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
    );
  }
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
