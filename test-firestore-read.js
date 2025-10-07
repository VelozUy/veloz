#!/usr/bin/env node

/**
 * Test reading from Firestore to see if the connection works
 */

const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  getDocs,
  limit,
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

async function testFirestoreRead() {
  console.log('🧪 Testing Firestore Read Operations...\n');

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');

    // Test reading from contactMessages
    console.log('\n📖 Test 1: Reading from contactMessages collection...');
    try {
      const contactRef = collection(db, 'contactMessages');
      const snapshot = await getDocs(contactRef);
      console.log(
        `✅ Contact messages read successful: ${snapshot.size} documents`
      );
    } catch (error) {
      console.error('❌ Contact messages read failed:', error.message);
    }

    // Test reading from projects
    console.log('\n📖 Test 2: Reading from projects collection...');
    try {
      const projectsRef = collection(db, 'projects');
      const snapshot = await getDocs(projectsRef);
      console.log(`✅ Projects read successful: ${snapshot.size} documents`);
    } catch (error) {
      console.error('❌ Projects read failed:', error.message);
    }

    // Test reading from analytics (should be empty)
    console.log('\n📖 Test 3: Reading from analytics collection...');
    try {
      const analyticsRef = collection(db, 'analytics');
      const snapshot = await getDocs(analyticsRef);
      console.log(`✅ Analytics read successful: ${snapshot.size} documents`);
    } catch (error) {
      console.error('❌ Analytics read failed:', error.message);
    }

    console.log('\n✅ Firestore read test completed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFirestoreRead();
