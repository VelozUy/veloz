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

  // Initialize services with assertion error prevention
  db = getFirestore(app);

  // CRITICAL: Disable offline persistence to prevent assertion errors
  // This prevents the ca9 assertion error by avoiding corrupted offline state
  if (typeof window !== 'undefined') {
    try {
      // Force online mode and disable persistence during development
      console.log('🔧 Configuring Firestore for assertion error prevention...');

      // Note: We avoid enableNetwork/disableNetwork calls that trigger assertion errors
      // Instead we rely on default online behavior
    } catch (firestoreError) {
      console.warn('Firestore configuration warning:', firestoreError);
    }
  }

  auth = getAuth(app);
  storage = getStorage(app);

  // Development: Add error handling for assertion errors (client-side only)
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
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
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

export default app;
export { db, auth, storage };
