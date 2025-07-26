import { getFirestoreService } from './firebase';
import { doc, enableNetwork } from 'firebase/firestore';
import { getStorageService } from './firebase';

export const testFirebaseConnection = async () => {
  // Testing Firebase connection...

  try {
    const db = await getFirestoreService();

    if (!db) {
      console.error('❌ Firebase Firestore is not available');
      return false;
    }

    // Firebase Firestore is available

    // Test network connectivity
    await enableNetwork(db);
    // Firebase network enabled

    // Test a simple document read
    // const testDoc = doc(db, 'test', 'connection');
    // const docSnap = await getDoc(testDoc);
    // Firebase document read successful

    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};

export const debugFirebaseState = () => {
  // Firebase Debug Info logged
};

// Test script to verify Firebase Storage functionality
export async function testFirebaseStorage() {
  // Testing Firebase Storage...

  try {
    const storage = await getStorageService();

    if (!storage) {
      console.error('❌ Firebase Storage is not available');
      return false;
    }

    // Firebase Storage is available
    // Storage instance logged

    return true;
  } catch (error) {
    console.error('❌ Firebase Storage test failed:', error);
    return false;
  }
}

// Test file upload service
export async function testFileUploadService() {
  // Testing File Upload Service...

  try {
    const { FileUploadService } = await import('../services/file-upload');
    const service = new FileUploadService();

    // File Upload Service created successfully
    // Service instance logged

    // Test configuration
    const imageConfig = service.getConfigForFileType('image');
    // Image upload config logged

    return true;
  } catch (error) {
    console.error('❌ File Upload Service test failed:', error);
    return false;
  }
}

// Test Firebase auth initialization
import { getAuthSync, getAuthService } from './firebase';

export async function testFirebaseAuth() {
  // Testing Firebase Auth initialization...

  try {
    // Test synchronous auth
    const syncAuth = getAuthSync();
    // Sync auth available

    // Test async auth
    const asyncAuth = await getAuthService();
    // Async auth available

    if (syncAuth && typeof syncAuth.onAuthStateChanged === 'function') {
      // Auth has onAuthStateChanged method
    } else {
      // Auth missing onAuthStateChanged method
    }

    return { syncAuth, asyncAuth };
  } catch (error) {
    console.error('❌ Firebase auth test failed:', error);
    return { syncAuth: null, asyncAuth: null };
  }
}

// Run tests if called directly
if (typeof window !== 'undefined') {
  // Only run in browser
  testFirebaseStorage().then(storageOk => {
    if (storageOk) {
      testFileUploadService();
    }
  });
}
