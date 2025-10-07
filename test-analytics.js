#!/usr/bin/env node

/**
 * Test script to verify analytics are being sent and saved correctly
 * Run with: node test-analytics.js
 */

const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} = require('firebase/firestore');

// Firebase config (you'll need to add your actual config)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

async function testAnalyticsFlow() {
  console.log('🔍 Testing Analytics Flow...\n');

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('✅ Firebase initialized successfully');

    // Check if analytics collection exists and has data
    const analyticsRef = collection(db, 'analytics');
    const recentEventsQuery = query(
      analyticsRef,
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(recentEventsQuery);

    console.log(`📊 Found ${snapshot.size} recent analytics events`);

    if (snapshot.size > 0) {
      console.log('\n📈 Recent Analytics Events:');
      console.log('='.repeat(50));

      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. Event ID: ${doc.id}`);
        console.log(`   Type: ${data.eventType}`);
        console.log(`   Session: ${data.sessionId}`);
        console.log(`   Device: ${data.deviceType}`);
        console.log(`   Language: ${data.userLanguage}`);
        console.log(`   Timestamp: ${data.timestamp?.toDate?.() || 'N/A'}`);

        if (data.eventData) {
          console.log(`   Data: ${JSON.stringify(data.eventData, null, 2)}`);
        }
      });

      // Check for different event types
      const eventTypes = new Set();
      snapshot.docs.forEach(doc => {
        eventTypes.add(doc.data().eventType);
      });

      console.log(
        `\n🎯 Event Types Found: ${Array.from(eventTypes).join(', ')}`
      );

      // Check for project-specific events
      const projectEvents = snapshot.docs.filter(
        doc =>
          doc.data().eventData?.project_id || doc.data().eventData?.projectId
      );
      console.log(`📁 Project-related events: ${projectEvents.length}`);

      // Check for media interactions
      const mediaEvents = snapshot.docs.filter(
        doc => doc.data().eventType === 'media_interaction'
      );
      console.log(`🎬 Media interaction events: ${mediaEvents.length}`);

      // Check for CTA interactions
      const ctaEvents = snapshot.docs.filter(
        doc => doc.data().eventType === 'cta_interaction'
      );
      console.log(`🔗 CTA interaction events: ${ctaEvents.length}`);
    } else {
      console.log('\n⚠️  No analytics events found in Firestore');
      console.log('   This could mean:');
      console.log("   1. Analytics haven't been triggered yet");
      console.log("   2. GDPR consent hasn't been given");
      console.log('   3. Firebase configuration is incorrect');
      console.log("   4. The analytics service isn't saving to Firestore");
    }

    console.log('\n✅ Analytics flow test completed');
  } catch (error) {
    console.error('❌ Error testing analytics flow:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Firebase configuration');
    console.log('2. Ensure Firestore is enabled in your Firebase project');
    console.log('3. Verify the analytics service is properly initialized');
    console.log('4. Check that GDPR consent is being given');
  }
}

// Run the test
testAnalyticsFlow();
