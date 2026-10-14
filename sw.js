const CACHE_NAME = 'legendary-collection-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './dashboard.html',
  './directory.html',
  './site.css',
  './css/print.css',
  './js/csv.js',
  './js/letter-generator.js',
  './js/dashboard.js',
  './js/auth.js',
  './js/supabase.js',
  './manifest.json'
];

// Install Event - Caching core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching core assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Cleaning up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
