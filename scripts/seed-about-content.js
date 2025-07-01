#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * About Content Seeding Script
 *
 * This script migrates existing static about content from JSON files
 * to Firestore using the new dynamic about content schema.
 *
 * Usage: node scripts/seed-about-content.js
 */

const fs = require('fs');
const path = require('path');

// Firebase Client SDK setup (instead of Admin SDK)
const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  connectFirestoreEmulator,
} = require('firebase/firestore');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Read the static content files
const contentEsPath = path.join(__dirname, '../src/data/content-es.json');
const contentEnPath = path.join(__dirname, '../src/data/content-en.json');
const contentPtPath = path.join(__dirname, '../src/data/content-pt.json');

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function transformAboutContent(esContent, enContent, ptContent) {
  // Extract about content from each language
  const esAbout = esContent.translations.about;
  const enAbout = enContent.translations.about;
  const ptAbout = ptContent.translations.about;

  // Transform the static structure to the new dynamic structure
  const transformedContent = {
    title: {
      es: esAbout.title,
      en: enAbout.title,
      pt: ptAbout.title,
    },
    subtitle: {
      es: esAbout.subtitle,
      en: enAbout.subtitle,
      pt: ptAbout.subtitle,
    },
    philosophy: {
      title: {
        es: esAbout.philosophy.title,
        en: enAbout.philosophy.title,
        pt: ptAbout.philosophy.title,
      },
      items: [
        {
          id: generateId(),
          title: {
            es: esAbout.philosophy.title,
            en: enAbout.philosophy.title,
            pt: ptAbout.philosophy.title,
          },
          description: {
            es: esAbout.philosophy.description,
            en: enAbout.philosophy.description,
            pt: ptAbout.philosophy.description,
          },
          order: 0,
        },
      ],
    },
    methodology: {
      title: {
        es: esAbout.methodology.title,
        en: enAbout.methodology.title,
        pt: ptAbout.methodology.title,
      },
      items: [
        {
          id: generateId(),
          title: {
            es: esAbout.methodology.planning.title,
            en: enAbout.methodology.planning.title,
            pt: ptAbout.methodology.planning.title,
          },
          description: {
            es: esAbout.methodology.planning.description,
            en: enAbout.methodology.planning.description,
            pt: ptAbout.methodology.planning.description,
          },
          order: 0,
        },
        {
          id: generateId(),
          title: {
            es: esAbout.methodology.coverage.title,
            en: enAbout.methodology.coverage.title,
            pt: ptAbout.methodology.coverage.title,
          },
          description: {
            es: esAbout.methodology.coverage.description,
            en: enAbout.methodology.coverage.description,
            pt: ptAbout.methodology.coverage.description,
          },
          order: 1,
        },
        {
          id: generateId(),
          title: {
            es: esAbout.methodology.capture.title,
            en: enAbout.methodology.capture.title,
            pt: ptAbout.methodology.capture.title,
          },
          description: {
            es: esAbout.methodology.capture.description,
            en: enAbout.methodology.capture.description,
            pt: ptAbout.methodology.capture.description,
          },
          order: 2,
        },
        {
          id: generateId(),
          title: {
            es: esAbout.methodology.postproduction.title,
            en: enAbout.methodology.postproduction.title,
            pt: ptAbout.methodology.postproduction.title,
          },
          description: {
            es: esAbout.methodology.postproduction.description,
            en: enAbout.methodology.postproduction.description,
            pt: ptAbout.methodology.postproduction.description,
          },
          order: 3,
        },
      ],
    },
    values: {
      title: {
        es: esAbout.values.title,
        en: enAbout.values.title,
        pt: ptAbout.values.title,
      },
      items: [
        {
          id: generateId(),
          title: {
            es: esAbout.values.passion.title,
            en: enAbout.values.passion.title,
            pt: ptAbout.values.passion.title,
          },
          description: {
            es: esAbout.values.passion.description,
            en: enAbout.values.passion.description,
            pt: ptAbout.values.passion.description,
          },
          order: 0,
        },
        {
          id: generateId(),
          title: {
            es: esAbout.values.teamwork.title,
            en: enAbout.values.teamwork.title,
            pt: ptAbout.values.teamwork.title,
          },
          description: {
            es: esAbout.values.teamwork.description,
            en: enAbout.values.teamwork.description,
            pt: ptAbout.values.teamwork.description,
          },
          order: 1,
        },
        {
          id: generateId(),
          title: {
            es: esAbout.values.quality.title,
            en: enAbout.values.quality.title,
            pt: ptAbout.values.quality.title,
          },
          description: {
            es: esAbout.values.quality.description,
            en: enAbout.values.quality.description,
            pt: ptAbout.values.quality.description,
          },
          order: 2,
        },
        {
          id: generateId(),
          title: {
            es: esAbout.values.agility.title,
            en: enAbout.values.agility.title,
            pt: ptAbout.values.agility.title,
          },
          description: {
            es: esAbout.values.agility.description,
            en: enAbout.values.agility.description,
            pt: ptAbout.values.agility.description,
          },
          order: 3,
        },
        {
          id: generateId(),
          title: {
            es: esAbout.values.excellence.title,
            en: enAbout.values.excellence.title,
            pt: ptAbout.values.excellence.title,
          },
          description: {
            es: esAbout.values.excellence.description,
            en: enAbout.values.excellence.description,
            pt: ptAbout.values.excellence.description,
          },
          order: 4,
        },
        {
          id: generateId(),
          title: {
            es: esAbout.values.trust.title,
            en: enAbout.values.trust.title,
            pt: ptAbout.values.trust.title,
          },
          description: {
            es: esAbout.values.trust.description,
            en: enAbout.values.trust.description,
            pt: ptAbout.values.trust.description,
          },
          order: 5,
        },
      ],
    },
    faq: {
      title: {
        es: esAbout.faq.title,
        en: enAbout.faq.title,
        pt: ptAbout.faq.title,
      },
    },
    seoTitle: {
      es: esAbout.title,
      en: enAbout.title,
      pt: ptAbout.title,
    },
    seoDescription: {
      es: esAbout.subtitle,
      en: enAbout.subtitle,
      pt: ptAbout.subtitle,
    },
    lastModifiedBy: 'migration-script',
  };

  return transformedContent;
}

