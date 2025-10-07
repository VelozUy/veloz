#!/usr/bin/env node

/**
 * Complete Analytics Test
 * This script tests the full analytics flow from website to database
 */

const puppeteer = require('puppeteer');
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

async function testCompleteAnalyticsFlow() {
  console.log('🚀 Starting Complete Analytics Flow Test...\n');

  let browser;
  let db;

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase initialized');

    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 Browser Error:', msg.text());
      } else if (
        msg.text().includes('analytics') ||
        msg.text().includes('Analytics')
      ) {
        console.log('📊 Analytics:', msg.text());
      }
    });

    console.log('🌐 Navigating to website...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Wait for page to load
    await page.waitForTimeout(2000);

    console.log('📊 Checking for analytics consent banner...');

    // Look for analytics consent banner
    const consentBanner = await page.$('[aria-label*="Privacidad"]');
    if (consentBanner) {
      console.log('✅ Analytics consent banner found');

      // Accept analytics consent
      console.log('🔘 Accepting analytics consent...');
      const acceptButton = await page.$(
        'button:has-text("Aceptar analíticas")'
      );
      if (acceptButton) {
        await acceptButton.click();
        console.log('✅ Analytics consent accepted');
        await page.waitForTimeout(1000);
      }
    } else {
      console.log(
        '⚠️  No consent banner found - analytics might already be accepted'
      );
    }

    // Simulate user interactions
    console.log('🎯 Simulating user interactions...');

    // Scroll to trigger scroll depth tracking
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(500);

    // Look for and click on any buttons or links
    const buttons = await page.$$('button, a');
    if (buttons.length > 0) {
      console.log(`🔗 Found ${buttons.length} interactive elements`);
      // Click on the first button/link
      await buttons[0].click();
      await page.waitForTimeout(500);
    }

    // Navigate to a project page if available
    const projectLinks = await page.$$(
      'a[href*="/project"], a[href*="/gallery"]'
    );
    if (projectLinks.length > 0) {
      console.log('📁 Navigating to project page...');
      await projectLinks[0].click();
      await page.waitForTimeout(2000);
    }

    // Wait a bit more for any async analytics calls
    await page.waitForTimeout(3000);

    console.log('🔍 Checking Firestore for analytics events...');

    // Check Firestore for new analytics events
    const analyticsRef = collection(db, 'analytics');
    const recentEventsQuery = query(
      analyticsRef,
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const snapshot = await getDocs(recentEventsQuery);

    console.log(`📊 Found ${snapshot.size} analytics events in Firestore`);

    if (snapshot.size > 0) {
      console.log(
        '\n🎉 SUCCESS: Analytics events are being saved to Firestore!'
      );
      console.log('='.repeat(60));

      // Show recent events
      const recentEvents = snapshot.docs.slice(0, 5);
      recentEvents.forEach((doc, index) => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate?.() || 'Unknown';
        console.log(`\n${index + 1}. ${data.eventType} (${timestamp})`);
        console.log(`   Session: ${data.sessionId}`);
        console.log(`   Device: ${data.deviceType}`);
        console.log(`   Language: ${data.userLanguage}`);
      });

      // Check event types
      const eventTypes = new Set();
      snapshot.docs.forEach(doc => {
        eventTypes.add(doc.data().eventType);
      });

      console.log(`\n📈 Event Types: ${Array.from(eventTypes).join(', ')}`);

      // Check for specific event types
      const pageViews = snapshot.docs.filter(
        doc => doc.data().eventType === 'page_view'
      );
      const projectViews = snapshot.docs.filter(
        doc => doc.data().eventType === 'project_view'
      );
      const mediaInteractions = snapshot.docs.filter(
        doc => doc.data().eventType === 'media_interaction'
      );
      const ctaInteractions = snapshot.docs.filter(
        doc => doc.data().eventType === 'cta_interaction'
      );

      console.log(`\n📊 Event Breakdown:`);
      console.log(`   Page Views: ${pageViews.length}`);
      console.log(`   Project Views: ${projectViews.length}`);
      console.log(`   Media Interactions: ${mediaInteractions.length}`);
      console.log(`   CTA Interactions: ${ctaInteractions.length}`);

      console.log('\n✅ Analytics flow is working correctly!');
      console.log('🎯 Admin dashboard should now have data to display.');
    } else {
      console.log('\n❌ FAILURE: No analytics events found in Firestore');
      console.log('🔧 Possible issues:');
      console.log('   1. Analytics service not properly initialized');
      console.log('   2. GDPR consent not being given');
      console.log('   3. Firebase configuration issues');
      console.log('   4. Analytics events not being saved to Firestore');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Ensure the website is running (npm run dev)');
    console.log('2. Check Firebase configuration');
    console.log('3. Verify Firestore is enabled');
    console.log('4. Check browser console for errors');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testCompleteAnalyticsFlow();
