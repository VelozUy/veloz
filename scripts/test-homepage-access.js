require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testHomepageAccess() {
  try {
    console.log('✅ Testing homepage collection access...');
    
    // Try to access the homepage content document
    const docRef = doc(db, 'homepage', 'content');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('📝 Found homepage content document');
      console.log('   This might still cause the "Target ID already exists: 4" error');
    } else {
      console.log('✅ No homepage content document found');
      console.log('   The "Target ID already exists: 4" error should be resolved');
    }
    
  } catch (error) {
    console.error('❌ Error accessing homepage:', error);
    
    if (error.message.includes('Target ID already exists: 4')) {
      console.log('🚨 The "Target ID already exists: 4" error is still present');
      console.log('   You need to clear the homepage collection manually');
    }
  }
}

testHomepageAccess(); 