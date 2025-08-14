#!/usr/bin/env node

/**
 * Firebase Storage Test Script
 * 
 * Tests Firebase Storage configuration and helps diagnose issues
 */

const admin = require('firebase-admin');

// Configuration
const TEST_CONFIG = {
  serviceAccountPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: 'veloz-6efe6',
  possibleBucketNames: [
    'veloz-6efe6.appspot.com',
    'veloz-6efe6',
    'veloz-6efe6-storage',
    'veloz-6efe6-bucket',
    // Try environment variable bucket name
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    // Try common variations
    'veloz-uy.appspot.com',
    'veloz-uy',
    'veloz.appspot.com',
    'veloz'
  ].filter(Boolean) // Remove undefined values
};

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      return admin.apps[0];
    }

    // Check service account path
    if (!TEST_CONFIG.serviceAccountPath) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
    }

    const serviceAccount = require(TEST_CONFIG.serviceAccountPath);
    console.log('✅ Service account loaded successfully');
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
 * Test different bucket names
 */
async function testBucketNames() {
  console.log('\n🔍 Testing different bucket names...\n');
  console.log('📋 Bucket names to test:', TEST_CONFIG.possibleBucketNames.join(', '));
  
  for (const bucketName of TEST_CONFIG.possibleBucketNames) {
    try {
      console.log(`\nTesting bucket: ${bucketName}`);
      const storage = admin.storage();
      const bucket = storage.bucket(bucketName);
      const [files] = await bucket.getFiles({ maxResults: 5 });
      console.log(`✅ Bucket "${bucketName}" exists and is accessible!`);
      console.log(`   Found ${files.length} files`);
      if (files.length > 0) {
        console.log(`   Sample files:`);
        files.slice(0, 3).forEach((file, index) => {
          console.log(`     ${index + 1}. ${file.name}`);
        });
        if (files.length > 3) {
          console.log(`     ... and ${files.length - 3} more files`);
        }
      }
      return bucketName;
    } catch (error) {
      console.log(`❌ Bucket "${bucketName}" failed: ${error.message}`);
    }
  }
  
  return null;
}

/**
 * List available buckets
 */
async function listAvailableBuckets() {
  try {
    console.log('\n📋 Listing all available buckets...\n');
    const storage = admin.storage();
    
    // Try to access a specific bucket first
    const bucket = storage.bucket('veloz-6efe6.appspot.com');
    const [files] = await bucket.getFiles({ maxResults: 1 });
    console.log(`✅ Found bucket: veloz-6efe6.appspot.com`);
    console.log(`   Files in bucket: ${files.length}`);
    return true;
  } catch (error) {
    console.log('❌ Default bucket not found, trying alternatives...');
    
    // Try alternative bucket names
    const alternativeBuckets = ['veloz-6efe6', 'veloz-6efe6-storage'];
    
    for (const bucketName of alternativeBuckets) {
      try {
        const storage = admin.storage();
        const bucket = storage.bucket(bucketName);
        const [files] = await bucket.getFiles({ maxResults: 1 });
        console.log(`✅ Found bucket: ${bucketName}`);
        console.log(`   Files in bucket: ${files.length}`);
        return true;
      } catch (bucketError) {
        console.log(`❌ Bucket ${bucketName} not accessible: ${bucketError.message}`);
      }
    }
    
    console.log('❌ No accessible buckets found. This might mean:');
    console.log('   1. Firebase Storage is not enabled for this project');
    console.log('   2. The service account lacks Storage permissions');
    console.log('   3. The project is in a different region');
    return false;
  }
}

/**
 * Check service account permissions
 */
async function checkPermissions() {
  try {
    console.log('\n🔐 Checking service account permissions...\n');
    
    // Try to access the project
    const project = admin.app().options;
    console.log('✅ Service account can access Firebase project');
    console.log('   Project ID:', project.projectId);
    
    // Try to access storage (this requires Storage permissions)
    const storage = admin.storage();
    console.log('✅ Service account can access Firebase Storage');
    
    return true;
  } catch (error) {
    console.error('❌ Permission check failed:', error.message);
    console.log('\n💡 This might mean:');
    console.log('   1. The service account lacks Storage Admin role');
    console.log('   2. Firebase Storage is not enabled');
    console.log('   3. The project is in a different region');
    return false;
  }
}

/**
 * Main test function
 */
async function testFirebaseStorage() {
  console.log('🚀 Firebase Storage Configuration Test\n');
  console.log('=====================================\n');
  
  try {
    // Initialize Firebase
    console.log('1️⃣ Initializing Firebase...');
    const app = initializeFirebase();
    console.log('✅ Firebase initialized successfully\n');
    
    // Check permissions
    console.log('2️⃣ Checking permissions...');
    const hasPermissions = await checkPermissions();
    if (!hasPermissions) {
      console.log('\n❌ Permission check failed. Please check your service account configuration.');
      return;
    }
    
    // Test specific bucket names
    console.log('3️⃣ Testing specific bucket names...');
    const workingBucket = await testBucketNames();
    
    if (workingBucket) {
      console.log(`\n🎉 SUCCESS! Working bucket found: ${workingBucket}`);
      console.log('\n💡 To use this bucket, set:');
      console.log(`   export FIREBASE_STORAGE_BUCKET="${workingBucket}"`);
      console.log('\n📝 Then run:');
      console.log('   npm run optimize:existing');
    } else {
      console.log('\n❌ No working bucket found.');
      console.log('\n💡 Possible solutions:');
      console.log('   1. Enable Firebase Storage in your Firebase Console');
      console.log('   2. Create a storage bucket manually');
      console.log('   3. Check if your project uses a different bucket name');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check your service account JSON file');
    console.log('   2. Verify the GOOGLE_APPLICATION_CREDENTIALS environment variable');
    console.log('   3. Ensure the service account has Storage Admin permissions');
  }
}

// Run the test
if (require.main === module) {
  testFirebaseStorage()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { testFirebaseStorage };
