require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs, deleteDoc } = require('firebase/firestore');
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

async function debugHomepageCollection() {
  try {
    console.log('✅ Firebase initialized successfully');
    
    // Check if we have admin credentials
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      console.log('⚠️  No admin credentials found in .env.local');
      console.log('   Add ADMIN_EMAIL and ADMIN_PASSWORD to .env.local for authenticated access');
      console.log('   Trying unauthenticated access...');
    } else {
      console.log('🔐 Signing in with admin credentials...');
      try {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log('✅ Authenticated successfully');
      } catch (error) {
        console.log('❌ Authentication failed:', error.message);
        console.log('   Continuing with unauthenticated access...');
      }
    }
    
    console.log('\n🔍 Checking homepage collection...');
    
    // Get all documents in the homepage collection
    const homepageCollection = collection(db, 'homepage');
    const querySnapshot = await getDocs(homepageCollection);
    
    console.log(`📂 Found ${querySnapshot.size} document(s) in homepage collection:`);
    
    querySnapshot.forEach((doc) => {
      console.log(`   📝 Document ID: "${doc.id}"`);
      console.log(`      Data:`, doc.data());
      console.log('');
    });
    
    // Check if there's a document with ID "4"
    const doc4Ref = doc(db, 'homepage', '4');
    const doc4Snap = await getDoc(doc4Ref);
    
    if (doc4Snap.exists()) {
      console.log('🚨 Found document with ID "4"!');
      console.log('   This is likely causing the "Target ID already exists: 4" error');
      console.log('   Data:', doc4Snap.data());
      
      // Ask if user wants to delete it
      console.log('\n❓ Do you want to delete this document? (y/n)');
      // For now, just log the suggestion
      console.log('   Run: node scripts/delete-doc-4.js (if you create this script)');
    } else {
      console.log('✅ No document with ID "4" found in homepage collection');
    }
    
    // Check the "content" document
    const contentRef = doc(db, 'homepage', 'content');
    const contentSnap = await getDoc(contentRef);
    
    if (contentSnap.exists()) {
      console.log('✅ Found "content" document');
      console.log('   Data:', contentSnap.data());
    } else {
      console.log('📝 No "content" document found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugHomepageCollection(); 