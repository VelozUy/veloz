#!/usr/bin/env node

/**
 * Test using Firebase Admin SDK
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: 'service_account',
  project_id: 'veloz-6efe6',
  private_key_id: 'dummy', // We'll use application default credentials
  private_key: 'dummy',
  client_email: 'dummy',
  client_id: 'dummy',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'dummy',
};

async function testFirebaseAdmin() {
  console.log('🧪 Testing Firebase Admin SDK...\n');

  try {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: 'veloz-6efe6',
      });
    }

    const db = admin.firestore();
    console.log('✅ Firebase Admin SDK initialized successfully');

    // Test writing to analytics collection
    console.log(
      '\n📝 Test 1: Writing to analytics collection with Admin SDK...'
    );
    try {
      const analyticsDoc = {
        eventType: 'admin_test',
        sessionId: 'admin-test-session-' + Date.now(),
        deviceType: 'desktop',
        userLanguage: 'en',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        test: true,
        message: 'This is a test from Firebase Admin SDK',
      };

      const docRef = await db.collection('analytics').add(analyticsDoc);
      console.log('✅ Analytics document write successful:', docRef.id);
    } catch (error) {
      console.error('❌ Analytics document write failed:', error.message);
      console.error('Error details:', error);
    }

    // Test reading from analytics collection
    console.log('\n📖 Test 2: Reading from analytics collection...');
    try {
      const snapshot = await db.collection('analytics').limit(5).get();
      console.log(`✅ Analytics read successful: ${snapshot.size} documents`);

      if (snapshot.size > 0) {
        console.log('\n📊 Recent analytics events:');
        snapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(`   ${index + 1}. ${data.eventType} (${doc.id})`);
        });
      }
    } catch (error) {
      console.error('❌ Analytics read failed:', error.message);
    }

    console.log('\n✅ Firebase Admin SDK test completed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if Firebase Admin SDK is properly configured');
    console.log('2. Verify the project ID is correct');
    console.log('3. Check if you have the necessary permissions');
  }
}

// Run the test
testFirebaseAdmin();
