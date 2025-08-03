const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
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

async function createAdminUser(email, role = 'admin') {
  try {
    console.log(`🔄 Creating admin user: ${email}`);
    
    const adminUser = {
      email: email.toLowerCase().trim(),
      status: 'active',
      role: role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'adminUsers', adminUser.email), adminUser);
    console.log(`✅ Admin user created successfully: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Status: ${adminUser.status}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    return false;
  }
}

async function listAdminUsers() {
  try {
    console.log('🔄 Fetching admin users...');
    
    const { collection, getDocs } = require('firebase/firestore');
    const snapshot = await getDocs(collection(db, 'adminUsers'));
    
    if (snapshot.empty) {
      console.log('📝 No admin users found');
      return;
    }
    
    console.log('📝 Current admin users:');
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.email} (${data.status}, ${data.role || 'no role'})`);
    });
  } catch (error) {
    console.error('❌ Error listing admin users:', error.message);
  }
}

async function main() {
  const command = process.argv[2];
  const email = process.argv[3];
  const role = process.argv[4] || 'admin';

  switch (command) {
    case 'create':
      if (!email) {
        console.error('❌ Please provide an email address');
        console.log('Usage: node create-admin-user.js create <email> [role]');
        process.exit(1);
      }
      
      const success = await createAdminUser(email, role);
      if (success) {
        console.log('\n🎉 Admin user created successfully!');
        console.log('The user can now sign in to the admin panel.');
      }
      break;
      
    case 'list':
      await listAdminUsers();
      break;
      
    default:
      console.log('Admin User Management Script');
      console.log('');
      console.log('Usage:');
      console.log('  node create-admin-user.js create <email> [role]  - Create a new admin user');
      console.log('  node create-admin-user.js list                   - List all admin users');
      console.log('');
      console.log('Examples:');
      console.log('  node create-admin-user.js create admin@example.com');
      console.log('  node create-admin-user.js create user@example.com editor');
      console.log('  node create-admin-user.js list');
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