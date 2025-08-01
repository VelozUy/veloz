const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} = require('firebase/firestore');

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

/**
 * Mark media items as featured
 * This script will mark the first 2 media items from each project as featured
 */
async function markFeaturedMedia() {
  try {
    console.log('🔍 Finding projects and their media...');

    // Get all published projects
    const projectsQuery = query(
      collection(db, 'projects'),
      where('status', '==', 'published')
    );
    const projectsSnapshot = await getDocs(projectsQuery);

    let totalMarked = 0;

    for (const projectDoc of projectsSnapshot.docs) {
      const projectId = projectDoc.id;
      console.log(`📸 Processing project: ${projectId}`);

      // Get media for this project
      const mediaQuery = query(
        collection(db, 'projectMedia'),
        where('projectId', '==', projectId),
        where('order', '>=', 0)
      );
      const mediaSnapshot = await getDocs(mediaQuery);

      const mediaDocs = mediaSnapshot.docs.sort(
        (a, b) => (a.data().order || 0) - (b.data().order || 0)
      );

      // Mark first 2 media items as featured
      const mediaToMark = mediaDocs.slice(0, 2);

      for (const mediaDoc of mediaToMark) {
        const mediaData = mediaDoc.data();

        // Only mark if not already featured
        if (!mediaData.featured) {
          await updateDoc(doc(db, 'projectMedia', mediaDoc.id), {
            featured: true,
          });
          console.log(`  ✅ Marked media ${mediaDoc.id} as featured`);
          totalMarked++;
        } else {
          console.log(`  ℹ️  Media ${mediaDoc.id} already featured`);
        }
      }
    }

    console.log(
      `\n🎉 Successfully marked ${totalMarked} media items as featured!`
    );
    console.log('💡 Now run: npm run build:data');
  } catch (error) {
    console.error('❌ Error marking featured media:', error);
  }
}

// Run the script
if (require.main === module) {
  markFeaturedMedia();
}

module.exports = { markFeaturedMedia };
