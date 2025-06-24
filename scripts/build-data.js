#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Build-time data fetching script
 * This script fetches FAQ data from Firestore and generates static JSON files
 * that can be used during the build process for better SEO and performance
 */

const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase configuration (should match your project)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function fetchFAQData() {
  try {
    console.log('🔄 Fetching FAQ data from Firestore...');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Fetch FAQs with simple query to avoid index issues
    const faqsQuery = query(collection(db, 'faqs'), orderBy('order', 'asc'));

    const snapshot = await getDocs(faqsQuery);
    const faqs = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      // Only include published FAQs
      if (data.published === true) {
        faqs.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to strings for JSON serialization
          createdAt: data.createdAt
            ? data.createdAt.toDate().toISOString()
            : null,
          updatedAt: data.updatedAt
            ? data.updatedAt.toDate().toISOString()
            : null,
        });
      }
    });

    console.log(`✅ Found ${faqs.length} published FAQs`);

    // Create build data object
    const buildData = {
      faqs,
      lastUpdated: new Date().toISOString(),
      buildTime: true,
    };

    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write FAQ data to JSON file
    const faqDataPath = path.join(dataDir, 'faqs.json');
    fs.writeFileSync(faqDataPath, JSON.stringify(buildData, null, 2));

    console.log(`📄 FAQ data written to ${faqDataPath}`);

    // Generate TypeScript file with the data
    const tsContent = `// Auto-generated at build time - do not edit manually
// Generated on: ${new Date().toISOString()}

import { FAQ } from '@/services/faq';

export const BUILD_TIME_FAQS: FAQ[] = ${JSON.stringify(faqs, null, 2)};

export const BUILD_TIME_DATA = {
  faqs: BUILD_TIME_FAQS,
  lastUpdated: '${buildData.lastUpdated}',
  buildTime: true,
};
`;

    const tsFilePath = path.join(
      process.cwd(),
      'src',
      'lib',
      'build-time-data.generated.ts'
    );
    fs.writeFileSync(tsFilePath, tsContent);

    console.log(`📄 TypeScript data file written to ${tsFilePath}`);
    console.log('✅ Build-time data generation completed successfully!');

    return buildData;
  } catch (error) {
    console.error('❌ Error fetching build-time data:', error);

    // Create empty fallback data
    const fallbackData = {
      faqs: [],
      lastUpdated: new Date().toISOString(),
      buildTime: false,
      error: error.message,
    };

    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write fallback data
    const faqDataPath = path.join(dataDir, 'faqs.json');
    fs.writeFileSync(faqDataPath, JSON.stringify(fallbackData, null, 2));

    console.log('📄 Fallback data written due to error');
    return fallbackData;
  }
}

// Run the script if called directly
if (require.main === module) {
  fetchFAQData()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fetchFAQData };
