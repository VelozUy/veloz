const CACHE_NAME = 'veloz-cache-v1';
const STATIC_CACHE = 'veloz-static-v1';
const DYNAMIC_CACHE = 'veloz-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/contact',
  '/about',
  '/our-work',
  '/_next/static/css/app/layout.css',
  '/redjola/Redjola.ttf',
  '/Roboto/static/Roboto-Regular.ttf',
  '/favicon.svg',
  '/og-image.jpg',
  '/twitter-image.jpg',
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (except for fonts and images)
  if (
    !url.origin.includes('veloz.com.uy') &&
    !url.origin.includes('localhost') &&
    !url.pathname.includes('fonts.googleapis.com') &&
    !url.pathname.includes('fonts.gstatic.com')
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then(response => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Clone the request for network fetch
      const fetchRequest = request.clone();

      return fetch(fetchRequest)
        .then(response => {
          // Check if response is valid
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();

          // Cache dynamic content
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.destination === 'document') {
            return caches.match('/');
          }
        });
    })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Get pending form submissions from IndexedDB
    const pendingSubmissions = await getPendingSubmissions();

    for (const submission of pendingSubmissions) {
      try {
        // Retry sending the form submission
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission.data),
        });

        if (response.ok) {
          // Remove from pending submissions
          await removePendingSubmission(submission.id);
        }
      } catch (error) {
        console.error('Background sync failed for submission:', submission.id);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// IndexedDB functions for offline form submissions
async function getPendingSubmissions() {
  // Implementation would depend on your IndexedDB setup
  return [];
}

async function removePendingSubmission(id) {
  // Implementation would depend on your IndexedDB setup
}

// Push notifications (if needed in the future)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Veloz',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/favicon.svg',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.svg',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification('Veloz', options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'));
  }
});
