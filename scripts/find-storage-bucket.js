#!/usr/bin/env node

/**
 * Find Firebase Storage Bucket Script
 * 
 * This script tries different methods to find the actual Firebase Storage bucket name
 */

const admin = require('firebase-admin');

// Try to load environment variables
require('dotenv').config();

// Configuration
const CONFIG = {
  serviceAccountPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: 'veloz-6efe6',
  // Common bucket name patterns
  bucketPatterns: [
    // Standard patterns
    '{projectId}.appspot.com',
    '{projectId}',
    '{projectId}-storage',
    '{projectId}-bucket',
    // Alternative project names
    'veloz-uy.appspot.com',
    'veloz-uy',
    'veloz.appspot.com',
    'veloz',
    // Environment variable
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    // Try with different regions
    '{projectId}-us-central1.appspot.com',
    '{projectId}-us-east1.appspot.com',
    '{projectId}-europe-west1.appspot.com',
  ].filter(Boolean)
};

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  try {
    if (admin.apps.length > 0) {
      return admin.apps[0];
    }

    if (!CONFIG.serviceAccountPath) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
    }

    const serviceAccount = require(CONFIG.serviceAccountPath);
    console.log('✅ Service account loaded');
    console.log('   Project ID:', serviceAccount.project_id);
    console.log('   Client Email:', serviceAccount.client_email);
    
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    throw error;
  }
}

/**
 * Test a bucket name
 */
async function testBucket(bucketName) {
  try {
    const storage = admin.storage();
    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles({ maxResults: 1 });
    return { success: true, files: files.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate bucket names from patterns
 */
function generateBucketNames() {
  const bucketNames = [];
  
  for (const pattern of CONFIG.bucketPatterns) {
    if (pattern.includes('{projectId}')) {
      bucketNames.push(pattern.replace('{projectId}', CONFIG.projectId));
    } else {
      bucketNames.push(pattern);
    }
  }
  
  // Remove duplicates
  return [...new Set(bucketNames)];
}

/**
 * Main function
 */
async function findStorageBucket() {
  console.log('🔍 Finding Firebase Storage Bucket\n');
  console.log('=====================================\n');
  
  try {
    // Initialize Firebase
    console.log('1️⃣ Initializing Firebase...');
    const app = initializeFirebase();
    console.log('✅ Firebase initialized\n');
    
    // Generate bucket names to test
    console.log('2️⃣ Generating bucket names to test...');
    const bucketNames = generateBucketNames();
    console.log(`📋 Testing ${bucketNames.length} bucket names:\n`);
    
    // Test each bucket name
    console.log('3️⃣ Testing bucket names...\n');
    
    for (const bucketName of bucketNames) {
      console.log(`Testing: ${bucketName}`);
      const result = await testBucket(bucketName);
      
      if (result.success) {
        console.log(`✅ SUCCESS! Bucket "${bucketName}" is accessible`);
        console.log(`   Files found: ${result.files}`);
        
        // If we found files, let's get more details
        if (result.files > 0) {
          try {
            const storage = admin.storage();
            const bucket = storage.bucket(bucketName);
            const [files] = await bucket.getFiles({ maxResults: 5 });
            
            console.log(`   Sample files:`);
            files.forEach((file, index) => {
              console.log(`     ${index + 1}. ${file.name}`);
            });
            
            if (files.length >= 5) {
              console.log(`     ... and more files`);
            }
          } catch (error) {
            console.log(`   Could not list files: ${error.message}`);
          }
        }
        
        console.log(`\n🎉 Working bucket found: ${bucketName}`);
        console.log('\n💡 To use this bucket, set:');
        console.log(`   export FIREBASE_STORAGE_BUCKET="${bucketName}"`);
        console.log('\n📝 Then run:');
        console.log('   npm run optimize:existing');
        
        return bucketName;
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
    }
    
    console.log('\n❌ No working bucket found');
    console.log('\n💡 Possible solutions:');
    console.log('   1. Check Firebase Console for the correct bucket name');
    console.log('   2. Verify the service account has Storage permissions');
    console.log('   3. The bucket might be in a different project');
    console.log('   4. Try enabling Firebase Storage if not already enabled');
    
    return null;
    
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    return null;
  }
}

// Run the script
if (require.main === module) {
  findStorageBucket()
    .then((bucketName) => {
      if (bucketName) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { findStorageBucket };
