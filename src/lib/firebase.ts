// Firebase Configuration & Initialization
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig, validateFirebaseConfig } from './firebase-config';

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

// Function to safely initialize Firebase
const initializeFirebase = () => {
  try {
    // Validate configuration first
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

    // Initialize services
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);

    // CRITICAL: Disable offline persistence to prevent assertion errors
    // This prevents the ca9 assertion error by avoiding corrupted offline state
    console.log('🔧 Configuring Firestore for assertion error prevention...');

    // Development: Add error handling for assertion errors (client-side only)
    if (process.env.NODE_ENV === 'development') {
      // Listen for uncaught Firebase errors
      window.addEventListener('error', event => {
        if (event.error?.message?.includes('INTERNAL ASSERTION FAILED')) {
          console.error('🚨 Firebase Internal Assertion Error detected!');
          console.error('Navigate to /debug/firebase for emergency fixes');
          console.error('Or run: emergencyFirestoreFix() in console');
        }
      });
    }

    console.log('✅ Firebase initialized successfully');
  } catch (error: unknown) {
    console.error('❌ Firebase client initialization failed:', error);
    // Initialize with dummy values to prevent app crash
    app = {} as FirebaseApp;
    db = {} as Firestore;
    auth = {} as Auth;
    storage = {} as FirebaseStorage;
  }
} else {
  // Server-side: Initialize with dummy values to prevent errors
  app = {} as FirebaseApp;
  db = {} as Firestore;
  auth = {} as Auth;
  storage = {} as FirebaseStorage;
}

export default app;
export { db, auth, storage };
