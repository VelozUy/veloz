# 📧 Contact Email System Setup

This document explains how to configure the contact email notification system for the Veloz project.

## 🏗️ System Overview

The contact email system includes:

- **Firestore Trigger**: Automatically triggered when new contact messages are created
- **Admin Email Preferences**: Individual admin users can enable/disable contact notifications
- **Dual Email Services**: Resend (primary) + Nodemailer (fallback) for reliability
- **Rich Email Templates**: Professional HTML emails with client information
- **Error Handling**: Comprehensive logging and fallback mechanisms

## 🔧 Configuration Steps

### 1. Email Service Credentials

Replace the placeholder values with actual credentials:

```bash
# Set Resend API Key (Primary Service)
firebase functions:config:set resend.api_key="re_YOUR_ACTUAL_API_KEY"

# Set SMTP Configuration (Fallback Service)
firebase functions:config:set \
  smtp.host="smtp.gmail.com" \
  smtp.port="587" \
  smtp.user="your-email@veloz.com.uy" \
  smtp.pass="your-app-password"

# Set Default Admin Notification Emails
firebase functions:config:set admin.notification_emails="info@veloz.com.uy,admin@veloz.com.uy"

# Deploy the updated configuration
firebase deploy --only functions
```

### 2. Resend Setup

1. **Create Account**: Sign up at [resend.com](https://resend.com)
2. **Get API Key**: Generate an API key in your Resend dashboard
3. **Verify Domain**: Add and verify your domain (veloz.com.uy)
4. **Update Config**: Replace placeholder with your actual API key

### 3. SMTP Fallback Setup

For Gmail SMTP (recommended fallback):

1. **Enable 2FA**: Enable two-factor authentication on your Gmail account
2. **App Password**: Generate an app-specific password
3. **Update Config**: Use the app password in `smtp.pass`

### 4. Admin Email Preferences

Each admin user has email notification preferences in Firestore:

```typescript
// Admin user document structure
{
  id: "admin_user_id",
  email: "admin@veloz.com.uy",
  name: "Admin Name",
  role: "admin",
  status: "active",
  emailNotifications: {
    contactMessages: true,    // 📧 Contact form notifications
    projectUpdates: false,    // 🎬 Project status updates
    userManagement: false,    // 👥 User management alerts
    systemAlerts: true        // 🚨 System notifications
  },
  // ... other fields
}
```

## 🎯 How It Works

### Contact Form Submission Flow

1. **User Submits Form** → Contact data saved to `contactMessages` collection
2. **Firestore Trigger** → `sendContactEmail` Cloud Function triggered
3. **Admin Query** → Function queries for active admins with `emailNotifications.contactMessages: true`
4. **Email Generation** → Professional HTML email template created with client details
5. **Email Sending** → Attempts Resend first, falls back to Nodemailer if needed
6. **Status Update** → Contact message updated with email delivery status

### Email Template Features

- **Client Information**: Name, email, phone, event details
- **Priority Indicators**: Special highlighting for events with specific dates
- **Quick Actions**: Direct reply links and admin panel shortcuts
- **Professional Design**: Branded email template with gradients and styling
- **Responsive Layout**: Works on desktop and mobile devices

## 🧪 Testing

### 1. Test Email Function

Test the email system manually:

```bash
# Test with specific email
curl -X GET "https://us-central1-veloz-6efe6.cloudfunctions.net/testContactEmail?email=your-test@email.com"

# Test with admin preferences (will query actual admin users)
curl -X GET "https://us-central1-veloz-6efe6.cloudfunctions.net/testContactEmail"
```

### 2. End-to-End Testing

1. **Submit Contact Form** → Use the website contact form
2. **Check Firestore** → Verify document created in `contactMessages`
3. **Check Email** → Verify emails received by admins with notifications enabled
4. **Check Logs** → Review Cloud Function logs for any errors

### 3. Admin Preference Testing

1. **Enable Notifications** → Set `emailNotifications.contactMessages: true` for test admin
2. **Submit Contact** → Test that admin receives email
3. **Disable Notifications** → Set flag to `false`
4. **Submit Contact** → Verify admin does NOT receive email

## 🔍 Monitoring & Debugging

### Cloud Function Logs

View logs in Firebase Console:

```
https://console.firebase.google.com/project/veloz-6efe6/functions/logs
```

### Email Delivery Status

Each contact message includes email status:

```typescript
{
  // Contact message fields...
  emailSent: true,
  emailSentAt: timestamp,
  emailResults: [
    {
      admin: "admin@veloz.com.uy",
      success: true,
      service: "resend"
    }
  ],
  emailError: null  // Only set if all services fail
}
```

### Health Check

Check system status:

```bash
curl "https://us-central1-veloz-6efe6.cloudfunctions.net/healthCheck"
```

## 🚨 Troubleshooting

### Function Won't Deploy

- Check Node.js version compatibility
- Verify Firebase CLI authentication
- Review function logs for syntax errors

### Emails Not Sending

- Verify API keys and SMTP credentials
- Check admin user email preferences
- Review Cloud Function logs
- Test individual email services

### Admin Not Receiving Emails

- Verify `emailNotifications.contactMessages: true`
- Check admin user status is `active`
- Confirm admin email address is valid
- Review function execution logs

## 📋 Configuration Checklist

- [ ] Resend account created and domain verified
- [ ] Resend API key configured in Firebase
- [ ] SMTP credentials configured (Gmail app password)
- [ ] Admin notification emails set as fallback
- [ ] Admin users have email preferences configured
- [ ] Functions deployed successfully
- [ ] Test email function works
- [ ] End-to-end contact form test completed
- [ ] Email templates display correctly
- [ ] Admin preferences system tested

## 🔗 Related Files

- `functions/index.js` - Cloud Functions implementation
- `src/lib/validation-schemas.ts` - Admin user schema with email preferences
- `src/services/` - Frontend contact form integration
- `src/components/forms/ContactForm.tsx` - Contact form component
- `src/app/admin/contacts/page.tsx` - Contact management interface

---

**Need Help?** Check the Firebase Console logs or contact the development team for assistance with email system configuration.
