const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
require('dotenv').config();

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

async function initHomepageContent() {
  try {
    console.log('🔄 Initializing homepage content...');

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

    const docRef = doc(db, 'homepage', 'content');
    await setDoc(docRef, defaultContent);

    console.log('✅ Homepage content initialized successfully');
    console.log('   Document ID: content');
    console.log('   Collection: homepage');

    return true;
  } catch (error) {
    console.error('❌ Error initializing homepage content:', error.message);
    return false;
  }
}

async function checkHomepageContent() {
  try {
    console.log('🔄 Checking existing homepage content...');

    const { getDoc } = require('firebase/firestore');
    const docRef = doc(db, 'homepage', 'content');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log('✅ Homepage content already exists');
      const data = docSnap.data();
      console.log('   Headline (ES):', data.headline?.es || 'Not set');
      console.log(
        '   Last updated:',
        data.updatedAt?.toDate?.()?.toLocaleString() || 'Unknown'
      );
    } else {
      console.log('📝 No homepage content found');
    }

    return docSnap.exists();
  } catch (error) {
    console.error('❌ Error checking homepage content:', error.message);
    return false;
  }
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'init':
      const exists = await checkHomepageContent();
      if (exists) {
        console.log(
          '\n⚠️  Homepage content already exists. Use --force to overwrite.'
        );
        if (process.argv.includes('--force')) {
          console.log('🔄 Force overwriting...');
          const success = await initHomepageContent();
          if (success) {
            console.log('\n🎉 Homepage content updated successfully!');
          }
        } else {
          console.log('Use: node init-homepage-content.js init --force');
        }
      } else {
        const success = await initHomepageContent();
        if (success) {
          console.log('\n🎉 Homepage content created successfully!');
        }
      }
      break;

    case 'check':
      await checkHomepageContent();
      break;

    default:
      console.log('Homepage Content Management Script');
      console.log('');
      console.log('Usage:');
      console.log(
        '  node init-homepage-content.js init [--force]  - Initialize homepage content'
      );
      console.log(
        '  node init-homepage-content.js check           - Check existing content'
      );
      console.log('');
      console.log('Examples:');
      console.log('  node init-homepage-content.js init');
      console.log('  node init-homepage-content.js init --force');
      console.log('  node init-homepage-content.js check');
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
