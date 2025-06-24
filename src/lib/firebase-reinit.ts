// Firebase Reinitialization Tool
import { initializeApp, getApps, deleteApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  terminate,
  clearIndexedDbPersistence,
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './firebase-config';

export interface ReinitResult {
  step: string;
  success: boolean;
  error?: string;
}

export class FirebaseReinitializer {
  private results: ReinitResult[] = [];

  private addResult(step: string, success: boolean, error?: string) {
    this.results.push({ step, success, error });
    const emoji = success ? '✅' : '❌';
    console.log(`${emoji} ${step}${error ? `: ${error}` : ''}`);
  }

  async reinitializeFirebase(): Promise<ReinitResult[]> {
    this.results = [];
    console.log('🔄 Starting Firebase reinitialization...');

    // Step 1: Get all existing Firebase apps
    await this.destroyAllFirebaseApps();

    // Step 2: Clear all browser storage
    await this.clearAllStorage();

    // Step 3: Wait for cleanup
    await this.waitForCleanup();

    // Step 4: Initialize fresh Firebase instance
    await this.initializeFreshFirebase();

    // Step 5: Test the new instance
    await this.testNewInstance();

    console.log('🔄 Firebase reinitialization complete');
    return this.results;
  }

  private async destroyAllFirebaseApps() {
    try {
      const apps = getApps();
      console.log(`Found ${apps.length} Firebase apps to destroy`);

      for (const app of apps) {
        try {
          // Try to terminate Firestore for this app
          const db = getFirestore(app);
          await terminate(db);
          console.log(`Terminated Firestore for app: ${app.name}`);
        } catch (error) {
          console.log(
            `Could not terminate Firestore for app ${app.name}:`,
            error
          );
        }

        // Delete the app
        await deleteApp(app);
        console.log(`Deleted Firebase app: ${app.name}`);
      }

      this.addResult(
        'Destroy Firebase Apps',
        true,
        `Destroyed ${apps.length} apps`
      );
    } catch (error) {
      this.addResult('Destroy Firebase Apps', false, String(error));
    }
  }

  private async clearAllStorage() {
    try {
      if (typeof window !== 'undefined') {
        // Clear localStorage
        const localKeys = Object.keys(localStorage);
        localKeys.forEach(key => localStorage.removeItem(key));

        // Clear sessionStorage
        const sessionKeys = Object.keys(sessionStorage);
        sessionKeys.forEach(key => sessionStorage.removeItem(key));

        // Clear IndexedDB
        if ('indexedDB' in window) {
          try {
            // Try to clear Firebase-specific IndexedDB
            const databases = await indexedDB.databases();
            for (const db of databases) {
              if (
                db.name?.includes('firebase') ||
                db.name?.includes('firestore')
              ) {
                const deleteReq = indexedDB.deleteDatabase(db.name);
                await new Promise((resolve, reject) => {
                  deleteReq.onsuccess = () => resolve(undefined);
                  deleteReq.onerror = () => reject(deleteReq.error);
                });
              }
            }
          } catch (idbError) {
            console.log('IndexedDB cleanup failed:', idbError);
          }
        }

        // Clear caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }

        this.addResult(
          'Clear All Storage',
          true,
          'Cleared localStorage, sessionStorage, IndexedDB, and caches'
        );
      }
    } catch (error) {
      this.addResult('Clear All Storage', false, String(error));
    }
  }

  private async waitForCleanup() {
    this.addResult(
      'Wait for Cleanup',
      true,
      'Waiting 5 seconds for complete cleanup...'
    );
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  private async initializeFreshFirebase(): Promise<{
    app: FirebaseApp;
    db: Firestore;
    auth: Auth;
    storage: FirebaseStorage;
  } | null> {
    try {
      // Initialize completely fresh Firebase app
      const app = initializeApp(firebaseConfig, `fresh-${Date.now()}`);
      const db = getFirestore(app);
      const auth = getAuth(app);
      const storage = getStorage(app);

      this.addResult(
        'Initialize Fresh Firebase',
        true,
        'Created new Firebase instance'
      );

      return { app, db, auth, storage };
    } catch (error) {
      this.addResult('Initialize Fresh Firebase', false, String(error));
      return null;
    }
  }

  private async testNewInstance() {
    try {
      // We can't easily test here since we'd need to update the global instance
      // This will be handled by the page reload
      this.addResult(
        'Schedule Page Reload',
        true,
        'Page will reload in 3 seconds with fresh Firebase'
      );

      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = window.location.href + '?fresh=' + Date.now();
        }
      }, 3000);
    } catch (error) {
      this.addResult('Schedule Page Reload', false, String(error));
    }
  }
}

// Quick reinitialize function
export const reinitializeFirebase = async (): Promise<ReinitResult[]> => {
  const reinit = new FirebaseReinitializer();
  return await reinit.reinitializeFirebase();
};

// Force immediate reload after clearing everything
export const forceReload = () => {
  if (typeof window !== 'undefined') {
    // Clear everything immediately
    localStorage.clear();
    sessionStorage.clear();

    // Force reload with timestamp to bypass cache
    window.location.href = window.location.href + '?force=' + Date.now();
  }
};
