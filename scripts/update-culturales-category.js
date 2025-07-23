const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, query, where } = require('firebase/firestore');

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

async function updateCulturalesCategory() {
  try {
    console.log('🔍 Searching for projects with old "Culturales y artísticos" eventType...');
    
    // Query projects with the old eventType
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('eventType', '==', 'Culturales y artísticos'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('✅ No projects found with the old eventType "Culturales y artísticos"');
      return;
    }
    
    console.log(`📝 Found ${snapshot.size} projects to update`);
    
    // Update each project
    const updatePromises = snapshot.docs.map(async (docSnapshot) => {
      const projectId = docSnapshot.id;
      const projectData = docSnapshot.data();
      
      console.log(`🔄 Updating project: ${projectData.title?.es || projectData.title?.en || projectId}`);
      
      // Update the eventType
      await updateDoc(doc(db, 'projects', projectId), {
        eventType: 'Culturales',
        updatedAt: new Date()
      });
      
      console.log(`✅ Updated project: ${projectId}`);
    });
    
    await Promise.all(updatePromises);
    
    console.log('🎉 Successfully updated all projects with new eventType "Culturales"');
    
  } catch (error) {
    console.error('❌ Error updating projects:', error);
    process.exit(1);
  }
}

// Run the update
updateCulturalesCategory()
  .then(() => {
    console.log('✅ Database update completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database update failed:', error);
    process.exit(1);
  }); 