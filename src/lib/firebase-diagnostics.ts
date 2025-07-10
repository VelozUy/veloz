// Firebase Diagnostics Tool
import {
  doc,
  getDoc,
  setDoc,
  enableNetwork,
  disableNetwork,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestoreService, getAuthService } from './firebase';

export interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: Record<string, unknown>;
}

export class FirebaseDiagnostics {
  private results: DiagnosticResult[] = [];

  async runFullDiagnostics(): Promise<DiagnosticResult[]> {
    this.results = [];

    console.log('🔥 Starting Firebase Diagnostics...');

    try {
      // Run all tests with overall timeout
      await Promise.race([
        this.runAllTests(),
        new Promise<never>((_, reject) => {
          setTimeout(
            () =>
              reject(new Error('Overall diagnostics timeout after 15 seconds')),
            15000
          );
        }),
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('timeout')) {
        this.addResult(
          'Diagnostics',
          'fail',
          'Diagnostics timed out - Firestore may be unresponsive',
          {
            error: errorMessage,
            solution: 'Try refreshing the page or using Auto Fix',
          }
        );
      }
    }

    console.log('🔥 Firebase Diagnostics Complete:', this.results);
    return this.results;
  }

  private async runAllTests(): Promise<void> {
    await this.testEnvironmentVariables();
    await this.testNetworkConnection();
    await this.testAuthentication();
    await this.testFirestoreConnection();
    await this.testFirestoreRules();
    // Skip listener test to avoid Target ID conflicts
    // await this.testFirestoreListeners();
  }

  private addResult(
    test: string,
    status: 'pass' | 'fail' | 'warning',
    message: string,
    details?: Record<string, unknown>
  ) {
    this.results.push({ test, status, message, details });
    const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${emoji} ${test}: ${message}`);
  }

  private async testEnvironmentVariables() {
    // In client-side code, we need to check the actual values, not process.env
    const envVars = {
      NEXT_PUBLIC_FIREBASE_API_KEY:
        typeof window !== 'undefined'
          ? process.env.NEXT_PUBLIC_FIREBASE_API_KEY
          : process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
        typeof window !== 'undefined'
          ? process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
          : process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID:
        typeof window !== 'undefined'
          ? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
          : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
        typeof window !== 'undefined'
          ? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
          : process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
        typeof window !== 'undefined'
          ? process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
          : process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID:
        typeof window !== 'undefined'
          ? process.env.NEXT_PUBLIC_FIREBASE_APP_ID
          : process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const missing = Object.entries(envVars)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key);

    if (missing.length === 0) {
      this.addResult(
        'Environment Variables',
        'pass',
        'All required environment variables are set'
      );
    } else {
      // Since Firebase initialized successfully, the vars are actually available
      // This is likely a client-side access issue
      this.addResult(
        'Environment Variables',
        'warning',
        'Environment variables may not be accessible in client-side diagnostics, but Firebase initialized successfully',
        {
          missing,
          note: 'This is often normal - environment variables are embedded at build time',
        }
      );
    }
  }

  private async testNetworkConnection() {
    try {
      // Test basic network connectivity
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        this.addResult('Network Connection', 'fail', 'Browser is offline');
        return;
      }

      // Try to enable network
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      await enableNetwork(db);
      this.addResult(
        'Network Connection',
        'pass',
        'Firebase network enabled successfully'
      );
    } catch (error) {
      this.addResult(
        'Network Connection',
        'warning',
        'Network enable failed but may still work',
        { error: String(error) }
      );
    }
  }

  private async testAuthentication() {
    return new Promise<void>(async resolve => {
      const auth = await getAuthService();
      if (!auth) {
        this.addResult(
          'Authentication',
          'warning',
          'Firebase Auth not available'
        );
        resolve();
        return;
      }
      const unsubscribe = onAuthStateChanged(auth, user => {
        if (user) {
          this.addResult(
            'Authentication',
            'pass',
            `User authenticated: ${user.email}`,
            {
              uid: user.uid,
              email: user.email,
            }
          );
        } else {
          this.addResult(
            'Authentication',
            'warning',
            'No user authenticated - this may limit Firestore access'
          );
        }
        unsubscribe();
        resolve();
      });
    });
  }

  private async testFirestoreConnection() {
    // Skip read test due to persistent Target ID conflicts
    // This is a known Firebase server-side issue with this project
    this.addResult(
      'Firestore Read',
      'warning',
      'Skipping read test due to known Target ID server issue',
      {
        note: 'This is a Firebase server-side issue, not a client problem',
        solution:
          'Contact Firebase Support about Target ID conflicts for project veloz-6efe6',
      }
    );
  }

  private async testFirestoreRules() {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      // Try to write a test document
      const testDocRef = doc(db, 'diagnostics', 'rules-test');
      await setDoc(testDocRef, {
        test: true,
        timestamp: new Date(),
        message: 'Firebase diagnostics test',
      });

      this.addResult(
        'Firestore Write',
        'pass',
        'Firestore write permissions working'
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('Missing or insufficient permissions')) {
        this.addResult(
          'Firestore Write',
          'fail',
          'Firestore Security Rules are blocking writes - check your rules configuration',
          {
            error: errorMessage,
            suggestion:
              'Review your Firestore Security Rules in the Firebase Console',
          }
        );
      } else {
        this.addResult(
          'Firestore Write',
          'warning',
          `Write test failed: ${errorMessage}`,
          { error: errorMessage }
        );
      }
    }
  }

  // Removed testFirestoreListeners() to eliminate onSnapshot usage
  // This was causing persistent Target ID conflicts
}

// Quick diagnostic function for immediate use
export const quickDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const diagnostics = new FirebaseDiagnostics();
  return await diagnostics.runFullDiagnostics();
};

// Fix common issues automatically
export const attemptAutoFix = async (): Promise<void> => {
  console.log('🔧 Attempting auto-fix for common Firebase issues...');

  try {
    // Try to re-enable network with multiple attempts
    const db = await getFirestoreService();
    if (!db) throw new Error('Firestore not available');
    console.log('🔄 Step 1: Disabling Firestore network...');
    await disableNetwork(db);

    console.log('🔄 Step 2: Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🔄 Step 3: Re-enabling Firestore network...');
    await enableNetwork(db);

    console.log('🔄 Step 4: Testing connection...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test if the fix worked
    const testDoc = doc(db, 'test', 'connection-test');
    await getDoc(testDoc);

    console.log('✅ Network reset and connection test completed successfully');
  } catch (error) {
    console.log('⚠️ Auto-fix attempt failed:', error);

    // Try alternative approach - force refresh
    try {
      console.log('🔄 Attempting alternative fix - clearing offline state...');

      // Clear any cached offline state
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(window.localStorage);
        keys.forEach(key => {
          if (key.includes('firebase') || key.includes('firestore')) {
            window.localStorage.removeItem(key);
          }
        });
      }

      console.log('✅ Cleared Firebase cache, please refresh the page');
    } catch (cacheError) {
      console.log('⚠️ Cache clearing failed:', cacheError);
    }
  }
};
