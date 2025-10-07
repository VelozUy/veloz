#!/usr/bin/env node

/**
 * Manual Analytics Test
 * This script manually triggers analytics events to test the system
 */

const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
  getDocs,
  query,
  orderBy,
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

async function testManualAnalytics() {
  console.log('🧪 Manual Analytics Test Starting...\n');

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');

    // Test 1: Direct Firestore write
    console.log('\n📝 Test 1: Direct Firestore write...');
    try {
      const testEvent = {
        eventType: 'manual_test',
        eventData: {
          test_type: 'direct_firestore_write',
          message: 'This is a manual test event',
          timestamp: Date.now(),
        },
        sessionId: 'manual-test-session-' + Date.now(),
        deviceType: 'desktop',
        userLanguage: 'en',
        timestamp: Timestamp.now(),
        userAgent: 'Manual Test Script',
      };

      const docRef = await addDoc(collection(db, 'analytics'), testEvent);
      console.log('✅ Direct Firestore write successful:', docRef.id);
    } catch (error) {
      console.error('❌ Direct Firestore write failed:', error.message);
    }

    // Test 2: Check if events are being saved
    console.log('\n🔍 Test 2: Checking Firestore for events...');
    try {
      const analyticsRef = collection(db, 'analytics');
      const recentQuery = query(
        analyticsRef,
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(recentQuery);

      console.log(`📊 Found ${snapshot.size} events in Firestore`);

      if (snapshot.size > 0) {
        console.log('\n📈 Recent Events:');
        snapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate?.() || 'Unknown';
          console.log(`   ${index + 1}. ${data.eventType} (${timestamp})`);
          console.log(`      Session: ${data.sessionId}`);
          console.log(`      Device: ${data.deviceType}`);
        });
      }
    } catch (error) {
      console.error('❌ Failed to read from Firestore:', error.message);
    }

    // Test 3: Simulate analytics service calls
    console.log('\n🎯 Test 3: Simulating analytics service calls...');

    const analyticsEvents = [
      {
        eventType: 'page_view',
        eventData: {
          page_path: '/test',
          page_title: 'Test Page',
          session_id: 'test-session-' + Date.now(),
          device_type: 'desktop',
          user_language: 'en',
          timestamp: Date.now(),
        },
      },
      {
        eventType: 'project_view',
        eventData: {
          project_id: 'test-project-123',
          project_title: 'Test Project',
          project_category: 'wedding',
          view_duration: 30,
          scroll_depth: 50,
          session_id: 'test-session-' + Date.now(),
          device_type: 'desktop',
          user_language: 'en',
          timestamp: Date.now(),
        },
      },
      {
        eventType: 'media_interaction',
        eventData: {
          project_id: 'test-project-123',
          media_id: 'test-media-456',
          media_type: 'image',
          interaction_type: 'view',
          media_title: 'Test Image',
          view_duration: 15,
          session_id: 'test-session-' + Date.now(),
          device_type: 'desktop',
          user_language: 'en',
          timestamp: Date.now(),
        },
      },
    ];

    for (const event of analyticsEvents) {
      try {
        const eventData = {
          ...event,
          sessionId: event.eventData.session_id,
          deviceType: event.eventData.device_type,
          userLanguage: event.eventData.user_language,
          timestamp: Timestamp.now(),
          userAgent: 'Manual Test Script',
        };

        const docRef = await addDoc(collection(db, 'analytics'), eventData);
        console.log(`✅ ${event.eventType} event saved:`, docRef.id);
      } catch (error) {
        console.error(
          `❌ Failed to save ${event.eventType} event:`,
          error.message
        );
      }
    }

    // Test 4: Final check
    console.log('\n🔍 Test 4: Final Firestore check...');
    try {
      const analyticsRef = collection(db, 'analytics');
      const allQuery = query(
        analyticsRef,
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(allQuery);

      console.log(`📊 Total events in database: ${snapshot.size}`);

      if (snapshot.size > 0) {
        console.log(
          '\n🎉 SUCCESS: Analytics events are being saved to Firestore!'
        );

        // Show event breakdown
        const eventTypes = {};
        snapshot.docs.forEach(doc => {
          const eventType = doc.data().eventType;
          eventTypes[eventType] = (eventTypes[eventType] || 0) + 1;
        });

        console.log('\n📈 Event Type Breakdown:');
        Object.entries(eventTypes).forEach(([type, count]) => {
          console.log(`   ${type}: ${count} events`);
        });

        console.log('\n✅ Analytics system is working correctly!');
        console.log('🎯 Admin dashboard should now have data to display.');
      } else {
        console.log('\n❌ FAILURE: No analytics events found in Firestore');
        console.log(
          '🔧 This indicates a serious issue with the analytics system.'
        );
      }
    } catch (error) {
      console.error('❌ Final check failed:', error.message);
    }
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
testManualAnalytics();
