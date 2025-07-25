#!/usr/bin/env node

/**
 * Environment Setup Script
 * 
 * This script helps users set up their environment variables for the Veloz project.
 * It creates a .env.local file with placeholder values that users can fill in.
 */

const fs = require('fs');
const path = require('path');

const envTemplate = `# Firebase Configuration
# Replace these placeholder values with your actual Firebase project configuration
# You can find these values in your Firebase Console: https://console.firebase.google.com/

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Owner email for admin access
NEXT_PUBLIC_OWNER_EMAIL=your_admin_email@example.com

# Note: This file is for local development only
# For production, set these environment variables in your hosting platform
`;

function setupEnvironment() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Skipping creation.');
    console.log('📝 Please update your existing .env.local file with the required variables.');
    return;
  }

  try {
    // Create .env.local file
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env.local file with template values');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Go to your Firebase Console: https://console.firebase.google.com/');
    console.log('2. Select your project (or create a new one)');
    console.log('3. Go to Project Settings (gear icon)');
    console.log('4. Scroll down to "Your apps" section');
    console.log('5. Click "Add app" and select Web');
    console.log('6. Register your app and copy the configuration values');
    console.log('7. Replace the placeholder values in .env.local with your actual Firebase config');
    console.log('8. Set up Authentication with Google sign-in in Firebase Console');
    console.log('9. Create adminUsers collection in Firestore with your email');
    console.log('');
    console.log('📚 For detailed instructions, see: docs/ENVIRONMENT.md');
    console.log('');
    console.log('🚀 After setup, run: npm run dev');
  } catch (error) {
    console.error('❌ Error creating .env.local file:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupEnvironment(); 