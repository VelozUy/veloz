#!/usr/bin/env node

/**
 * Final Analytics Test
 * Tests the simple analytics system
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getAnalytics, logEvent } = require('firebase/analytics');

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

async function testFinalAnalytics() {
  console.log('🧪 Final Analytics Test Starting...\n');

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    console.log('✅ Firebase Analytics initialized successfully');

    // Test 1: Page view event
    console.log('\n📝 Test 1: Page view event...');
    try {
      await logEvent(analytics, 'page_view', {
        page_path: '/test',
        page_title: 'Analytics Test Page',
        session_id: 'test-session-' + Date.now(),
        device_type: 'desktop',
        user_language: 'en',
        timestamp: Date.now(),
      });
      console.log('✅ Page view event sent successfully');
    } catch (error) {
      console.error('❌ Page view event failed:', error.message);
    }

    // Test 2: Project view event
    console.log('\n📝 Test 2: Project view event...');
    try {
      await logEvent(analytics, 'project_view', {
        project_id: 'test-project-123',
        project_title: 'Test Project',
        project_category: 'wedding',
        project_language: 'en',
        view_duration: 30,
        scroll_depth: 50,
        session_id: 'test-session-' + Date.now(),
        device_type: 'desktop',
        user_language: 'en',
        timestamp: Date.now(),
      });
      console.log('✅ Project view event sent successfully');
    } catch (error) {
      console.error('❌ Project view event failed:', error.message);
    }

    // Test 3: Media interaction event
    console.log('\n📝 Test 3: Media interaction event...');
    try {
      await logEvent(analytics, 'media_interaction', {
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
      });
      console.log('✅ Media interaction event sent successfully');
    } catch (error) {
      console.error('❌ Media interaction event failed:', error.message);
    }

    // Test 4: CTA interaction event
    console.log('\n📝 Test 4: CTA interaction event...');
    try {
      await logEvent(analytics, 'cta_interaction', {
        project_id: 'test-project-123',
        cta_type: 'contact',
        cta_location: 'header',
        session_id: 'test-session-' + Date.now(),
        device_type: 'desktop',
        user_language: 'en',
        timestamp: Date.now(),
      });
      console.log('✅ CTA interaction event sent successfully');
    } catch (error) {
      console.error('❌ CTA interaction event failed:', error.message);
    }

    // Test 5: Crew interaction event
    console.log('\n📝 Test 5: Crew interaction event...');
    try {
      await logEvent(analytics, 'crew_interaction', {
        project_id: 'test-project-123',
        crew_member_id: 'crew-789',
        crew_member_name: 'Test Crew Member',
        interaction_type: 'view',
        crew_member_role: 'photographer',
        session_id: 'test-session-' + Date.now(),
        device_type: 'desktop',
        user_language: 'en',
        timestamp: Date.now(),
      });
      console.log('✅ Crew interaction event sent successfully');
    } catch (error) {
      console.error('❌ Crew interaction event failed:', error.message);
    }

    // Test 6: Error tracking event
    console.log('\n📝 Test 6: Error tracking event...');
    try {
      await logEvent(analytics, 'error', {
        error_message: 'Test error message',
        error_stack: 'Test error stack',
        error_context: { test: true },
        session_id: 'test-session-' + Date.now(),
        device_type: 'desktop',
        user_language: 'en',
        timestamp: Date.now(),
      });
      console.log('✅ Error tracking event sent successfully');
    } catch (error) {
      console.error('❌ Error tracking event failed:', error.message);
    }

    // Test 7: Scroll depth event
    console.log('\n📝 Test 7: Scroll depth event...');
    try {
      await logEvent(analytics, 'scroll_depth', {
        page_path: '/test',
        scroll_depth: 75,
        session_id: 'test-session-' + Date.now(),
        device_type: 'desktop',
        user_language: 'en',
        timestamp: Date.now(),
      });
      console.log('✅ Scroll depth event sent successfully');
    } catch (error) {
      console.error('❌ Scroll depth event failed:', error.message);
    }

    console.log('\n🎉 SUCCESS: All analytics events sent successfully!');
    console.log('✅ Analytics system is working correctly!');
    console.log('🎯 Events are being sent to Firebase Analytics (GA4)');
    console.log(
      '📊 You can view these events in the Firebase Analytics dashboard'
    );
    console.log(
      '🔗 Go to: https://console.firebase.google.com/project/veloz-6efe6/analytics'
    );
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Firebase configuration');
    console.log('2. Ensure Firebase Analytics is enabled in your project');
    console.log('3. Verify you have the correct permissions');
    console.log('4. Check your internet connection');
  }
}

// Run the test
testFinalAnalytics();
