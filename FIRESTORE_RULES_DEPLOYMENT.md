# 🔒 Firestore Security Rules Deployment

## Overview

This document explains how to deploy the production-ready Firestore security rules for the Veloz project.

## Security Architecture

### Collections Structure

1. **`adminUsers`** - Stores admin user permissions
   - Key: user email address
   - Contains: `{ status: 'active'|'inactive', invitedBy: string, invitedAt: timestamp }`

2. **`projects`** - Main project data
   - Public read for published projects
   - Admin-only write access
   - Subcollection: `projectMedia` for photos/videos

3. **`homepage`** - Homepage content
   - Public read access
   - Admin-only write access

4. **`pages`** - Static page content
   - Public read access
   - Admin-only write access

5. **`faqs`** - Frequently asked questions
   - Public read access
   - Admin-only write access

### Access Control

- **Public Users**: Can read published content and submit contact forms
- **Admin Users**: Full CRUD access to all content after authentication
- **Owner**: Special access defined by `NEXT_PUBLIC_OWNER_EMAIL`

## Deployment Steps

### 1. Via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your Veloz project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

### 2. Via Firebase CLI (Alternative)

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules,storage
```

## Security Features

### ✅ What's Protected

- **Authentication Required**: All write operations require authenticated admin users
- **Role-Based Access**: Only users in `adminUsers` collection can modify content
- **Status Checking**: Only active admin users can perform operations
- **Public Content**: Only published projects are visible to public
- **File Uploads**: Organized by collection with proper access controls

### ⚠️ Important Notes

1. **Owner Email**: Set `NEXT_PUBLIC_OWNER_EMAIL` environment variable for owner access
2. **Admin Bootstrapping**: The first admin user needs to be added manually via Firebase Console
3. **Testing**: Use the debug page at `/debug/firebase` to test rules after deployment

## Rule Validation

After deploying, test the rules using the built-in diagnostics:

1. Visit `/debug/firebase` in your admin panel
2. Click "Check Security Rules"
3. Verify all tests pass
4. Check for any permission issues

## Common Issues & Solutions

### Issue: "Missing or insufficient permissions"

**Solution**: Ensure the user is in the `adminUsers` collection with `status: 'active'`

### Issue: "Function get() requires authentication"

**Solution**: User must be logged in via Firebase Auth before accessing admin functions

### Issue: "Public can't read published content"

**Solution**: Check that the document has `status: 'published'` field

## Development vs Production

- **Development**: Use permissive rules for testing (already implemented in codebase)
- **Production**: Use these strict rules for security

## Manual Admin User Setup

If you need to add the first admin user manually:

1. Go to Firebase Console → Firestore Database
2. Create collection: `adminUsers`
3. Add document with ID as email address:
   ```json
   {
     "status": "active",
     "invitedBy": "system",
     "invitedAt": [current timestamp]
   }
   ```

## Backup Strategy

Before deploying:

1. Export current rules: Firebase Console → Rules → Copy current rules
2. Save as backup file
3. Test new rules on development environment first

---

**⚠️ Critical**: Always test rules in development before deploying to production!
