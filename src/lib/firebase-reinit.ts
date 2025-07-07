// Firebase Reinitialization Utility
// Handles Firestore internal assertion errors and reinitializes Firebase when needed

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let isReinitializing = false;

// Track reinitialization attempts to prevent infinite loops
let reinitAttempts = 0;
const MAX_REINIT_ATTEMPTS = 3;

export const reinitializeFirebase = async (): Promise<boolean> => {
  if (isReinitializing || reinitAttempts >= MAX_REINIT_ATTEMPTS) {
    console.warn(
      '🔥 Firebase reinitialization skipped - already in progress or max attempts reached'
    );
    return false;
  }

  try {
    isReinitializing = true;
    reinitAttempts++;

    console.log(
      `🔥 Reinitializing Firebase (attempt ${reinitAttempts}/${MAX_REINIT_ATTEMPTS})`
    );

    // Clear existing instances
    app = null;
    db = null;

    // Reinitialize Firebase
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    // Reinitialize Firestore
    if (app) {
      db = getFirestore(app);

      // In development, connect to emulator if available
      if (
        process.env.NODE_ENV === 'development' &&
        process.env.NEXT_PUBLIC_FIREBASE_EMULATOR
      ) {
        try {
          connectFirestoreEmulator(db, 'localhost', 8080);
          console.log('🔥 Connected to Firestore emulator');
        } catch (error) {
          console.warn('🔥 Could not connect to Firestore emulator:', error);
        }
      }
    }

    console.log('✅ Firebase reinitialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Firebase reinitialization failed:', error);
    return false;
  } finally {
    isReinitializing = false;
  }
};

export const resetReinitAttempts = (): void => {
  reinitAttempts = 0;
};

export const getReinitAttempts = (): number => {
  return reinitAttempts;
};

export const isReinitializingFirebase = (): boolean => {
  return isReinitializing;
};

// Check if error is a Firestore internal assertion error
export const isFirestoreInternalError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;

  const errorMessage = (error as { message?: string }).message || '';
  const errorCode = (error as { code?: string }).code || '';

  return (
    errorMessage.includes('INTERNAL ASSERTION FAILED') ||
    errorMessage.includes('Unexpected state') ||
    errorCode === 'internal' ||
    (errorMessage.includes('FIRESTORE') && errorMessage.includes('INTERNAL'))
  );
};

// Safe operation wrapper that handles Firestore internal errors
export const withFirestoreRecovery = async <T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (isFirestoreInternalError(error)) {
      console.warn(
        '🔥 Detected Firestore internal error, attempting recovery...'
      );

      const reinitSuccess = await reinitializeFirebase();
      if (reinitSuccess) {
        try {
          console.log('🔥 Retrying operation after reinitialization...');
          return await operation();
        } catch (retryError) {
          console.error(
            '🔥 Operation failed after reinitialization:',
            retryError
          );
          if (fallback !== undefined) {
            console.warn('🔥 Using fallback value');
            return fallback;
          }
          throw retryError;
        }
      } else {
        console.error('🔥 Firebase reinitialization failed, cannot recover');
        if (fallback !== undefined) {
          console.warn('🔥 Using fallback value');
          return fallback;
        }
        throw error;
      }
    } else {
      // Not a Firestore internal error, rethrow
      throw error;
    }
  }
};

// Export current instances for external use
export { app, db };
