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

const { readFileSync } = require('fs');
const { join } = require('path');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : null;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    // For local development, use default credentials
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'veloz-6efe6',
    });
  }
}

const db = admin.firestore();

// Utility function to generate IDs
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Load static content files
function loadStaticContent() {
  const contentDir = join(process.cwd(), 'src', 'data');

  const esContent = JSON.parse(
    readFileSync(join(contentDir, 'content-es.json'), 'utf8')
  );
  const enContent = JSON.parse(
    readFileSync(join(contentDir, 'content-en.json'), 'utf8')
  );
  const ptContent = JSON.parse(
    readFileSync(join(contentDir, 'content-pt.json'), 'utf8')
  );

  return {
    es: esContent.translations.about,
    en: enContent.translations.about,
    pt: ptContent.translations.about,
  };
}

// Transform static content to new dynamic schema
function transformAboutContent(staticContent) {
  console.log('🔄 Transforming static content to dynamic schema...');

  // Transform philosophy from single description to array of points
  const philosophyItems = [
    {
      id: generateId(),
      title: {
        es: 'Historias que Perduran',
        en: 'Stories that Endure',
        pt: 'Histórias que Perduram',
      },
      description: {
        es: staticContent.es.philosophy.description,
        en: staticContent.en.philosophy.description,
        pt: staticContent.pt.philosophy.description,
      },
      order: 0,
    },
  ];

  // Transform methodology from fixed steps to dynamic array
  const methodologyItems = [
    {
      id: generateId(),
      title: {
        es: staticContent.es.methodology.planning.title,
        en: staticContent.en.methodology.planning.title,
        pt: staticContent.pt.methodology.planning.title,
      },
      description: {
        es: staticContent.es.methodology.planning.description,
        en: staticContent.en.methodology.planning.description,
        pt: staticContent.pt.methodology.planning.description,
      },
      order: 0,
    },
    {
      id: generateId(),
      title: {
        es: staticContent.es.methodology.coverage.title,
        en: staticContent.en.methodology.coverage.title,
        pt: staticContent.pt.methodology.coverage.title,
      },
      description: {
        es: staticContent.es.methodology.coverage.description,
        en: staticContent.en.methodology.coverage.description,
        pt: staticContent.pt.methodology.coverage.description,
      },
      order: 1,
    },
    {
      id: generateId(),
      title: {
        es: staticContent.es.methodology.capture.title,
        en: staticContent.en.methodology.capture.title,
        pt: staticContent.pt.methodology.capture.title,
      },
      description: {
        es: staticContent.es.methodology.capture.description,
        en: staticContent.en.methodology.capture.description,
        pt: staticContent.pt.methodology.capture.description,
      },
      order: 2,
    },
    {
      id: generateId(),
      title: {
        es: staticContent.es.methodology.postproduction.title,
        en: staticContent.en.methodology.postproduction.title,
        pt: staticContent.pt.methodology.postproduction.title,
      },
      description: {
        es: staticContent.es.methodology.postproduction.description,
        en: staticContent.en.methodology.postproduction.description,
        pt: staticContent.pt.methodology.postproduction.description,
      },
      order: 3,
    },
  ];

  // Transform values from fixed structure to dynamic array
  const valueItems = [
    {
      id: generateId(),
      title: {
        es: staticContent.es.values.passion.title,
        en: staticContent.en.values.passion.title,
        pt: staticContent.pt.values.passion.title,
      },
      description: {
        es: staticContent.es.values.passion.description,
        en: staticContent.en.values.passion.description,
        pt: staticContent.pt.values.passion.description,
      },
      order: 0,
    },
    {
      id: generateId(),
      title: {
        es: staticContent.es.values.teamwork.title,
        en: staticContent.en.values.teamwork.title,
        pt: staticContent.pt.values.teamwork.title,
      },
      description: {
        es: staticContent.es.values.teamwork.description,
        en: staticContent.en.values.teamwork.description,
        pt: staticContent.pt.values.teamwork.description,
      },
      order: 1,
    },
    {
      id: generateId(),
      title: {
        es: staticContent.es.values.quality.title,
        en: staticContent.en.values.quality.title,
        pt: staticContent.pt.values.quality.title,
      },
      description: {
        es: staticContent.es.values.quality.description,
        en: staticContent.en.values.quality.description,
        pt: staticContent.pt.values.quality.description,
      },
      order: 2,
    },
    {
      id: generateId(),
      title: {
        es: staticContent.es.values.agility.title,
        en: staticContent.en.values.agility.title,
        pt: staticContent.pt.values.agility.title,
      },
      description: {
        es: staticContent.es.values.agility.description,
        en: staticContent.en.values.agility.description,
        pt: staticContent.pt.values.agility.description,
      },
      order: 3,
    },
    {
      id: generateId(),
      title: {
        es: staticContent.es.values.excellence.title,
        en: staticContent.en.values.excellence.title,
        pt: staticContent.pt.values.excellence.title,
      },
      description: {
        es: staticContent.es.values.excellence.description,
        en: staticContent.en.values.excellence.description,
        pt: staticContent.pt.values.excellence.description,
      },
      order: 4,
    },
    {
      id: generateId(),
      title: {
        es: staticContent.es.values.trust.title,
        en: staticContent.en.values.trust.title,
        pt: staticContent.pt.values.trust.title,
      },
      description: {
        es: staticContent.es.values.trust.description,
        en: staticContent.en.values.trust.description,
        pt: staticContent.pt.values.trust.description,
      },
      order: 5,
    },
  ];

  return {
    title: {
      es: staticContent.es.title,
      en: staticContent.en.title,
      pt: staticContent.pt.title,
    },
    subtitle: {
      es: staticContent.es.subtitle,
      en: staticContent.en.subtitle,
      pt: staticContent.pt.subtitle,
    },
    philosophy: {
      title: {
        es: staticContent.es.philosophy.title,
        en: staticContent.en.philosophy.title,
        pt: staticContent.pt.philosophy.title,
      },
      items: philosophyItems,
    },
    methodology: {
      title: {
        es: staticContent.es.methodology.title,
        en: staticContent.en.methodology.title,
        pt: staticContent.pt.methodology.title,
      },
      items: methodologyItems,
    },
    values: {
      title: {
        es: staticContent.es.values.title,
        en: staticContent.en.values.title,
        pt: staticContent.pt.values.title,
      },
      items: valueItems,
    },
    faq: {
      title: {
        es: staticContent.es.faq.title,
        en: staticContent.en.faq.title,
        pt: staticContent.pt.faq.title,
      },
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastModifiedBy: 'system-seed',
  };
}

// Seed about content to Firestore
async function seedAboutContent() {
  try {
    console.log('🌱 Starting about content seeding...');

    // Load static content
    console.log('📖 Loading static content files...');
    const staticContent = loadStaticContent();

    // Transform content
    const aboutContent = transformAboutContent(staticContent);

    // Check if about content already exists
    const aboutCollection = db.collection('aboutContent');
    const existingDocs = await aboutCollection.limit(1).get();

    if (!existingDocs.empty) {
      console.log('⚠️  About content already exists in Firestore.');
      console.log(
        '   To reseed, delete existing content first or modify this script.'
      );
      process.exit(0);
    }

    // Create the about content document
    console.log('💾 Saving to Firestore...');
    const docRef = await aboutCollection.add(aboutContent);

    // Log success details
    console.log('✅ About content seeded successfully!');
    console.log(`📄 Document ID: ${docRef.id}`);
    console.log(`📊 Content summary:`);
    console.log(
      `   - Philosophy points: ${aboutContent.philosophy.items.length}`
    );
    console.log(
      `   - Methodology steps: ${aboutContent.methodology.items.length}`
    );
    console.log(`   - Values: ${aboutContent.values.items.length}`);
    console.log(`   - Languages: ES, EN, PT`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding about content:', error);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('📚 About Content Seeding Script');
    console.log('');
    console.log(
      'This script migrates static about content from JSON files to Firestore.'
    );
    console.log('');
    console.log('Usage: node scripts/seed-about-content.js');
    console.log('');
    process.exit(0);
  }

  seedAboutContent();
}

module.exports = { seedAboutContent, transformAboutContent, loadStaticContent };
