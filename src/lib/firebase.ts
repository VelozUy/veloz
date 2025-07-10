// Firebase Configuration & Initialization
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig, validateFirebaseConfig } from './firebase-config';

// Initialize Firebase
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

// Function to safely initialize Firebase
const initializeFirebase = () => {
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

    return app;
  } catch (error: unknown) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
};

// Initialize Firebase only on client side to prevent SSR issues
if (typeof window !== 'undefined') {
  try {
    app = initializeFirebase();

    // Initialize Firestore only if app is available
    if (app) {
      db = getFirestore(app);
    }

    // Dynamic imports to avoid SSR issues
    if (app) {
      import('firebase/auth')
        .then(({ getAuth }) => {
          auth = getAuth(app!);
        })
        .catch(error => {
          console.warn('Firebase Auth not available:', error);
        });

      import('firebase/storage')
        .then(({ getStorage }) => {
          storage = getStorage(app!);
        })
        .catch(error => {
          console.warn('Firebase Storage not available:', error);
        });
    }

    console.log('✅ Firebase initialized successfully');
  } catch (error: unknown) {
    console.error('❌ Firebase client initialization failed:', error);
    // Initialize with dummy values to prevent app crash
    app = null;
    db = null;
    auth = null;
    storage = null;
  }
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

  if (!db && app) {
    try {
      const { getFirestore } = await import('firebase/firestore');
      db = getFirestore(app);
    } catch (error) {
      console.error('❌ Firebase Firestore initialization failed:', error);
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

  // If storage is already initialized, return it
  if (storage) {
    return storage;
  }

  // If app is not available, try to initialize Firebase
  if (!app) {
    try {
      app = initializeFirebase();
    } catch (error) {
      console.error('❌ Firebase app initialization failed:', error);
      return null;
    }
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

  if (!auth && app) {
    try {
      const { getAuth } = await import('firebase/auth');
      auth = getAuth(app);
    } catch (error) {
      console.error('❌ Firebase Auth initialization failed:', error);
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
