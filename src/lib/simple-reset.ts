// Simple Browser Reset - No Firebase Manipulation
export const simpleBrowserReset = () => {
  // Starting simple browser reset...

  if (typeof window !== 'undefined') {
    try {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      // Cleared localStorage and sessionStorage

      // Clear IndexedDB databases
      if ('indexedDB' in window) {
        indexedDB
          .databases()
          .then(databases => {
            databases.forEach(db => {
              if (db.name) {
                indexedDB.deleteDatabase(db.name);
                // Deleted IndexedDB
              }
            });
          })
          .catch(error => {
            // IndexedDB cleanup failed
          });
      }

      // Clear all caches
      if ('caches' in window) {
        caches
          .keys()
          .then(cacheNames => {
            cacheNames.forEach(cacheName => {
              caches.delete(cacheName);
              // Deleted cache
            });
          })
          .catch(error => {
            // Cache cleanup failed
          });
      }

      // Forcing hard reload...

      // Force hard reload with cache bypass
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('❌ Browser reset failed:', error);
      // Fallback - just reload
      window.location.reload();
    }
  }
};

// Alternative: Complete page replacement
export const forcePageReplace = () => {
  if (typeof window !== 'undefined') {
    // Clear everything immediately
    localStorage.clear();
    sessionStorage.clear();

    // Replace the entire page to bypass any cached state
    window.location.replace(window.location.href + '?reset=' + Date.now());
  }
};
