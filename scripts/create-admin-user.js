const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase configuration (you'll need to add your config here)
const firebaseConfig = {
  // Add your Firebase config here
  // This should match your firebase-config.ts file
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAdminUser(email) {
  try {
    const adminUser = {
      email: email,
      status: 'active',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'adminUsers', email), adminUser);
    console.log(`✅ Admin user created successfully: ${email}`);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Usage: node create-admin-user.js <email>
const email = process.argv[2];
if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node create-admin-user.js <email>');
  process.exit(1);
}

createAdminUser(email).then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 