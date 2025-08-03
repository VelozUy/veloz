require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase config
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  console.error('❌ Missing Firebase configuration:', missingFields.join(', '));
  console.log('Please check your .env.local file has all required Firebase variables');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearHomepageCollection() {
  try {
    console.log('✅ Firebase initialized successfully');
    console.log('🧹 Clearing homepage collection...');
    
    // Get all documents in the homepage collection
    const homepageCollection = collection(db, 'homepage');
    const querySnapshot = await getDocs(homepageCollection);
    
    console.log(`📂 Found ${querySnapshot.size} document(s) in homepage collection`);
    
    if (querySnapshot.size === 0) {
      console.log('✅ Homepage collection is already empty');
      return;
    }
    
    // Delete each document
    const deletePromises = [];
    querySnapshot.forEach((document) => {
      console.log(`🗑️  Deleting document: "${document.id}"`);
      deletePromises.push(deleteDoc(doc(db, 'homepage', document.id)));
    });
    
    // Wait for all deletions to complete
    await Promise.all(deletePromises);
    
    console.log('✅ Successfully deleted all documents in homepage collection');
    console.log('🔄 The homepage admin page should now work without the "Target ID already exists: 4" error');
    
  } catch (error) {
    console.error('❌ Error clearing homepage collection:', error);
    
    if (error.code === 'permission-denied') {
      console.log('💡 This might be a permissions issue. Try running the script with admin authentication.');
    }
  }
}

clearHomepageCollection(); 