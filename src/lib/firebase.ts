// Firebase Configuration & Initialization
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig, validateFirebaseConfig } from './firebase-config';
import { shouldSkipFirebase } from './static-page-detection';

// Initialize Firebase
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let isInitializing = false;
let initializationPromise: Promise<FirebaseApp | null> | null = null;

// Function to safely initialize Firebase with better error handling
const initializeFirebase = async (): Promise<FirebaseApp | null> => {
  // Prevent multiple simultaneous initializations
  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }

  if (isInitializing) {
    return null;
  }

  // Check if we should skip Firebase initialization for static pages
  if (shouldSkipFirebase()) {
    // Skipping Firebase initialization on static page
    return null;
  }

  isInitializing = true;
  initializationPromise = (async () => {
    try {
      // Skip validation in Node environment (tests)
      if (typeof window === 'undefined') {
        // Return dummy app for server-side
        return {} as FirebaseApp;
      }

      // Validate configuration first (browser only)
      const validation = validateFirebaseConfig();
      if (!validation.isValid) {
        throw new Error(
          `Firebase configuration invalid. Missing: ${validation.missing.join(', ')}`
        );
      }

      // Initialize Firebase app (only once)
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }

      // Add offline persistence and better error handling
      if (app) {
        try {
          // Initialize Firestore with better error handling
          try {
            // Check if Firestore is already initialized
            const { getFirestore } = await import('firebase/firestore');

            try {
              // Try to get existing Firestore instance first
              db = getFirestore(app);
            } catch (error) {
              // If getFirestore fails, try to initialize with custom settings
              const { initializeFirestore } = await import(
                'firebase/firestore'
              );
              try {
                // Use the new cache settings instead of deprecated enableIndexedDbPersistence
                db = initializeFirestore(app, {
                  cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache
                  experimentalForceLongPolling: false,
                });
              } catch (persistenceError) {
                // If persistence fails, continue without it
                console.error(
                  'Firestore cache initialization failed:',
                  persistenceError
                );
                // Fallback to basic getFirestore
                db = getFirestore(app);
              }
            }
          } catch (firestoreError) {
            // Continue without Firestore
          }

          // Initialize Auth with better error handling
          try {
            const { getAuth } = await import('firebase/auth');
            auth = getAuth(app);
          } catch (authError) {
            // Auth initialization failed
          }

          // Initialize Storage with better error handling
          try {
            const { getStorage } = await import('firebase/storage');
            storage = getStorage(app);
          } catch (storageError) {
            // Storage initialization failed
          }
        } catch (error) {
          console.error('Firebase initialization error:', error);
          // Continue with basic app initialization
        }
      }

      return app;
    } catch (error: unknown) {
      console.error('Firebase app initialization failed:', error);
      // Return null but don't crash the app
      return null;
    } finally {
      isInitializing = false;
      initializationPromise = null;
    }
  })();

  return initializationPromise;
};

// Initialize Firebase only on client side and only on dynamic pages
if (typeof window !== 'undefined' && !app && !shouldSkipFirebase()) {
  // Initialize Firebase asynchronously to prevent blocking
  initializeFirebase().catch(error => {
    console.error('Firebase initialization failed:', error);
    // Initialize with dummy values to prevent app crash
    app = null;
    db = null;
    auth = null;
    storage = null;
  });
} else if (typeof window === 'undefined' || shouldSkipFirebase()) {
  // Server-side or static page: Initialize with dummy values to prevent errors
  app = null;
  db = null;
  auth = null;
  storage = null;
}

// Synchronous getter for auth (for backward compatibility)
export const getAuthSync = (): Auth | null => auth;

// Synchronous getter for storage (for backward compatibility)
export const getStorageSync = (): FirebaseStorage | null => storage;

// Synchronous getter for firestore (for backward compatibility)
export const getFirestoreSync = (): Firestore | null => db;

// Function to get Firestore service only when needed
export const getFirestoreService = async (retries = 5, delay = 300) => {
  if (typeof window === 'undefined' || shouldSkipFirebase()) {
    return null;
  }
  for (let i = 0; i < retries; i++) {
    if (!app) {
      try {
        await initializeFirebase();
      } catch (error) {
        console.error('Firebase initialization retry failed:', error);
        return null;
      }
    }
    if (db) return db;
    await new Promise(res => setTimeout(res, delay));
  }

  return null;
};

// Function to get Storage service only when needed
export const getStorageService = async (): Promise<FirebaseStorage | null> => {
  if (typeof window === 'undefined' || shouldSkipFirebase()) {
    return null;
  }

  // If Firebase hasn't been initialized yet, initialize it
  if (!app) {
    try {
      await initializeFirebase();
    } catch (error) {
      return null;
    }
  }

  // If storage is already initialized, return it
  if (storage) {
    return storage;
  }

  // Initialize storage if not already done
  if (!storage && app) {
    try {
      const { getStorage } = await import('firebase/storage');
      storage = getStorage(app);
    } catch (error) {
      console.error('Storage initialization failed:', error);
      return null;
    }
  }

  return storage;
};

// Function to get Auth service only when needed
export const getAuthService = async (): Promise<Auth | null> => {
  if (typeof window === 'undefined' || shouldSkipFirebase()) {
    return null;
  }

  // If Firebase hasn't been initialized yet, initialize it
  if (!app) {
    try {
      await initializeFirebase();
    } catch (error) {
      return null;
    }
  }

  // If auth is already initialized, return it
  if (auth) {
    return auth;
  }

  // Initialize auth if not already done
  if (!auth && app) {
    try {
      const { getAuth } = await import('firebase/auth');
      auth = getAuth(app);
    } catch (error) {
      console.error('Auth initialization failed:', error);
      return null;
    }
  }

  return auth;
};

export default app;
export { db, auth, storage };
