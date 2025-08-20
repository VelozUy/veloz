# Google Workspace DMARC Configuration for Veloz.com.uy

This guide provides step-by-step instructions for configuring DMARC specifically for your Google Workspace account with the `veloz.com.uy` domain.

## 🎯 Overview

Google Workspace provides built-in support for SPF, DKIM, and DMARC configuration. This guide will help you set up proper email authentication to improve deliverability and security.

## 📋 Prerequisites

- [x] Google Workspace account for `veloz.com.uy`
- [x] Admin access to Google Workspace Admin Console
- [x] DNS access for `veloz.com.uy` domain
- [x] Current email: `contacto@veloz.com.uy`

## 🔧 Step-by-Step Configuration

### Step 1: Access Google Workspace Admin Console

1. **Sign in to Admin Console:**
   - Go to [admin.google.com](https://admin.google.com)
   - Sign in with your admin account (`admin@veloz.com.uy` or similar)

2. **Navigate to Gmail Settings:**
   - Apps → Google Workspace → Gmail
   - Click on "User settings" or "Default routing"

### Step 2: Configure SPF Record

Google Workspace automatically provides SPF records for your domain.

#### Current SPF Record (if not already configured):

Add this TXT record to your DNS:

```
Type: TXT
Name: @ (or veloz.com.uy)
Value: v=spf1 include:_spf.google.com ~all
TTL: 3600
```

**Note:** If you're also using Resend for contact forms, use:

```
Value: v=spf1 include:_spf.google.com include:_spf.resend.com ~all
```

### Step 3: Enable DKIM for Google Workspace

1. **In Google Workspace Admin Console:**
   - Go to Apps → Google Workspace → Gmail
   - Click on "Authenticate email"
   - Select your domain: `veloz.com.uy`

2. **Generate DKIM Key:**
   - Click "Generate new record"
   - Choose key length: 2048 bits (recommended)
   - Click "Generate"

3. **Add DKIM Record to DNS:**
   - Copy the provided TXT record
   - Add it to your DNS with the exact selector name provided
   - Example format:

   ```
   Type: TXT
   Name: google._domainkey (or the selector provided)
   Value: v=DKIM1; k=rsa; p=YOUR_GOOGLE_DKIM_PUBLIC_KEY
   TTL: 3600
   ```

4. **Verify DKIM:**
   - Wait 24-48 hours for DNS propagation
   - Return to Admin Console and click "Start authentication"
   - Google will verify the DKIM record

### Step 4: Configure DMARC Record

#### Initial DMARC Record (Monitoring Mode):

Add this TXT record to your DNS:

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc-reports@veloz.com.uy; pct=100; adkim=r; aspf=r;
TTL: 3600
```

**Explanation:**

- `v=DMARC1` - DMARC version 1
- `p=none` - No action taken (monitoring only)
- `rua=mailto:dmarc-reports@veloz.com.uy` - Aggregate reports email
- `pct=100` - Apply policy to 100% of emails
- `adkim=r` - Relaxed DKIM alignment
- `aspf=r` - Relaxed SPF alignment

#### Production DMARC Record (After Monitoring):

After 2-4 weeks of monitoring, upgrade to:

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@veloz.com.uy; pct=100; adkim=r; aspf=r; sp=reject;
TTL: 3600
```

### Step 5: Set Up DMARC Report Email

1. **Create Email Alias:**
   - In Google Workspace Admin Console
   - Go to Directory → Users
   - Add alias: `dmarc-reports@veloz.com.uy` to your admin account

2. **Or Use Existing Email:**
   - Use `contacto@veloz.com.uy` for reports
   - Update DMARC record to use this email

### Step 6: Configure Gmail Authentication Settings

1. **In Google Workspace Admin Console:**
   - Apps → Google Workspace → Gmail
   - Click on "User settings"
   - Scroll to "Authentication"

2. **Enable Authentication Features:**
   - ✅ Enable SPF
   - ✅ Enable DKIM signing
   - ✅ Enable DMARC compliance

3. **Advanced Settings:**
   - Set "Authentication failure action" to "Quarantine" (after monitoring period)
   - Enable "Add authentication headers to outgoing messages"

## 📊 Monitoring and Testing

### Step 1: Verify DNS Records

Use these commands to verify your configuration:

```bash
# Check SPF
nslookup -type=txt veloz.com.uy

# Check DMARC
nslookup -type=txt _dmarc.veloz.com.uy

# Check DKIM (replace with your selector)
nslookup -type=txt google._domainkey.veloz.com.uy
```

### Step 2: Test Email Authentication

1. **Send Test Email:**
   - Send an email from `contacto@veloz.com.uy` to a Gmail account
   - Check the email headers for authentication results

2. **Check Email Headers:**
   - Open the received email in Gmail
   - Click the three dots → "Show original"
   - Look for:
     - `Authentication-Results` header
     - `spf=PASS`
     - `dkim=PASS`
     - `dmarc=PASS`

### Step 3: Monitor DMARC Reports

1. **Check for Reports:**
   - Look for emails from `dmarc-reports@veloz.com.uy`
   - Reports are typically sent daily by major email providers

2. **Analyze Report Data:**
   - Check for authentication failures
   - Identify legitimate senders that need to be added to SPF
   - Monitor for any delivery issues

## 🔧 Integration with Current Setup

### EmailJS Integration:

Since you're using EmailJS for contact forms, ensure:

1. **EmailJS Service Provider:**
   - If using Gmail with EmailJS: Already covered by Google Workspace SPF
   - If using other providers: Add their SPF records

2. **From Address Configuration:**
   - Use `contacto@veloz.com.uy` as the from address
   - This ensures proper alignment with your domain

### Resend Integration:

For your Resend contact form emails:

1. **Add Resend to SPF:**

   ```
   Value: v=spf1 include:_spf.google.com include:_spf.resend.com ~all
   ```

2. **Configure Resend DKIM:**
   - Add Resend's DKIM record alongside Google's
   - Use selector: `resend._domainkey`

## 🛠️ Troubleshooting

### Common Google Workspace Issues:

1. **"DKIM Authentication Failed":**
   - Check DNS propagation (24-48 hours)
   - Verify DKIM key format
   - Ensure selector name matches exactly

2. **"SPF Record Not Found":**
   - Verify SPF record is added to DNS
   - Check for multiple SPF records (only one allowed)
   - Ensure record format is correct

3. **"DMARC Policy Not Applied":**
   - Check DMARC record syntax
   - Verify DNS propagation
   - Ensure `_dmarc` subdomain is correct

### Testing Tools:

1. **Google's Built-in Tools:**
   - Admin Console → Apps → Gmail → Authenticate email
   - Shows DKIM status and provides testing

2. **Online Tools:**
   - [MXToolbox](https://mxtoolbox.com/)
   - [DMARC Analyzer](https://dmarc.postmarkapp.com/)
   - [Google's Email Authentication Checker](https://toolbox.googleapps.com/apps/checkmx/)

## 📈 Benefits for Veloz

### Email Deliverability:

- ✅ Improved inbox placement for Gmail users
- ✅ Better sender reputation with Google
- ✅ Reduced spam folder delivery

### Security:

- ✅ Protection against email spoofing
- ✅ Enhanced brand protection
- ✅ Compliance with email security standards

### Analytics:

- ✅ Detailed authentication reports
- ✅ Visibility into email delivery issues
- ✅ Monitoring of third-party services

## 🔄 Maintenance Schedule

### Weekly:

- [ ] Check DMARC reports in `dmarc-reports@veloz.com.uy`
- [ ] Monitor Gmail delivery rates
- [ ] Review authentication failures

### Monthly:

- [ ] Analyze DMARC report trends
- [ ] Check Google Workspace Admin Console for alerts
- [ ] Review and adjust DMARC policy if needed

### Quarterly:

- [ ] Comprehensive email security audit
- [ ] Update DKIM keys if recommended by Google
- [ ] Review Google Workspace security settings

## 📞 Google Workspace Support

If you encounter issues:

1. **Google Workspace Admin Help:**
   - [admin.google.com](https://admin.google.com) → Help
   - Search for "email authentication" or "DMARC"

2. **Google Workspace Support:**
   - Available if you have a paid Google Workspace plan
   - 24/7 phone and chat support

3. **Community Forums:**
   - [Google Workspace Community](https://support.google.com/a/community)
   - Search for similar issues and solutions

## 🚀 Next Steps

1. **Immediate Actions:**
   - [ ] Add SPF record to DNS
   - [ ] Enable DKIM in Google Workspace Admin Console
   - [ ] Add initial DMARC record (monitoring mode)

2. **After 2-4 Weeks:**
   - [ ] Review DMARC reports
   - [ ] Upgrade to quarantine policy
   - [ ] Monitor for any issues

3. **Long-term:**
   - [ ] Consider upgrading to reject policy
   - [ ] Set up automated report analysis
   - [ ] Regular security audits

---

**Note:** This configuration will significantly improve your email deliverability with Google Workspace. Start with monitoring mode and gradually increase enforcement based on the reports you receive.
