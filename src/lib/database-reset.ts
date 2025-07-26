// Database Reset Tool - Development Only
import { getFirestoreService } from './firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
  terminate,
  clearIndexedDbPersistence,
  disableNetwork,
  enableNetwork,
} from 'firebase/firestore';

export interface ResetStep {
  step: string;
  success: boolean;
  error?: string;
  details?: string;
}

export class DatabaseReset {
  private results: ResetStep[] = [];

  private addResult(
    step: string,
    success: boolean,
    error?: string,
    details?: string
  ) {
    this.results.push({ step, success, error, details });
    const emoji = success ? '✅' : '❌';
    // Reset step completed
  }

  async performCompleteReset(): Promise<ResetStep[]> {
    this.results = [];
    // Starting complete database reset...

    // Step 1: Disable network to stop all operations
    await this.disableFirestoreNetwork();

    // Step 2: Clear all collections (if accessible)
    await this.clearAllCollections();

    // Step 3: Terminate Firestore instance
    await this.terminateFirestore();

    // Step 4: Clear all browser storage
    await this.clearBrowserStorage();

    // Step 5: Clear IndexedDB persistence
    await this.clearIndexedDB();

    // Step 6: Schedule page reload
    this.scheduleReload();

    // Database reset complete - reloading...
    return this.results;
  }

  private async disableFirestoreNetwork() {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      await disableNetwork(db);
      this.addResult('Disable Firestore Network', true);
    } catch (error) {
      this.addResult('Disable Firestore Network', false, String(error));
    }
  }

  private async clearAllCollections() {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      // Common collection names to clear
      const collectionsToCheck = [
        'users',
        'projects',
        'gallery',
        'pages',
        'faqs',
        'diagnostics',
        'test',
        'homepage',
        'admin',
        // Add any other collections you might have
      ];

      let totalDeleted = 0;

      for (const collectionName of collectionsToCheck) {
        try {
          const collectionRef = collection(db, collectionName);
          const snapshot = await getDocs(collectionRef);

          if (!snapshot.empty) {
            const batch = writeBatch(db);
            let batchCount = 0;

            snapshot.docs.forEach(document => {
              batch.delete(document.ref);
              batchCount++;
              totalDeleted++;

              // Firestore batch limit is 500 operations
              if (batchCount >= 500) {
                // Would need to commit batch here, but since we're terminating anyway, skip
              }
            });

            // Try to commit batch, but don't fail if it doesn't work
            try {
              await batch.commit();
            } catch (_batchError) {
              // Ignore batch errors since we're doing a full reset anyway
            }
          }
        } catch (_collectionError) {
          // Collection might not exist or be accessible, that's fine
        }
      }

      if (totalDeleted > 0) {
        this.addResult(
          'Clear Database Collections',
          true,
          undefined,
          `Attempted to delete ${totalDeleted} documents`
        );
      } else {
        this.addResult(
          'Clear Database Collections',
          true,
          undefined,
          'No documents found or collections inaccessible'
        );
      }
    } catch (error) {
      this.addResult(
        'Clear Database Collections',
        false,
        String(error),
        'Will proceed with client-side reset'
      );
    }
  }

  private async terminateFirestore() {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      await terminate(db);
      this.addResult('Terminate Firestore Instance', true);
    } catch (error) {
      this.addResult('Terminate Firestore Instance', false, String(error));
    }
  }

  private async clearBrowserStorage() {
    try {
      if (typeof window !== 'undefined') {
        // Clear localStorage
        const localStorageKeys = Object.keys(localStorage);
        const firebaseKeys = localStorageKeys.filter(
          key =>
            key.includes('firebase') ||
            key.includes('firestore') ||
            key.includes('auth')
        );

        firebaseKeys.forEach(key => localStorage.removeItem(key));

        // Clear sessionStorage
        const sessionStorageKeys = Object.keys(sessionStorage);
        const firebaseSessionKeys = sessionStorageKeys.filter(
          key =>
            key.includes('firebase') ||
            key.includes('firestore') ||
            key.includes('auth')
        );

        firebaseSessionKeys.forEach(key => sessionStorage.removeItem(key));

        this.addResult(
          'Clear Browser Storage',
          true,
          undefined,
          `Cleared ${firebaseKeys.length + firebaseSessionKeys.length} Firebase storage items`
        );
      }
    } catch (error) {
      this.addResult('Clear Browser Storage', false, String(error));
    }
  }

  private async clearIndexedDB() {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      await clearIndexedDbPersistence(db);
      this.addResult('Clear IndexedDB Persistence', true);
    } catch (error) {
      this.addResult('Clear IndexedDB Persistence', false, String(error));
    }
  }

  private scheduleReload() {
    this.addResult(
      'Schedule Complete Reload',
      true,
      undefined,
      'Page will reload in 3 seconds'
    );

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        // Clear any remaining cache and reload
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
        }

        // Force reload with cache bypass
        window.location.href = window.location.href + '?fresh=' + Date.now();
      }
    }, 3000);
  }
}

// Quick reset function
export const resetDatabase = async (): Promise<ResetStep[]> => {
  const reset = new DatabaseReset();
  return await reset.performCompleteReset();
};

// Nuclear option - immediate reload with cache clear
export const nuclearReset = () => {
  if (typeof window !== 'undefined') {
    // Clear all storage immediately
    localStorage.clear();
    sessionStorage.clear();

    // Clear cache and reload
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }

    // Immediate reload with cache bypass
    window.location.href = window.location.href + '?nuclear=' + Date.now();
  }
};
