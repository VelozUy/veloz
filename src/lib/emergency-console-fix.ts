// Emergency Console Fix - Run this in browser console to fix Firebase assertion errors
// Usage: In browser console, run: window.emergencyFirebaseFix()

declare global {
  interface Window {
    emergencyFirebaseFix: () => Promise<void>;
  }
}

const emergencyFirebaseFix = async (): Promise<void> => {
  // Starting Firebase fix...

  try {
    // Step 1: Clear all Firebase-related storage
    // Clearing storage...
    if (typeof localStorage !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (
          key.includes('firebase') ||
          key.includes('firestore') ||
          key.includes('google')
        ) {
          localStorage.removeItem(key);
          // Removed localStorage item
        }
      });
    }

    if (typeof sessionStorage !== 'undefined') {
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (
          key.includes('firebase') ||
          key.includes('firestore') ||
          key.includes('google')
        ) {
          sessionStorage.removeItem(key);
          // Removed sessionStorage item
        }
      });
    }

    // Step 2: Clear IndexedDB
    // Clearing IndexedDB...
    if ('indexedDB' in window) {
      try {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          if (db.name?.includes('firebase') || db.name?.includes('firestore')) {
            // Deleting IndexedDB
            indexedDB.deleteDatabase(db.name);
          }
        }
      } catch (error) {
        // IndexedDB cleanup failed
      }
    }

    // Step 3: Force page reload
    // Force reloading page in 2 seconds...
    // Emergency fix completed. Page will reload...

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {}
};

// Make it globally available
if (typeof window !== 'undefined') {
  window.emergencyFirebaseFix = emergencyFirebaseFix;
}

export { emergencyFirebaseFix };
