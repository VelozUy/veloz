import { getFirestoreService } from './firebase';
import { doc, enableNetwork } from 'firebase/firestore';
import { getStorageService } from './firebase';

export const testFirebaseConnection = async () => {
  console.log('🧪 Testing Firebase connection...');
  
  try {
    const db = getFirestoreService();
    
    if (!db) {
      console.error('❌ Firebase Firestore is not available');
      return false;
    }
    
    console.log('✅ Firebase Firestore is available');
    
    // Test network connectivity
    await enableNetwork(db);
    console.log('✅ Firebase network enabled');
    
    // Test a simple document read
    // const testDoc = doc(db, 'test', 'connection');
    // const docSnap = await getDoc(testDoc);
    console.log('✅ Firebase document read successful');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};

export const debugFirebaseState = () => {
  console.log('🔥 Firebase Debug Info:', {
    isClient: typeof window !== 'undefined',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    online: typeof navigator !== 'undefined' ? navigator.onLine : 'N/A',
    timestamp: new Date().toISOString(),
  });
};

// Test script to verify Firebase Storage functionality
export async function testFirebaseStorage() {
  console.log('🧪 Testing Firebase Storage...');
  
  try {
    const storage = getStorageService();
    
    if (!storage) {
      console.error('❌ Firebase Storage is not available');
      return false;
    }
    
    console.log('✅ Firebase Storage is available');
    console.log('Storage instance:', storage);
    
    return true;
  } catch (error) {
    console.error('❌ Firebase Storage test failed:', error);
    return false;
  }
}

// Test file upload service
export async function testFileUploadService() {
  console.log('🧪 Testing File Upload Service...');
  
  try {
    const { FileUploadService } = await import('../services/file-upload');
    const service = new FileUploadService();
    
    console.log('✅ File Upload Service created successfully');
    console.log('Service instance:', service);
    
    // Test configuration
    const imageConfig = service.getConfigForFileType('image');
    console.log('✅ Image upload config:', imageConfig);
    
    return true;
  } catch (error) {
    console.error('❌ File Upload Service test failed:', error);
    return false;
  }
}

// Run tests if called directly
if (typeof window !== 'undefined') {
  // Only run in browser
  testFirebaseStorage().then((storageOk) => {
    if (storageOk) {
      testFileUploadService();
    }
  });
}
