/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

// Assets to precache (built files + static files)
const ASSETS = [
  ...build, // the app itself
  ...files  // static files in `static/`
];

// Install event - cache all assets
sw.addEventListener('install', (event) => {
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  event.waitUntil(addFilesToCache());
});

// Activate event - clean up old caches
sw.addEventListener('activate', (event) => {
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
  }

  event.waitUntil(deleteOldCaches());
});

// Fetch event - serve from cache, fallback to network
sw.addEventListener('fetch', (event) => {
  // Ignore non-GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Don't cache WebSocket connections or Nostr relay connections
  if (url.protocol === 'wss:' || url.protocol === 'ws:') {
    return;
  }

  // Don't cache external API calls (except our own origin)
  if (url.origin !== location.origin && !url.pathname.startsWith('/_app/')) {
    return;
  }

  async function respond() {
    const cache = await caches.open(CACHE);

    // Try to serve from cache first (cache-first strategy for app assets)
    if (ASSETS.includes(url.pathname)) {
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // For navigation requests (HTML pages), use network-first strategy
    if (event.request.mode === 'navigate') {
      try {
        const networkResponse = await fetch(event.request);
        // Cache successful responses
        if (networkResponse.ok) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        // If offline, try to serve from cache
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If no cache, return offline page
        return new Response('Offline - Agora requires an internet connection', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/html'
          })
        });
      }
    }

    // For other requests (API, images, etc), try network first, fallback to cache
    try {
      const networkResponse = await fetch(event.request);

      // Cache successful responses for same-origin requests
      if (networkResponse.ok && url.origin === location.origin) {
        cache.put(event.request, networkResponse.clone());
      }

      return networkResponse;
    } catch (err) {
      // Network failed, try cache
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // No cache available
      return new Response('Network error', {
        status: 408,
        statusText: 'Request Timeout'
      });
    }
  }

  event.respondWith(respond());
});

// Handle push notifications (for future implementation)
sw.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/manifest-icon-192.png',
    badge: '/icons/manifest-icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    sw.registration.showNotification(data.title || 'Agora', options)
  );
});

// Handle notification clicks
sw.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    sw.clients.openWindow(event.notification.data?.url || '/')
  );
});

// Handle messages from the client
sw.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    sw.skipWaiting();
  }
});
