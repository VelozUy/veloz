// Firebase Configuration & Initialization
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig, validateFirebaseConfig } from './firebase-config';

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
          // Initialize Firestore with offline persistence
          const { getFirestore, enableNetwork, disableNetwork } = await import('firebase/firestore');
          db = getFirestore(app);
          
          // Enable offline persistence
          const { enableIndexedDbPersistence } = await import('firebase/firestore');
          try {
            await enableIndexedDbPersistence(db);
            console.log('✅ Firebase offline persistence enabled');
          } catch (persistenceError) {
            // If persistence fails, continue without it
            console.warn('⚠️ Firebase offline persistence failed:', persistenceError);
          }

          // Initialize Auth with better error handling
          try {
            const { getAuth } = await import('firebase/auth');
            auth = getAuth(app);
            console.log('✅ Firebase Auth initialized');
          } catch (authError) {
            console.warn('⚠️ Firebase Auth initialization failed:', authError);
          }

          // Initialize Storage with better error handling
          try {
            const { getStorage } = await import('firebase/storage');
            storage = getStorage(app);
            console.log('✅ Firebase Storage initialized');
          } catch (storageError) {
            console.warn('⚠️ Firebase Storage initialization failed:', storageError);
          }

        } catch (firestoreError) {
          console.error('❌ Firebase Firestore initialization failed:', firestoreError);
          // Continue without Firestore
        }
      }

      console.log('✅ Firebase initialized successfully');
      return app;
    } catch (error: unknown) {
      console.error('❌ Firebase initialization failed:', error);
      
      // Return null but don't crash the app
      return null;
    } finally {
      isInitializing = false;
      initializationPromise = null;
    }
  })();

  return initializationPromise;
};

// Initialize Firebase only on client side to prevent SSR issues
if (typeof window !== 'undefined') {
  // Initialize Firebase asynchronously to prevent blocking
  initializeFirebase().catch(error => {
    console.error('❌ Firebase client initialization failed:', error);
    // Initialize with dummy values to prevent app crash
    app = null;
    db = null;
    auth = null;
    storage = null;
  });
} else {
  // Server-side: Initialize with dummy values to prevent errors
  app = null;
  db = null;
  auth = null;
  storage = null;
}

// Function to get Firestore service only when needed
export const getFirestoreService = async () => {
  if (typeof window === 'undefined') {
    return null;
  }

  // If Firebase hasn't been initialized yet, initialize it
  if (!app) {
    try {
      await initializeFirebase();
    } catch (error) {
      console.error('❌ Firebase initialization failed in getFirestoreService:', error);
      return null;
    }
  }

  return db;
};

// Function to get Storage service only when needed
export const getStorageService = async (): Promise<FirebaseStorage | null> => {
  if (typeof window === 'undefined') {
    console.warn('⚠️ Firebase Storage not available on server-side');
    return null;
  }

  // If Firebase hasn't been initialized yet, initialize it
  if (!app) {
    try {
      await initializeFirebase();
    } catch (error) {
      console.error('❌ Firebase initialization failed in getStorageService:', error);
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

      // Verify storage bucket is configured
      if (!firebaseConfig.storageBucket) {
        throw new Error(
          '❌ Firebase Storage Bucket not configured. Please set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
        );
      }

      console.log('✅ Firebase Storage initialized successfully');
    } catch (error) {
      console.error('❌ Firebase Storage initialization failed:', error);
      return null;
    }
  }

  return storage;
};

// Function to get Auth service only when needed
export const getAuthService = async (): Promise<Auth | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  // If Firebase hasn't been initialized yet, initialize it
  if (!app) {
    try {
      await initializeFirebase();
    } catch (error) {
      console.error('❌ Firebase initialization failed in getAuthService:', error);
      return null;
    }
  }

  return auth;
};

// Synchronous getter for storage (for backward compatibility)
export const getStorageSync = (): FirebaseStorage | null => storage;

// Synchronous getter for firestore (for backward compatibility)
export const getFirestoreSync = (): Firestore | null => db;

export default app;
export { db, auth, storage };
