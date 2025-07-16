# Build Trigger Feature Setup

This document explains how to set up the build trigger feature that allows admins to trigger new app builds from the admin interface.

## Overview

The build trigger feature allows authenticated admins to trigger new Netlify builds directly from the admin panel. This is useful after updating project content to ensure the static pages are regenerated with the latest data.

## Features

- **Secure API Endpoint**: `/api/trigger-build` with Firebase authentication
- **Netlify Integration**: Triggers builds via Netlify API with cache clearing
- **Admin UI Component**: Button in admin header with real-time status feedback
- **Error Handling**: Comprehensive error handling and user notifications
- **Build Tracking**: Returns build ID and deployment URL for monitoring

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```bash
# Firebase Admin SDK (for API authentication)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Netlify API (for build triggering)
NETLIFY_SITE_ID=your-netlify-site-id
NETLIFY_ACCESS_TOKEN=your-netlify-access-token
```

## Setup Instructions

### 1. Firebase Admin SDK Setup

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file and extract the values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

### 2. Netlify API Setup

1. Go to Netlify Dashboard → Site Settings → API
2. Copy your Site ID → `NETLIFY_SITE_ID`
3. Go to User Settings → Applications → Personal access tokens
4. Create a new token with "Sites" scope → `NETLIFY_ACCESS_TOKEN`

### 3. Netlify Build Hook (Alternative)

If you prefer using build hooks instead of API tokens:

1. Go to Netlify Dashboard → Site Settings → Build & Deploy → Build hooks
2. Create a new build hook
3. Update the API endpoint to use the build hook URL instead

## Usage

### For Admins

1. Log into the admin panel
2. Make changes to projects or content
3. Click the "Trigger New Build" button in the admin header
4. Wait for confirmation that the build was triggered
5. Monitor the build progress in Netlify dashboard

### For Developers

The build trigger is available as a React component:

```tsx
import BuildTrigger from '@/components/admin/BuildTrigger';

// Basic usage
<BuildTrigger />

// With custom styling
<BuildTrigger
  variant="outline"
  size="sm"
  className="custom-class"
/>
```

## API Endpoint

### POST `/api/trigger-build`

**Headers:**

- `Authorization: Bearer <firebase-id-token>`

**Response:**

```json
{
  "success": true,
  "message": "Build triggered successfully",
  "buildId": "build-123",
  "buildUrl": "https://build.netlify.app/build-123",
  "deployUrl": "https://deploy.netlify.app/build-123"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message"
}
```

## Security

- **Authentication**: Uses Firebase ID tokens for user verification
- **Authorization**: Only authenticated users can trigger builds
- **Rate Limiting**: Consider implementing rate limiting for production
- **Audit Logging**: All build triggers are logged with user information

## Troubleshooting

### Common Issues

1. **"Build trigger not configured"**
   - Check that all environment variables are set correctly
   - Verify Firebase Admin SDK credentials
   - Ensure Netlify API token has correct permissions

2. **"Unauthorized - Invalid token"**
   - User must be logged into Firebase Auth
   - Token may have expired, try logging out and back in

3. **"Failed to trigger build"**
   - Check Netlify API token permissions
   - Verify site ID is correct
   - Check Netlify service status

### Debug Steps

1. Check browser console for error messages
2. Verify environment variables in `.env.local`
3. Test Firebase authentication separately
4. Check Netlify API token permissions
5. Monitor Netlify build logs

## Testing

Run the build trigger tests:

```bash
npm test src/services/__tests__/build-trigger.test.ts
```

## Future Enhancements

- [ ] Add build status monitoring
- [ ] Implement build history tracking
- [ ] Add build notification webhooks
- [ ] Create build analytics dashboard
- [ ] Add build rollback functionality
