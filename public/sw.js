// Service Worker for Veloz - Performance Optimization
// Version: 1.0.1
// Purpose: Cache static assets and improve repeat visit performance

const CACHE_NAME = 'veloz-cache-v1.0.1';
const STATIC_CACHE_NAME = 'veloz-static-v1.0.1';
const DYNAMIC_CACHE_NAME = 'veloz-dynamic-v1.0.1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/favicon.svg',
  '/redjola/Redjola.otf',
  '/Roboto/static/Roboto-Regular.ttf',
  '/Roboto/static/Roboto-Bold.ttf',
  '/Roboto/static/Roboto-Italic.ttf',
];

// External domains to cache
const EXTERNAL_DOMAINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://www.google-analytics.com',
  'https://firebasestorage.googleapis.com',
  'https://storage.googleapis.com',
  'https://images.unsplash.com',
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME
            ) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Never cache HTML documents; always fetch network first with cache fallback
  if (request.destination === 'document') {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // Handle static assets (CSS, JS, images, fonts)
  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          // Return cached version
          return response;
        }

        // Fetch from network and cache
        return fetch(request)
          .then(networkResponse => {
            if (networkResponse.ok) {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE_NAME).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Return offline fallback for critical assets
            if (request.destination === 'document') {
              return caches.match('/');
            }
            return new Response('Offline', { status: 503 });
          });
      })
    );
    return;
  }

  // Handle API requests with cache-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          // Return cached version but update in background
          fetch(request)
            .then(networkResponse => {
              if (networkResponse.ok) {
                const responseClone = networkResponse.clone();
                caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                  cache.put(request, responseClone);
                });
              }
            })
            .catch(() => {
              // Silently fail background update
            });
          return response;
        }

        // Fetch from network and cache
        return fetch(request).then(networkResponse => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Handle external resources (fonts, images, etc.)
  if (isExternalResource(request)) {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          return response;
        }

        return fetch(request).then(networkResponse => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default: network-first for other requests
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  const staticExtensions = ['.css', '.js', '.json', '.xml', '.txt'];
  const staticDestinations = ['style', 'script', 'font', 'image'];

  return (
    staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
    staticDestinations.includes(request.destination) ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/public/')
  );
}

function isExternalResource(request) {
  const url = new URL(request.url);
  return EXTERNAL_DOMAINS.some(domain => url.href.startsWith(domain));
}

// Background sync for offline functionality
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Perform background sync tasks
    console.log('Service Worker: Performing background sync');
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error);
  }
}

// Message handling for cache management
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches
        .keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              return caches.delete(cacheName);
            })
          );
        })
        .then(() => {
          event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
        })
    );
  }
});

console.log('Service Worker: Loaded successfully');
