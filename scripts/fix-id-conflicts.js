const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
} = require('firebase/firestore');
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

// Validate configuration
function validateConfig() {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missing = requiredFields.filter(field => !firebaseConfig[field]);

  if (missing.length > 0) {
    console.error('❌ Missing Firebase configuration:', missing.join(', '));
    console.log(
      'Please check your .env.local file has all required Firebase variables'
    );
    return false;
  }

  return true;
}

// Initialize Firebase
let app, db;

try {
  if (!validateConfig()) {
    process.exit(1);
  }

  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  process.exit(1);
}

async function findAndFixIdConflicts() {
  try {
    console.log('\n🔍 Searching for potential ID conflicts...');

    const collections = [
      'homepage',
      'faqs',
      'projects',
      'projectMedia',
      'taskTemplates',
      'projectTasks',
      'notifications',
      'clientSessions',
      'crewAvailability',
      'contactMessages',
      'adminUsers',
      'users',
    ];

    let foundConflicts = false;

    for (const collectionName of collections) {
      try {
        console.log(`\n📂 Checking collection: ${collectionName}`);
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);

        if (snapshot.empty) {
          console.log(`   📝 Collection is empty`);
          continue;
        }

        console.log(`   📝 Found ${snapshot.size} document(s)`);

        // Check for numeric IDs that might be causing conflicts
        const numericIds = snapshot.docs
          .map(doc => doc.id)
          .filter(id => /^\d+$/.test(id))
          .sort((a, b) => parseInt(a) - parseInt(b));

        if (numericIds.length > 0) {
          console.log(`   ⚠️  Found numeric IDs: ${numericIds.join(', ')}`);

          // Check for ID "4" specifically
          if (numericIds.includes('4')) {
            console.log(
              `   🚨 Found document with ID "4" - this might be causing the conflict!`
            );
            foundConflicts = true;

            // Ask user if they want to delete it
            console.log(
              `   💡 To fix this, you can manually delete the document with ID "4" from the ${collectionName} collection in Firebase Console`
            );
            console.log(
              `   🔗 Firebase Console: https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/data/${collectionName}/4`
            );
          }
        }

        // Check for duplicate IDs (shouldn't happen, but just in case)
        const allIds = snapshot.docs.map(doc => doc.id);
        const uniqueIds = new Set(allIds);
        if (allIds.length !== uniqueIds.size) {
          console.log(`   🚨 Found duplicate IDs in collection!`);
          foundConflicts = true;
        }
      } catch (error) {
        console.log(`   ❌ Error accessing collection: ${error.message}`);
      }
    }

    if (!foundConflicts) {
      console.log(
        '\n✅ No obvious ID conflicts found in accessible collections'
      );
      console.log('💡 The error might be coming from:');
      console.log('   1. A collection with restricted permissions');
      console.log('   2. A temporary Firebase issue');
      console.log('   3. A race condition in document creation');
      console.log(
        '   4. A component trying to create documents with specific IDs'
      );
    }
  } catch (error) {
    console.error('❌ Error searching for conflicts:', error.message);
  }
}

async function clearHomepageContent() {
  try {
    console.log(
      '\n🧹 Clearing homepage content to reset any potential conflicts...'
    );

    const docRef = doc(db, 'homepage', 'content');

    // Try to delete the existing document
    try {
      await deleteDoc(docRef);
      console.log('✅ Deleted existing homepage content');
    } catch (error) {
      console.log('ℹ️  No existing homepage content to delete');
    }

    // Create fresh homepage content
    const defaultContent = {
      headline: {
        en: 'Welcome to Veloz',
        es: 'Bienvenido a Veloz',
        pt: 'Bem-vindo ao Veloz',
      },
      subheadline: {
        en: 'Professional photography and videography services',
        es: 'Servicios profesionales de fotografía y videografía',
        pt: 'Serviços profissionais de fotografia e videografia',
      },
      ctaButtons: {
        primary: {
          text: {
            en: 'View Our Work',
            es: 'Ver Nuestro Trabajo',
            pt: 'Ver Nosso Trabalho',
          },
          link: '/our-work',
          enabled: true,
        },
        secondary: {
          text: {
            en: 'Contact Us',
            es: 'Contáctanos',
            pt: 'Entre em Contato',
          },
          link: '/contact',
          enabled: true,
        },
      },
      backgroundVideo: {
        url: '',
        enabled: false,
        filename: '',
      },
      backgroundImages: {
        urls: [],
        enabled: false,
        filenames: [],
      },
      logo: {
        url: '',
        enabled: false,
        filename: '',
      },
      theme: {
        overlayOpacity: 0.5,
        gradientColors: ['hsl(var(--foreground))', 'hsl(var(--foreground))'],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(docRef, defaultContent);
    console.log('✅ Created fresh homepage content');
  } catch (error) {
    console.error('❌ Error clearing homepage content:', error.message);
  }
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'find':
      await findAndFixIdConflicts();
      break;

    case 'clear-homepage':
      await clearHomepageContent();
      break;

    case 'fix':
      await findAndFixIdConflicts();
      console.log('\n🧹 Attempting to fix homepage content...');
      await clearHomepageContent();
      break;

    default:
      console.log('Firestore ID Conflict Fix Script');
      console.log('');
      console.log('Usage:');
      console.log(
        '  node scripts/fix-id-conflicts.js find           - Find potential ID conflicts'
      );
      console.log(
        '  node scripts/fix-id-conflicts.js clear-homepage - Clear and recreate homepage content'
      );
      console.log(
        '  node scripts/fix-id-conflicts.js fix            - Find conflicts and fix homepage'
      );
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/fix-id-conflicts.js find');
      console.log('  node scripts/fix-id-conflicts.js clear-homepage');
      console.log('  node scripts/fix-id-conflicts.js fix');
      break;
  }
}

main()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
