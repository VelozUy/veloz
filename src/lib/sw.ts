// Service Worker Registration and Management
// Purpose: Handle service worker registration, updates, and cache management

interface ServiceWorkerMessage {
  type: string;
  data?: any;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean;

  constructor() {
    // Check if we're in a browser environment
    this.isSupported =
      typeof window !== 'undefined' && 'serviceWorker' in navigator;
  }

  // Register service worker
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined') {
      console.log('Service Worker: Not available on server side');
      return null;
    }

    if (!this.isSupported) {
      console.log('Service Worker: Not supported in this browser');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always fetch the latest version
      });

      console.log('Service Worker: Registered successfully', this.registration);

      // Handle service worker updates
      this.handleUpdates();

      // Handle service worker messages
      this.handleMessages();

      return this.registration;
    } catch (error) {
      console.error('Service Worker: Registration failed:', error);
      return null;
    }
  }

  // Handle service worker updates
  private handleUpdates(): void {
    if (typeof window === 'undefined' || !this.registration) return;

    // Check for updates on page load
    this.registration.update();

    // Listen for new service worker installation
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (!newWorker) return;

      console.log('Service Worker: Update found');

      newWorker.addEventListener('statechange', () => {
        if (
          newWorker.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          // New service worker is installed and ready
          console.log('Service Worker: New version available');
          this.showUpdateNotification();
        }
      });
    });

    // Handle service worker controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker: Controller changed');
      // Reload page to use new service worker
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    });
  }

  // Handle service worker messages
  private handleMessages(): void {
    if (typeof window === 'undefined') return;

    navigator.serviceWorker.addEventListener('message', event => {
      const message: ServiceWorkerMessage = event.data;

      switch (message.type) {
        case 'CACHE_CLEARED':
          console.log('Service Worker: Cache cleared successfully');
          break;
        case 'CACHE_ERROR':
          console.error('Service Worker: Cache error:', message.data);
          break;
        default:
          console.log('Service Worker: Received message:', message);
      }
    });
  }

  // Show update notification
  private showUpdateNotification(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined')
      return;

    // Create a simple notification for service worker updates
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      font-family: var(--font-sans);
      font-size: 0.875rem;
      cursor: pointer;
      transition: opacity 0.3s ease;
    `;
    notification.textContent =
      '🔄 Nueva versión disponible. Click para actualizar.';

    notification.addEventListener('click', () => {
      this.skipWaiting();
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    });

    document.body.appendChild(notification);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }
    }, 10000);
  }

  // Skip waiting and activate new service worker
  async skipWaiting(): Promise<void> {
    if (!this.registration || !this.registration.waiting) {
      return;
    }

    try {
      // Send skip waiting message to service worker
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      console.log('Service Worker: Skip waiting message sent');
    } catch (error) {
      console.error('Service Worker: Error skipping waiting:', error);
    }
  }

  // Clear all caches
  async clearCache(): Promise<void> {
    if (typeof window === 'undefined') {
      console.log('Service Worker: Not available on server side');
      return;
    }

    if (!this.isSupported) {
      console.log('Service Worker: Not supported');
      return;
    }

    try {
      // Send clear cache message to service worker
      if (navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = event => {
          if (event.data.type === 'CACHE_CLEARED') {
            console.log('Service Worker: Cache cleared successfully');
          }
        };

        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      } else {
        // Fallback: clear caches directly
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('Service Worker: Cache cleared directly');
      }
    } catch (error) {
      console.error('Service Worker: Error clearing cache:', error);
    }
  }

  // Get cache status
  async getCacheStatus(): Promise<{ [key: string]: number }> {
    if (typeof window === 'undefined') {
      return {};
    }

    if (!this.isSupported) {
      return {};
    }

    try {
      const cacheNames = await caches.keys();
      const cacheStatus: { [key: string]: number } = {};

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        cacheStatus[cacheName] = keys.length;
      }

      return cacheStatus;
    } catch (error) {
      console.error('Service Worker: Error getting cache status:', error);
      return {};
    }
  }

  // Check if service worker is active
  isActive(): boolean {
    if (typeof window === 'undefined') return false;
    return this.registration?.active?.state === 'activated';
  }

  // Get service worker state
  getState(): string | null {
    if (typeof window === 'undefined') return null;
    return this.registration?.active?.state || null;
  }

  // Unregister service worker (for testing/debugging)
  async unregister(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      this.registration = null;
      console.log('Service Worker: Unregistered successfully');
      return result;
    } catch (error) {
      console.error('Service Worker: Error unregistering:', error);
      return false;
    }
  }
}

// Create singleton instance
const serviceWorkerManager = new ServiceWorkerManager();

// Export functions for easy use
export const registerServiceWorker = () => serviceWorkerManager.register();
export const skipWaiting = () => serviceWorkerManager.skipWaiting();
export const clearCache = () => serviceWorkerManager.clearCache();
export const getCacheStatus = () => serviceWorkerManager.getCacheStatus();
export const isServiceWorkerActive = () => serviceWorkerManager.isActive();
export const getServiceWorkerState = () => serviceWorkerManager.getState();
export const unregisterServiceWorker = () => serviceWorkerManager.unregister();

// Export the manager instance for advanced usage
export default serviceWorkerManager;
