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

  // Initialize services
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);

  console.log('✅ Firebase initialized successfully');
} catch (error: unknown) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

export default app;
