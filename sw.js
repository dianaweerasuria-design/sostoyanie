/* ===== Service Worker — Кеширование для PWA ===== */

const CACHE_NAME = 'sostoyanie-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/data.js',
  '/js/storage.js',
  '/js/entry.js',
  '/js/analytics.js',
  '/js/streak.js',
  '/js/calendar.js',
  '/js/history.js',
  '/js/achievements.js',
  '/js/partner.js',
  '/js/settings.js',
  '/js/app.js',
  '/manifest.json'
];

// Install — кешируем все ресурсы
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — чистим старые кеши
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — сначала сеть, потом кеш (для актуальности данных)
self.addEventListener('fetch', function(event) {
  // Только GET запросы
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then(function(response) {
      // Кешируем свежий ответ
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, clone);
      });
      return response;
    }).catch(function() {
      // Оффлайн — отдаём из кеша
      return caches.match(event.request);
    })
  );
});
