#!/usr/bin/env node

/**
 * Simple Analytics Test
 * Tests if analytics events are being saved to Firestore
 */

const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
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

async function testAnalyticsData() {
  console.log('🔍 Testing Analytics Data in Firestore...\n');

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');

    // Check analytics collection
    const analyticsRef = collection(db, 'analytics');

    // Get all analytics events
    const allEventsQuery = query(analyticsRef, orderBy('timestamp', 'desc'));
    const allSnapshot = await getDocs(allEventsQuery);

    console.log(`📊 Total analytics events in database: ${allSnapshot.size}`);

    if (allSnapshot.size > 0) {
      console.log(
        '\n🎉 SUCCESS: Analytics events are being saved to Firestore!'
      );
      console.log('='.repeat(60));

      // Show recent events
      const recentEvents = allSnapshot.docs.slice(0, 10);
      recentEvents.forEach((doc, index) => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate?.() || 'Unknown';
        const timeAgo =
          timestamp !== 'Unknown'
            ? Math.round((Date.now() - timestamp.getTime()) / (1000 * 60)) +
              ' minutes ago'
            : 'Unknown';

        console.log(`\n${index + 1}. ${data.eventType} (${timeAgo})`);
        console.log(`   Session: ${data.sessionId}`);
        console.log(`   Device: ${data.deviceType}`);
        console.log(`   Language: ${data.userLanguage}`);

        if (data.eventData) {
          const eventData = data.eventData;
          if (eventData.project_id || eventData.projectId) {
            console.log(
              `   Project: ${eventData.project_id || eventData.projectId}`
            );
          }
          if (eventData.media_id || eventData.mediaId) {
            console.log(`   Media: ${eventData.media_id || eventData.mediaId}`);
          }
          if (eventData.cta_type || eventData.ctaType) {
            console.log(`   CTA: ${eventData.cta_type || eventData.ctaType}`);
          }
        }
      });

      // Analyze event types
      const eventTypes = {};
      allSnapshot.docs.forEach(doc => {
        const eventType = doc.data().eventType;
        eventTypes[eventType] = (eventTypes[eventType] || 0) + 1;
      });

      console.log('\n📈 Event Type Breakdown:');
      Object.entries(eventTypes).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} events`);
      });

      // Check for project-specific events
      const projectEvents = allSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.eventData?.project_id || data.eventData?.projectId;
      });
      console.log(`\n📁 Project-related events: ${projectEvents.length}`);

      // Check for recent activity (last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentActivity = allSnapshot.docs.filter(doc => {
        const timestamp = doc.data().timestamp?.toDate?.();
        return timestamp && timestamp > oneHourAgo;
      });
      console.log(`⏰ Events in last hour: ${recentActivity.length}`);

      console.log('\n✅ Analytics system is working correctly!');
      console.log('🎯 Admin dashboard should have data to display.');
    } else {
      console.log('\n⚠️  No analytics events found in Firestore');
      console.log('\n🔧 This means:');
      console.log('   1. No users have visited the website yet');
      console.log("   2. GDPR consent hasn't been given");
      console.log("   3. Analytics service isn't saving to Firestore");
      console.log('   4. Firebase configuration issues');

      console.log('\n💡 To test analytics:');
      console.log('   1. Visit http://localhost:3000 in your browser');
      console.log('   2. Accept analytics consent if prompted');
      console.log('   3. Navigate around the website');
      console.log('   4. Run this test again');
    }

    // Check if there are any other collections with analytics data
    console.log('\n🔍 Checking for other analytics-related collections...');

    // This is a simplified check - in a real scenario you'd need to list all collections
    const collections = ['analytics', 'qrCodeScans', 'projects'];

    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        console.log(`   ${collectionName}: ${snapshot.size} documents`);
      } catch (error) {
        console.log(`   ${collectionName}: Error accessing collection`);
      }
    }
  } catch (error) {
    console.error('❌ Error testing analytics:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Firebase configuration');
    console.log('2. Ensure Firestore is enabled in your Firebase project');
    console.log('3. Verify the analytics service is properly initialized');
    console.log('4. Check that GDPR consent is being given');
  }
}

// Run the test
testAnalyticsData();
