# Environment Variables Configuration

This document outlines the environment variables required for the Veloz project deployment.

## Firebase Configuration

The following environment variables are required for Firebase integration:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Admin Configuration
NEXT_PUBLIC_OWNER_EMAIL=your_email@example.com
```

## Local Development

1. Create a `.env.local` file in the root directory
2. Copy the variables above and replace with your Firebase project values
3. The `.env.local` file is already ignored by git for security

## Netlify Deployment

1. In your Netlify dashboard, go to Site settings > Environment variables
2. Add each of the Firebase configuration variables listed above
3. Make sure to use the exact variable names (case-sensitive)
4. The `NEXT_PUBLIC_` prefix is required for client-side access

## Getting Firebase Configuration

1. Go to your Firebase Console
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on the web app configuration icon
6. Copy the config values to the corresponding environment variables

## Google OAuth Setup

To enable Google sign-in for the admin panel:

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable "Google" as a sign-in provider
3. Add your domain to authorized domains
4. For local development, add `localhost` to authorized domains
5. Set the owner email in `NEXT_PUBLIC_OWNER_EMAIL` environment variable

## Admin User System

- The owner email (set in `NEXT_PUBLIC_OWNER_EMAIL`) has permanent access
- All other users must be invited through the admin panel
- Only invited users with active status can sign in
- Users are stored in Firestore collection `adminUsers`

## Security Note

- Never commit actual Firebase credentials to version control
- The `NEXT_PUBLIC_` prefix makes these variables available to the client-side
- Ensure your Firebase security rules are properly configured
