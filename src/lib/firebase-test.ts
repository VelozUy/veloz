import { db } from './firebase';
import { doc, getDoc, enableNetwork } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  const results = {
    networkEnabled: false,
    canReadFirestore: false,
    error: null as string | null,
    timestamp: new Date().toISOString(),
  };

  try {
    console.log('🔥 Testing Firebase connection...');

    // Test 1: Enable network
    try {
      await enableNetwork(db);
      results.networkEnabled = true;
      console.log('✅ Firebase network enabled');
    } catch (error) {
      console.warn('⚠️ Network enable failed:', error);
      results.error = `Network enable failed: ${error}`;
    }

    // Test 2: Try to read a simple document
    try {
      const testDocRef = doc(db, 'test', 'connection');
      await getDoc(testDocRef);
      results.canReadFirestore = true;
      console.log('✅ Firestore read test successful');
    } catch (error) {
      console.error('❌ Firestore read test failed:', error);
      results.error = `Firestore read failed: ${error}`;
      results.canReadFirestore = false;
    }
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    results.error = `Connection test failed: ${error}`;
  }

  console.log('🔥 Firebase connection test results:', results);
  return results;
};

export const debugFirebaseState = () => {
  console.log('🔥 Firebase Debug Info:', {
    isClient: typeof window !== 'undefined',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    online: typeof navigator !== 'undefined' ? navigator.onLine : 'N/A',
    timestamp: new Date().toISOString(),
  });
};
