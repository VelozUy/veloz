#!/usr/bin/env node

/**
 * Test writing to existing collections that we know work
 */

const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

async function testExistingCollections() {
  console.log('🧪 Testing Existing Collections...\n');

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');

    // Test writing to contactMessages (which should allow public writes)
    console.log('\n📝 Test 1: Writing to contactMessages collection...');
    try {
      const contactDoc = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message',
        timestamp: serverTimestamp(),
        test: true,
      };

      const docRef = await addDoc(
        collection(db, 'contactMessages'),
        contactDoc
      );
      console.log('✅ Contact message write successful:', docRef.id);
    } catch (error) {
      console.error('❌ Contact message write failed:', error.message);
    }

    // Test writing to public_access collection
    console.log('\n📝 Test 2: Writing to public_access collection...');
    try {
      const accessDoc = {
        email: 'test@example.com',
        timestamp: serverTimestamp(),
        test: true,
      };

      const docRef = await addDoc(collection(db, 'public_access'), accessDoc);
      console.log('✅ Public access write successful:', docRef.id);
    } catch (error) {
      console.error('❌ Public access write failed:', error.message);
    }

    // Test writing to clients collection
    console.log('\n📝 Test 3: Writing to clients collection...');
    try {
      const clientDoc = {
        name: 'Test Client',
        email: 'client@example.com',
        timestamp: serverTimestamp(),
        test: true,
      };

      const docRef = await addDoc(collection(db, 'clients'), clientDoc);
      console.log('✅ Client write successful:', docRef.id);
    } catch (error) {
      console.error('❌ Client write failed:', error.message);
    }

    console.log('\n✅ Existing collections test completed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testExistingCollections();
