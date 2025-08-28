// Improved SW with stale-while-revalidate for HTML/CSS/JS and cache-first for images
// This keeps the app instantly responsive while fetching fresh content in the background
const CACHE_NAME = 'swiftmart-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(STATIC_ASSETS);
    self.skipWaiting();
  })());
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass non-GET requests
  if (request.method !== 'GET') return;

  // Cache-first strategy for images and icons
  if (request.destination === 'image' || /\.(png|jpg|jpeg|webp|avif|svg)$/i.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response && response.status === 200) cache.put(request, response.clone());
      return response;
    })());
    return;
  }

  // Stale-while-revalidate for HTML/CSS/JS
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    const networkFetch = fetch(request).then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(() => cached);
    return cached || networkFetch;
  })());
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)));
    self.clients.claim();
  })());
});