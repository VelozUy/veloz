# Gmail SMTP Setup Guide for Veloz Contact Forms

This guide explains how to set up Gmail SMTP as a fallback email service for contact form submissions when EmailJS is not configured.

## Overview

The Veloz contact form system has a multi-layered fallback approach:

1. **EmailJS** (primary - requires setup)
2. **Netlify Function with Gmail SMTP** (fallback - this guide)
3. **Next.js API Route** (additional safety)

## Prerequisites

- Gmail account
- 2-Factor Authentication enabled on your Gmail account
- Netlify deployment access

## Step 1: Enable Gmail App Passwords

### 1.1 Enable 2-Factor Authentication

1. Go to [Google Account settings](https://myaccount.google.com/)
2. Navigate to **Security**
3. Enable **2-Step Verification** if not already enabled

### 1.2 Generate App Password

1. In Security settings, find **App passwords**
2. Click **Generate** or **Create app password**
3. Select **Mail** as the app type
4. Choose **Other (Custom name)** and name it "Veloz Contact Form"
5. Click **Generate**
6. **Copy the 16-character password** (you won't see it again)

## Step 2: Configure Netlify Environment Variables

### 2.1 Access Netlify Dashboard

1. Go to your Netlify dashboard
2. Select your Veloz site
3. Navigate to **Site settings** → **Environment variables**

### 2.2 Add Required Variables

Add these environment variables:

```bash
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-character-app-password

# Admin notification emails (comma-separated)
ADMIN_NOTIFICATION_EMAILS=contacto@veloz.com.uy,admin@veloz.com.uy
```

### 2.3 Optional Variables

```bash
# Alternative email service (Resend)
RESEND_API_KEY=your_resend_key

# Additional admin emails
ADMIN_NOTIFICATION_EMAILS=contacto@veloz.com.uy,admin@veloz.com.uy,manager@veloz.com.uy
```

## Step 3: Test the Configuration

### 3.1 Deploy Changes

1. Commit and push your changes to trigger a new deployment
2. Wait for the deployment to complete

### 3.2 Test Email Function

1. Visit your production site
2. Navigate to `/api/test-email`
3. Check the response for success/error messages

### 3.3 Test Contact Form

1. Go to your contact page
2. Fill out and submit the contact form
3. Check if you receive the email notification

## Step 4: Troubleshooting

### 4.1 Common Issues

#### "Authentication failed" error

- Verify your Gmail app password is correct
- Ensure 2-Factor Authentication is enabled
- Check that SMTP_USER is your full Gmail address

#### "Connection timeout" error

- Verify SMTP_HOST is `smtp.gmail.com`
- Check SMTP_PORT is `587`
- Ensure your firewall allows outbound SMTP traffic

#### "No admin recipients" error

- Verify ADMIN_NOTIFICATION_EMAILS is set
- Check email addresses are comma-separated
- Ensure no extra spaces in email addresses

### 4.2 Debug Steps

1. Check Netlify function logs in the dashboard
2. Verify environment variables are set correctly
3. Test with a simple email first
4. Check Gmail's "Less secure app access" settings

## Step 5: Security Considerations

### 5.1 App Password Security

- Never commit app passwords to version control
- Use environment variables only
- Rotate app passwords periodically
- Monitor Gmail account for suspicious activity

### 5.2 Rate Limiting

- Gmail allows up to 500 emails per day
- Monitor usage to avoid hitting limits
- Consider upgrading to Google Workspace for higher limits

### 5.3 Backup Strategy

- Keep EmailJS as primary option
- Monitor email delivery success rates
- Have multiple admin email addresses configured

## Step 6: Monitoring and Maintenance

### 6.1 Email Delivery Monitoring

- Check admin email inboxes regularly
- Monitor Netlify function logs
- Set up email delivery notifications

### 6.2 Regular Maintenance

- Update app passwords every 6 months
- Review admin email list quarterly
- Monitor Gmail account security settings

## Configuration Files

### Netlify Function Configuration

The email function is located at `functions/send-contact-email.js` and automatically uses these environment variables.

### Email Templates

Email templates are defined in the Netlify function and include:

- HTML and text versions
- Professional styling
- Contact form data formatting
- Multi-language support

## Benefits of Gmail SMTP

✅ **Free** - Up to 500 emails per day  
✅ **Reliable** - Google's infrastructure  
✅ **Trusted** - High deliverability rates  
✅ **Easy Setup** - Simple configuration  
✅ **Secure** - App password authentication  
✅ **No Additional Services** - Uses existing Gmail account

## Alternative Email Services

If Gmail SMTP doesn't work for your needs, consider:

### Resend

- Modern email API
- Better deliverability
- More features
- Paid service

### SendGrid

- Enterprise-grade
- Advanced analytics
- High volume support
- Paid service

### Mailgun

- Developer-friendly
- Good documentation
- Flexible pricing
- Paid service

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Netlify function logs
3. Verify environment variable configuration
4. Test with the `/api/test-email` endpoint
5. Contact support with specific error messages

---

_Last updated: 2025-01-27_
_Version: 1.0_
