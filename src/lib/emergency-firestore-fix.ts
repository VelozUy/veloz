// Emergency Firestore Fix for Cascading Internal Assertion Errors
// Use this when you get ID: ca9, b815, or similar cascading failures

import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getFirestore, terminate, disableNetwork } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';

interface EmergencyFixResult {
  step: string;
  success: boolean;
  error?: string;
}

export class EmergencyFirestoreFix {
  private results: EmergencyFixResult[] = [];

  private addResult(step: string, success: boolean, error?: string) {
    this.results.push({ step, success, error });
    console.log(`${success ? '✅' : '❌'} ${step}${error ? `: ${error}` : ''}`);
  }

  async executeEmergencyFix(): Promise<EmergencyFixResult[]> {
    console.log('🚨 EMERGENCY: Executing cascading assertion error fix...');
    this.results = [];

    // Step 1: Clear all localStorage/sessionStorage
    await this.clearAllBrowserStorage();

    // Step 2: Terminate all Firebase apps
    await this.terminateAllFirebaseApps();

    // Step 3: Clear IndexedDB persistence
    await this.clearIndexedDbData();

    // Step 4: Force garbage collection pause
    await this.forceGarbageCollectionPause();

    // Step 5: Reinitialize fresh Firebase
    await this.reinitializeFreshFirebase();

    // Step 6: Force page reload
    this.forcePageReload();

    return this.results;
  }

  private async clearAllBrowserStorage() {
    try {
      if (typeof window !== 'undefined') {
        // Clear localStorage
        const localStorageKeys = Object.keys(window.localStorage);
        localStorageKeys.forEach(key => {
          if (
            key.includes('firebase') ||
            key.includes('firestore') ||
            key.includes('google')
          ) {
            window.localStorage.removeItem(key);
          }
        });

        // Clear sessionStorage
        const sessionStorageKeys = Object.keys(window.sessionStorage);
        sessionStorageKeys.forEach(key => {
          if (
            key.includes('firebase') ||
            key.includes('firestore') ||
            key.includes('google')
          ) {
            window.sessionStorage.removeItem(key);
          }
        });

        this.addResult('Clear Browser Storage', true);
      }
    } catch (error) {
      this.addResult('Clear Browser Storage', false, String(error));
    }
  }

  private async terminateAllFirebaseApps() {
    try {
      const apps = getApps();
      console.log(`Found ${apps.length} Firebase apps to terminate`);

      for (const app of apps) {
        try {
          // Try to disable network first
          const db = getFirestore(app);
          await disableNetwork(db);
          await terminate(db);
        } catch (error) {
          console.log(
            `Could not terminate Firestore for app ${app.name}:`,
            error
          );
        }

        // Delete the app
        await deleteApp(app);
      }

      this.addResult(
        'Terminate Firebase Apps',
        true,
        `Terminated ${apps.length} apps`
      );
    } catch (error) {
      this.addResult('Terminate Firebase Apps', false, String(error));
    }
  }

  private async clearIndexedDbData() {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        // Try to clear Firebase-related IndexedDB databases
        const databases = await indexedDB.databases();

        for (const db of databases) {
          if (db.name?.includes('firebase') || db.name?.includes('firestore')) {
            try {
              indexedDB.deleteDatabase(db.name);
            } catch (error) {
              console.log(`Could not delete IndexedDB ${db.name}:`, error);
            }
          }
        }

        this.addResult('Clear IndexedDB', true);
      }
    } catch (error) {
      this.addResult('Clear IndexedDB', false, String(error));
    }
  }

  private async forceGarbageCollectionPause() {
    try {
      // Force a pause to allow garbage collection and cleanup
      await new Promise(resolve => setTimeout(resolve, 3000));
      this.addResult('Garbage Collection Pause', true);
    } catch (error) {
      this.addResult('Garbage Collection Pause', false, String(error));
    }
  }

  private async reinitializeFreshFirebase() {
    try {
      // Initialize completely fresh Firebase app with timestamp
      const freshApp = initializeApp(firebaseConfig, `emergency-${Date.now()}`);
      const freshDb = getFirestore(freshApp);

      // Export fresh instances for immediate use
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__EMERGENCY_FIREBASE = {
        app: freshApp,
        db: freshDb,
      };

      this.addResult('Reinitialize Fresh Firebase', true);
    } catch (error) {
      this.addResult('Reinitialize Fresh Firebase', false, String(error));
    }
  }

  private forcePageReload() {
    try {
      console.log('🔄 Force reloading page in 2 seconds...');
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 2000);
      this.addResult('Schedule Page Reload', true);
    } catch (error) {
      this.addResult('Schedule Page Reload', false, String(error));
    }
  }
}

// Immediate use function
export const executeEmergencyFirestoreFix = async (): Promise<
  EmergencyFixResult[]
> => {
  const fixer = new EmergencyFirestoreFix();
  return await fixer.executeEmergencyFix();
};

// Console-accessible emergency function
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).emergencyFirestoreFix = executeEmergencyFirestoreFix;
}
