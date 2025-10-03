/**
 * Service Worker for Portfolio Site
 * Implements efficient caching strategies for performance optimization
 */

const CACHE_NAME = 'portfolio-v2';
const STATIC_CACHE = 'portfolio-static-v2';
const DYNAMIC_CACHE = 'portfolio-dynamic-v2';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/dist/css/styles.min.css',
  '/dist/js/scripts.min.js',
  '/assets/images/profile/headshot.svg',
  '/assets/images/fallback-image.svg',
  '/assets/data/projects.json',
  '/assets/data/skills.json',
  '/resume.pdf'
];

// Assets to cache on first request
const DYNAMIC_ASSETS = [
  '/assets/images/projects/',
  '/assets/images/icons/'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
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
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(url.pathname)) {
      return await cacheFirst(request);
    }
    
    // Strategy 2: Stale While Revalidate for dynamic content
    if (isDynamicAsset(url.pathname)) {
      return await staleWhileRevalidate(request);
    }
    
    // Strategy 3: Network First for API calls and data
    if (isDataRequest(url.pathname)) {
      return await networkFirst(request);
    }
    
    // Default: Network First with cache fallback
    return await networkFirst(request);
    
  } catch (error) {
    console.error('Service Worker: Error handling request:', error);
    return await handleOffline(request);
  }
}

// Cache First Strategy - for static assets that rarely change
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Network error in cacheFirst:', error);
    throw error;
  }
}

// Stale While Revalidate Strategy - for assets that change occasionally
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const networkResponsePromise = fetch(request)
    .then(response => {
      if (response.ok) {
        const cache = caches.open(DYNAMIC_CACHE);
        cache.then(c => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(error => {
      console.error('Service Worker: Network error in staleWhileRevalidate:', error);
      return null;
    });
  
  return cachedResponse || await networkResponsePromise;
}

// Network First Strategy - for dynamic content and API calls
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Network error in networkFirst:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Offline fallback handler
async function handleOffline(request) {
  const url = new URL(request.url);
  
  // Try to find cached version
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Return appropriate offline fallbacks
  if (request.destination === 'document') {
    const offlineHTML = await caches.match('/index.html');
    return offlineHTML || new Response('Offline', { status: 503 });
  }
  
  if (request.destination === 'image') {
    const fallbackImage = await caches.match('/assets/images/fallback-image.svg');
    return fallbackImage || new Response('Image unavailable', { status: 503 });
  }
  
  return new Response('Resource unavailable offline', { status: 503 });
}

// Helper functions to determine asset types
function isStaticAsset(pathname) {
  return (
    pathname.includes('/dist/css/') ||
    pathname.includes('/dist/js/') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.pdf') ||
    pathname.includes('/assets/images/profile/') ||
    pathname.includes('/assets/images/icons/')
  );
}

function isDynamicAsset(pathname) {
  return (
    pathname.includes('/assets/images/projects/') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.webp')
  );
}

function isDataRequest(pathname) {
  return (
    pathname.includes('/assets/data/') ||
    pathname.endsWith('.json')
  );
}

// Background sync for form submissions (if supported)
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form') {
    event.waitUntil(syncContactForm());
  }
});

async function syncContactForm() {
  // Implementation for background sync of contact form
  // This would handle offline form submissions
  console.log('Service Worker: Syncing contact form submissions');
}

// Push notifications (if needed in the future)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/assets/images/icons/notification-icon.png',
      badge: '/assets/images/icons/badge-icon.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PERFORMANCE_MARK') {
    console.log('Service Worker: Performance mark:', event.data.mark);
  }
});

console.log('Service Worker: Loaded and ready');