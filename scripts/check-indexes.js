const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Your Firebase config (you can get this from your firebase config)
const firebaseConfig = {
  // Add your Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkIndexes() {
  console.log('Checking Firestore indexes...');
  
  try {
    // Test queries that require indexes
    console.log('\n1. Testing clients collection query...');
    const clientsRef = collection(db, 'clients');
    const clientsSnapshot = await getDocs(clientsRef);
    console.log('✅ Clients query successful');
    
    console.log('\n2. Testing public_access collection query...');
    const publicAccessRef = collection(db, 'public_access');
    const publicAccessSnapshot = await getDocs(publicAccessRef);
    console.log('✅ Public access query successful');
    
    console.log('\n3. Testing project_files collection query...');
    const projectFilesRef = collection(db, 'project_files');
    const projectFilesSnapshot = await getDocs(projectFilesRef);
    console.log('✅ Project files query successful');
    
    console.log('\n4. Testing client_invites collection query...');
    const clientInvitesRef = collection(db, 'client_invites');
    const clientInvitesSnapshot = await getDocs(clientInvitesRef);
    console.log('✅ Client invites query successful');
    
    console.log('\n🎉 All index-dependent queries are working!');
    
  } catch (error) {
    console.error('❌ Index error:', error.message);
    console.log('\n💡 If you see index errors, the indexes might still be building.');
    console.log('   Check the Firebase Console > Firestore > Indexes tab for status.');
  }
}

checkIndexes(); 