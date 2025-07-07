// Firestore Reset Utility
// This fixes internal assertion errors and corrupted Firestore state

import { getFirestoreService } from './firebase';
import {
  disableNetwork,
  enableNetwork,
  clearIndexedDbPersistence,
  terminate,
} from 'firebase/firestore';

export interface ResetResult {
  step: string;
  success: boolean;
  error?: string;
}

export class FirestoreReset {
  private results: ResetResult[] = [];

  async performCompleteReset(): Promise<ResetResult[]> {
    this.results = [];
    console.log('🔄 Starting complete Firestore reset...');

    await this.step1_DisableNetwork();
    await this.step2_ClearLocalStorage();
    await this.step3_ClearIndexedDB();
    await this.step4_TerminateFirestore();

    // After termination, we need to reload the page to get a fresh instance
    this.addResult(
      'Schedule Page Reload',
      true,
      'Page will reload in 2 seconds to complete reset'
    );

    console.log('🔄 Firestore reset complete - reloading page...');

    // Schedule page reload after showing results
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 2000);

    return this.results;
  }

  private addResult(step: string, success: boolean, error?: string) {
    this.results.push({ step, success, error });
    const emoji = success ? '✅' : '❌';
    console.log(`${emoji} ${step}${error ? `: ${error}` : ''}`);
  }

  private async step1_DisableNetwork() {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      await disableNetwork(db);
      this.addResult('Disable Firestore Network', true);
    } catch (error) {
      this.addResult('Disable Firestore Network', false, String(error));
    }
  }

  private async step2_ClearLocalStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Clear all Firebase-related localStorage
        const keys = Object.keys(window.localStorage);
        const firebaseKeys = keys.filter(
          key =>
            key.includes('firebase') ||
            key.includes('firestore') ||
            key.includes('veloz-6efe6')
        );

        firebaseKeys.forEach(key => {
          window.localStorage.removeItem(key);
        });

        this.addResult(
          `Clear LocalStorage (${firebaseKeys.length} items)`,
          true
        );
      } else {
        this.addResult(
          'Clear LocalStorage',
          false,
          'Window or localStorage not available'
        );
      }
    } catch (error) {
      this.addResult('Clear LocalStorage', false, String(error));
    }
  }

  private async step3_ClearIndexedDB() {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      await clearIndexedDbPersistence(db);
      this.addResult('Clear IndexedDB Persistence', true);
    } catch (error) {
      // This is expected to fail if there are active connections
      this.addResult('Clear IndexedDB Persistence', false, String(error));
    }
  }

  private async step4_TerminateFirestore() {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      await terminate(db);
      this.addResult('Terminate Firestore Instance', true);
    } catch (error) {
      this.addResult('Terminate Firestore Instance', false, String(error));
    }
  }

  async performLightReset(): Promise<ResetResult[]> {
    this.results = [];
    console.log('🔄 Starting light Firestore reset...');

    await this.step1_DisableNetwork();
    await this.step2_ClearLocalStorage();
    // Skip IndexedDB clearing and termination
    await this.step5_EnableNetwork();
    await this.step6_TestConnection();

    console.log('🔄 Light Firestore reset complete:', this.results);
    return this.results;
  }

  private async step5_EnableNetwork() {
    try {
      // Wait a bit before re-enabling
      await new Promise(resolve => setTimeout(resolve, 2000));
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      await enableNetwork(db);
      this.addResult('Re-enable Firestore Network', true);
    } catch (error) {
      this.addResult('Re-enable Firestore Network', false, String(error));
    }
  }

  private async step6_TestConnection() {
    try {
      // Import here to avoid circular dependency
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      const { doc, getDoc } = await import('firebase/firestore');
      const testDoc = doc(db, 'test', 'reset-test');

      await Promise.race([
        getDoc(testDoc),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Test connection timeout')), 5000);
        }),
      ]);

      this.addResult('Test Connection', true);
    } catch (error) {
      this.addResult('Test Connection', false, String(error));
    }
  }

  async performTargetIdReset(): Promise<ResetResult[]> {
    this.results = [];
    console.log('🔄 Starting Target ID collision reset...');

    // Specific sequence for Target ID issues
    await this.step2_ClearLocalStorage();
    await this.step3_ClearIndexedDB();

    // Wait longer for cleanup
    this.addResult(
      'Wait for Cleanup',
      true,
      'Waiting 3 seconds for complete cleanup...'
    );
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Try to re-enable and test
    await this.step5_EnableNetwork();
    await this.step6_TestConnection();

    console.log('🔄 Target ID reset complete:', this.results);
    return this.results;
  }

  async performFullReset(): Promise<ResetResult[]> {
    this.results = [];
    try {
      await this.step1_DisableNetwork();
      await this.step4_TerminateFirestore();
    } catch (error) {
      this.addResult('Full Reset', false, String(error));
    }
    return this.results;
  }
}

// Quick reset function (full reset with termination)
export const resetFirestore = async (): Promise<ResetResult[]> => {
  const reset = new FirestoreReset();
  return await reset.performCompleteReset();
};

// Light reset function (without termination)
export const lightResetFirestore = async (): Promise<ResetResult[]> => {
  const reset = new FirestoreReset();
  return await reset.performLightReset();
};

// Target ID collision reset (specific for "Target ID already exists" errors)
export const resetTargetIdCollision = async (): Promise<ResetResult[]> => {
  const reset = new FirestoreReset();
  return await reset.performTargetIdReset();
};

// Emergency page reload (last resort)
export const emergencyReload = (): void => {
  console.log('🚨 Performing emergency page reload...');
  if (typeof window !== 'undefined') {
    // Clear all storage before reload
    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
    } catch (error) {
      console.warn('Could not clear storage:', error);
    }

    // Force reload with cache bypass
    window.location.reload();
  }
};
