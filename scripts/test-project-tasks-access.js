const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
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

async function testProjectTasksAccess() {
  try {
    console.log('Testing access to projectTasks collection...');
    
    const tasksSnapshot = await getDocs(collection(db, 'projectTasks'));
    console.log(`Successfully accessed projectTasks collection. Found ${tasksSnapshot.size} documents.`);
    
    if (tasksSnapshot.size > 0) {
      console.log('Sample task data:');
      tasksSnapshot.forEach((doc, index) => {
        if (index < 3) { // Show first 3 tasks
          console.log(`- ${doc.id}: ${doc.data().title}`);
        }
      });
    } else {
      console.log('No tasks found in the collection.');
    }
    
  } catch (error) {
    console.error('Error accessing projectTasks collection:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test
testProjectTasksAccess(); 