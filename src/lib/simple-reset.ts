// Simple Browser Reset - No Firebase Manipulation
export const simpleBrowserReset = () => {
  console.log('🧹 Starting simple browser reset...');

  if (typeof window !== 'undefined') {
    try {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ Cleared localStorage and sessionStorage');

      // Clear IndexedDB databases
      if ('indexedDB' in window) {
        indexedDB
          .databases()
          .then(databases => {
            databases.forEach(db => {
              if (db.name) {
                indexedDB.deleteDatabase(db.name);
                console.log(`✅ Deleted IndexedDB: ${db.name}`);
              }
            });
          })
          .catch(error => {
            console.log('⚠️ IndexedDB cleanup failed:', error);
          });
      }

      // Clear all caches
      if ('caches' in window) {
        caches
          .keys()
          .then(cacheNames => {
            cacheNames.forEach(cacheName => {
              caches.delete(cacheName);
              console.log(`✅ Deleted cache: ${cacheName}`);
            });
          })
          .catch(error => {
            console.log('⚠️ Cache cleanup failed:', error);
          });
      }

      console.log('🔄 Forcing hard reload...');

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
