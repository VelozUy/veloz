const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');
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
    'appId'
  ];

  const missing = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missing.length > 0) {
    console.error('❌ Missing Firebase configuration:', missing.join(', '));
    console.log('Please check your .env.local file has all required Firebase variables');
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

async function checkHomepageCollection() {
  try {
    console.log('\n🔍 Checking homepage collection...');
    
    const homepageCollection = collection(db, 'homepage');
    const snapshot = await getDocs(homepageCollection);
    
    if (snapshot.empty) {
      console.log('📝 Homepage collection is empty');
      return;
    }
    
    console.log(`📝 Found ${snapshot.size} document(s) in homepage collection:`);
    snapshot.forEach(doc => {
      console.log(`   - Document ID: "${doc.id}"`);
      const data = doc.data();
      console.log(`     Created: ${data.createdAt?.toDate?.()?.toLocaleString() || 'Unknown'}`);
      console.log(`     Updated: ${data.updatedAt?.toDate?.()?.toLocaleString() || 'Unknown'}`);
      if (data.headline) {
        console.log(`     Headline (ES): ${data.headline.es || 'Not set'}`);
      }
    });
  } catch (error) {
    console.error('❌ Error checking homepage collection:', error.message);
  }
}

async function checkAllCollections() {
  try {
    console.log('\n🔍 Checking all collections for potential ID conflicts...');
    
    const collections = [
      'homepage',
      'adminUsers', 
      'faqs',
      'photos',
      'videos',
      'projects',
      'projectMedia',
      'contactMessages',
      'users'
    ];
    
    for (const collectionName of collections) {
      try {
        console.log(`\n📂 Checking collection: ${collectionName}`);
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        if (snapshot.empty) {
          console.log(`   📝 Collection is empty`);
        } else {
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
              console.log(`   🚨 Found document with ID "4" - this might be causing the conflict!`);
            }
          }
          
          // Show first few document IDs
          const firstFew = snapshot.docs.slice(0, 5).map(doc => doc.id);
          console.log(`   📄 First few document IDs: ${firstFew.join(', ')}`);
        }
      } catch (error) {
        console.log(`   ❌ Error accessing collection: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Error checking collections:', error.message);
  }
}

async function checkSpecificDocument(collectionName, documentId) {
  try {
    console.log(`\n🔍 Checking document: ${collectionName}/${documentId}`);
    
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('✅ Document exists');
      const data = docSnap.data();
      console.log('   Data keys:', Object.keys(data));
      console.log('   Created:', data.createdAt?.toDate?.()?.toLocaleString() || 'Unknown');
      console.log('   Updated:', data.updatedAt?.toDate?.()?.toLocaleString() || 'Unknown');
    } else {
      console.log('❌ Document does not exist');
    }
  } catch (error) {
    console.error('❌ Error checking document:', error.message);
  }
}

async function main() {
  const command = process.argv[2];
  const collectionName = process.argv[3];
  const documentId = process.argv[4];

  switch (command) {
    case 'homepage':
      await checkHomepageCollection();
      break;
      
    case 'all':
      await checkAllCollections();
      break;
      
    case 'doc':
      if (!collectionName || !documentId) {
        console.error('❌ Please provide collection name and document ID');
        console.log('Usage: node debug-firestore.js doc <collection> <documentId>');
        break;
      }
      await checkSpecificDocument(collectionName, documentId);
      break;
      
    default:
      console.log('Firestore Debug Script');
      console.log('');
      console.log('Usage:');
      console.log('  node debug-firestore.js homepage           - Check homepage collection');
      console.log('  node debug-firestore.js all                - Check all collections for ID conflicts');
      console.log('  node debug-firestore.js doc <col> <id>     - Check specific document');
      console.log('');
      console.log('Examples:');
      console.log('  node debug-firestore.js homepage');
      console.log('  node debug-firestore.js all');
      console.log('  node debug-firestore.js doc homepage content');
      console.log('  node debug-firestore.js doc homepage 4');
      break;
  }
}

main().then(() => {
  console.log('\n✅ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 