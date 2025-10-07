#!/usr/bin/env node

/**
 * Simple Firestore Test
 * Tests basic Firestore write operations
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

async function testSimpleFirestore() {
  console.log('🧪 Simple Firestore Test Starting...\n');

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');

    // Test 1: Very simple document
    console.log('\n📝 Test 1: Simple document write...');
    try {
      const simpleDoc = {
        message: 'Hello Firestore',
        timestamp: serverTimestamp(),
        test: true,
      };

      const docRef = await addDoc(collection(db, 'analytics'), simpleDoc);
      console.log('✅ Simple document write successful:', docRef.id);
    } catch (error) {
      console.error('❌ Simple document write failed:', error.message);
      console.error('Error details:', error);
    }

    // Test 2: Analytics-like document with minimal fields
    console.log('\n📝 Test 2: Analytics-like document...');
    try {
      const analyticsDoc = {
        eventType: 'test_event',
        sessionId: 'test-session-123',
        timestamp: serverTimestamp(),
        test: true,
      };

      const docRef = await addDoc(collection(db, 'analytics'), analyticsDoc);
      console.log('✅ Analytics document write successful:', docRef.id);
    } catch (error) {
      console.error('❌ Analytics document write failed:', error.message);
      console.error('Error details:', error);
    }

    // Test 3: Document with string timestamp
    console.log('\n📝 Test 3: Document with string timestamp...');
    try {
      const stringTimestampDoc = {
        eventType: 'test_event_2',
        sessionId: 'test-session-456',
        timestamp: new Date().toISOString(),
        test: true,
      };

      const docRef = await addDoc(
        collection(db, 'analytics'),
        stringTimestampDoc
      );
      console.log('✅ String timestamp document write successful:', docRef.id);
    } catch (error) {
      console.error(
        '❌ String timestamp document write failed:',
        error.message
      );
      console.error('Error details:', error);
    }

    console.log('\n✅ Simple Firestore test completed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Firebase configuration');
    console.log('2. Ensure Firestore is enabled in your Firebase project');
    console.log('3. Verify you have the correct permissions');
    console.log('4. Check your internet connection');
  }
}

// Run the test
testSimpleFirestore();
