#!/usr/bin/env node

/**
 * Check Firebase Configuration Script
 * 
 * This script checks the Firebase configuration to find the actual storage bucket name
 */

// Try to load environment variables
require('dotenv').config();

console.log('🔍 Checking Firebase Configuration\n');
console.log('=====================================\n');

// Check environment variables
console.log('1️⃣ Environment Variables:');
console.log('   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'NOT SET');
console.log('   NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET');
console.log('   GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS || 'NOT SET');

// Check if service account file exists
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const fs = require('fs');
  const path = require('path');
  
  try {
    if (fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      console.log('\n2️⃣ Service Account Details:');
      console.log('   Project ID:', serviceAccount.project_id);
      console.log('   Client Email:', serviceAccount.client_email);
      console.log('   Private Key ID:', serviceAccount.private_key_id);
    } else {
      console.log('\n❌ Service account file not found at:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    }
  } catch (error) {
    console.log('\n❌ Error reading service account file:', error.message);
  }
}

// Check Firebase project configuration
console.log('\n3️⃣ Firebase Project Configuration:');
console.log('   Current project (from .firebaserc): veloz-6efe6');

// Try to get more information about the project
console.log('\n4️⃣ Next Steps:');
console.log('   1. Go to Firebase Console: https://console.firebase.google.com/');
console.log('   2. Select project: veloz-6efe6');
console.log('   3. Go to Storage section');
console.log('   4. Check the bucket name in the URL or settings');
console.log('   5. Verify the service account has Storage Admin permissions');

console.log('\n5️⃣ Alternative: Check your app\'s Firebase config');
console.log('   Look for storageBucket in your Firebase configuration');
console.log('   This is usually in your environment variables or Firebase config file');

console.log('\n💡 If you have images working in your app, the bucket name should be:');
console.log('   - In your NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable');
console.log('   - Or in your Firebase configuration object');
console.log('   - Or visible in the Firebase Console Storage section');

console.log('\n🔧 To fix the service account permissions:');
console.log('   1. Go to Google Cloud Console: https://console.cloud.google.com/');
console.log('   2. Select project: veloz-6efe6');
console.log('   3. Go to IAM & Admin > IAM');
console.log('   4. Find the service account: firebase-adminsdk-fbsvc@veloz-6efe6.iam.gserviceaccount.com');
console.log('   5. Add "Storage Admin" role if not present');
