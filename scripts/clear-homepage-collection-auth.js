require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

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
const auth = getAuth(app);

async function clearHomepageCollectionWithAuth() {
  try {
    console.log('✅ Firebase initialized successfully');
    
    // Check if we have admin credentials
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      console.log('❌ No admin credentials found in .env.local');
      console.log('   Add ADMIN_EMAIL and ADMIN_PASSWORD to .env.local');
      console.log('   Example:');
      console.log('   ADMIN_EMAIL=your-admin@example.com');
      console.log('   ADMIN_PASSWORD=your-admin-password');
      process.exit(1);
    }
    
    console.log('🔐 Signing in with admin credentials...');
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log('✅ Authenticated successfully');
    } catch (error) {
      console.log('❌ Authentication failed:', error.message);
      console.log('   Please check your ADMIN_EMAIL and ADMIN_PASSWORD in .env.local');
      process.exit(1);
    }
    
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
    console.log('💡 You can now visit http://localhost:3000/admin/homepage to create fresh content');
    
  } catch (error) {
    console.error('❌ Error clearing homepage collection:', error);
  }
}

clearHomepageCollectionWithAuth(); 