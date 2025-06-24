// Emergency Console Fix - Run this in browser console to fix Firebase assertion errors
// Usage: In browser console, run: window.emergencyFirebaseFix()

declare global {
  interface Window {
    emergencyFirebaseFix: () => Promise<void>;
  }
}

const emergencyFirebaseFix = async (): Promise<void> => {
  console.log('🚨 EMERGENCY: Starting Firebase fix...');

  try {
    // Step 1: Clear all Firebase-related storage
    console.log('🧹 Step 1: Clearing storage...');
    if (typeof localStorage !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (
          key.includes('firebase') ||
          key.includes('firestore') ||
          key.includes('google')
        ) {
          localStorage.removeItem(key);
          console.log(`Removed localStorage: ${key}`);
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
          console.log(`Removed sessionStorage: ${key}`);
        }
      });
    }

    // Step 2: Clear IndexedDB
    console.log('🗄️ Step 2: Clearing IndexedDB...');
    if ('indexedDB' in window) {
      try {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          if (db.name?.includes('firebase') || db.name?.includes('firestore')) {
            console.log(`Deleting IndexedDB: ${db.name}`);
            indexedDB.deleteDatabase(db.name);
          }
        }
      } catch (error) {
        console.log('IndexedDB cleanup failed:', error);
      }
    }

    // Step 3: Force page reload
    console.log('🔄 Step 3: Force reloading page in 2 seconds...');
    console.log('✅ Emergency fix completed. Page will reload...');

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error('❌ Emergency fix failed:', error);
  }
};

// Make it globally available
if (typeof window !== 'undefined') {
  window.emergencyFirebaseFix = emergencyFirebaseFix;
}

export { emergencyFirebaseFix };
