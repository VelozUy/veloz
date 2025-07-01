// Firebase Configuration & Initialization
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig, validateFirebaseConfig } from './firebase-config';

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let auth: any; // Will be properly typed when imported
let storage: any; // Will be properly typed when imported

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

// Initialize Firebase app
const firebaseApp = initializeFirebase();
app = firebaseApp;

// Initialize Firestore (always available)
db = getFirestore(firebaseApp);

// Initialize Auth and Storage only in browser
if (typeof window !== 'undefined') {
  // Dynamic imports to avoid SSR issues
  import('firebase/auth').then(({ getAuth }) => {
    auth = getAuth(firebaseApp);
  }).catch((error) => {
    console.warn('Firebase Auth not available:', error);
  });

  import('firebase/storage').then(({ getStorage }) => {
    storage = getStorage(firebaseApp);
  }).catch((error) => {
    console.warn('Firebase Storage not available:', error);
  });
}

// Function to get Storage service only when needed
export const getStorageService = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!storage) {
    try {
      const { getStorage } = require('firebase/storage');
      storage = getStorage(app);
    } catch (error) {
      console.error('❌ Firebase Storage initialization failed:', error);
      return null;
    }
  }
  
  return storage;
};

export default app;
export { db, auth, storage };
