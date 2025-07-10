import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
// Firebase configuration (copied from firebase-config.ts)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Generate a slug from text
 */
function createSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

/**
 * Generate a unique slug from project title
 */
function generateUniqueSlug(title, existingSlugs = [], projectId) {
  // Generate base slug from title
  let baseSlug = createSlug(title);

  // If title is empty or generates invalid slug, use fallback
  if (!baseSlug) {
    baseSlug = projectId || 'project';
  }

  // Limit to 60 characters
  baseSlug = baseSlug.substring(0, 60);

  // Remove trailing hyphens
  baseSlug = baseSlug.replace(/-+$/, '');

  // If slug is empty after processing, use fallback
  if (!baseSlug) {
    baseSlug = projectId || 'project';
  }

  // Check if slug is unique
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(uniqueSlug)) {
    const suffix = `-${counter}`;
    // Ensure total length doesn't exceed 60 characters
    const availableLength = 60 - suffix.length;
    const truncatedBase = baseSlug.substring(0, availableLength);
    uniqueSlug = `${truncatedBase}${suffix}`;
    counter++;
  }

  return uniqueSlug;
}

/**
 * Migrate existing projects by generating slugs
 */
async function migrateProjectSlugs() {
  try {
    console.log('🚀 Starting project slug migration...');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Fetch all projects
    console.log('📋 Fetching all projects...');
    const projectsQuery = query(
      collection(db, 'projects'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(projectsQuery);
    
    const projectsToUpdate = [];
    const existingSlugs = [];

    // First pass: collect existing slugs and identify projects needing slugs
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const project = {
        id: doc.id,
        ...data,
      };

      // If project already has a slug, add it to existing slugs list
      if (project.slug) {
        existingSlugs.push(project.slug);
      } else {
        // Project needs a slug
        const spanishTitle = data.title?.es || data.title || 'Project';
        const newSlug = generateUniqueSlug(spanishTitle, existingSlugs, doc.id);
        
        projectsToUpdate.push({
          id: doc.id,
          slug: newSlug,
          title: spanishTitle,
        });
        
        existingSlugs.push(newSlug);
      }
    }

    if (projectsToUpdate.length === 0) {
      console.log('✅ All projects already have slugs. No migration needed.');
      return;
    }

    console.log(`🔄 Found ${projectsToUpdate.length} projects that need slugs:`);
    projectsToUpdate.forEach(project => {
      console.log(`  - ${project.id}: "${project.title}" → ${project.slug}`);
    });

    // Second pass: update projects with generated slugs
    console.log('\n🔄 Updating projects with generated slugs...');
    const results = [];
    
    for (const project of projectsToUpdate) {
      try {
        const projectRef = doc(db, 'projects', project.id);
        await updateDoc(projectRef, {
          slug: project.slug,
          updatedAt: serverTimestamp(),
        });
        
        console.log(`✅ Updated project ${project.id} with slug: ${project.slug}`);
        results.push({ success: true, id: project.id, slug: project.slug });
      } catch (error) {
        console.error(`❌ Failed to update project ${project.id}:`, error.message);
        results.push({ success: false, id: project.id, error: error.message });
      }
    }

    // Summary
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Successfully updated: ${successful.length} projects`);
    if (failed.length > 0) {
      console.log(`  ❌ Failed to update: ${failed.length} projects`);
      failed.forEach(f => console.log(`    - ${f.id}: ${f.error}`));
    }

    console.log('\n🎉 Slug migration completed!');
    return { successful, failed };

  } catch (error) {
    console.error('❌ Error during slug migration:', error);
    throw error;
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateProjectSlugs()
    .then(() => {
      console.log('✅ Migration script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateProjectSlugs }; 