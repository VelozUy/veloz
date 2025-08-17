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
    this.isSupported = 'serviceWorker' in navigator;
  }

  // Register service worker
  async register(): Promise<ServiceWorkerRegistration | null> {
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
    if (!this.registration) return;

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
      window.location.reload();
    });
  }

  // Handle service worker messages
  private handleMessages(): void {
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
    // Create a simple notification for service worker updates
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px hsl(var(--shadow));
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
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
    return this.registration?.active?.state === 'activated';
  }

  // Get service worker state
  getState(): string | null {
    return this.registration?.active?.state || null;
  }

  // Unregister service worker (for testing/debugging)
  async unregister(): Promise<boolean> {
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