async function seedAboutContent() {
  try {
    console.log('🚀 Starting about content migration...');

    // Validate Firebase configuration
    if (!firebaseConfig.projectId) {
      console.error(
        '❌ Firebase project ID not found in environment variables'
      );
      console.log(
        '   Please ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set in .env.local'
      );
      process.exit(1);
    }

    console.log(`🔧 Using Firebase project: ${firebaseConfig.projectId}`);

    // Read static content files
    console.log('📖 Reading static content files...');
    const esContent = readJsonFile(contentEsPath);
    const enContent = readJsonFile(contentEnPath);
    const ptContent = readJsonFile(contentPtPath);

    if (!esContent || !enContent || !ptContent) {
      throw new Error('Failed to read one or more content files');
    }

    console.log('✅ Successfully read all content files');

    // Transform content to new structure
    console.log('🔄 Transforming content structure...');
    const transformedContent = transformAboutContent(
      esContent,
      enContent,
      ptContent
    );
    console.log('✅ Content transformation completed');

    // Check if about content already exists
    console.log('🔍 Checking for existing about content...');
    const aboutCollection = collection(db, 'aboutContent');
    const existingDocs = await getDocs(aboutCollection);

    if (!existingDocs.empty) {
      console.log('⚠️  About content already exists in Firestore');
      console.log('📊 Existing documents:');
      existingDocs.forEach(doc => {
        console.log(
          `   - ${doc.id} (created: ${doc.data().createdAt?.toDate()})`
        );
      });

      const shouldOverwrite = process.argv.includes('--overwrite');
      if (!shouldOverwrite) {
        console.log('💡 Use --overwrite flag to replace existing content');
        console.log('❌ Migration aborted');
        process.exit(0);
      }

      console.log('🗑️  Removing existing content...');
      const deletePromises = existingDocs.docs.map(docSnapshot =>
        deleteDoc(doc(db, 'aboutContent', docSnapshot.id))
      );
      await Promise.all(deletePromises);
      console.log('✅ Existing content removed');
    }

    // Add timestamps
    const contentWithTimestamps = {
      ...transformedContent,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Upload to Firestore
    console.log('📤 Uploading content to Firestore...');
    const docRef = await addDoc(aboutCollection, contentWithTimestamps);

    console.log('✅ About content successfully migrated!');
    console.log(`📄 Document ID: ${docRef.id}`);
    console.log('📊 Migration summary:');
    console.log(
      `   - Philosophy items: ${transformedContent.philosophy.items.length}`
    );
    console.log(
      `   - Methodology steps: ${transformedContent.methodology.items.length}`
    );
    console.log(`   - Values: ${transformedContent.values.items.length}`);
    console.log(`   - Languages: ES, EN, PT`);

    // Verify the upload
    console.log('🔍 Verifying upload...');
    const uploadedDoc = await getDocs(collection(db, 'aboutContent'));
    if (!uploadedDoc.empty) {
      console.log('✅ Upload verification successful');
      const doc = uploadedDoc.docs[0];
      console.log(`📅 Created at: ${doc.data().createdAt?.toDate()}`);
    } else {
      console.log('❌ Upload verification failed');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);

    if (error.code === 'permission-denied') {
      console.log('💡 This might be a Firestore security rules issue.');
      console.log(
        '   Make sure your Firestore rules allow write access for seeding.'
      );
    }

    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('📚 About Content Migration Script');
    console.log('');
    console.log(
      'This script migrates static about content from JSON files to Firestore.'
    );
    console.log('');
    console.log('Usage: node scripts/seed-about-content.js [--overwrite]');
    console.log('');
    console.log('Options:');
    console.log('  --overwrite    Replace existing about content if it exists');
    console.log('  --help, -h     Show this help message');
    console.log('');
    process.exit(0);
  }

  seedAboutContent();
}

module.exports = { seedAboutContent };
