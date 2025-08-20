# DMARC Configuration Guide for Veloz.com.uy

This guide provides step-by-step instructions for configuring DMARC (Domain-based Message Authentication, Reporting, and Conformance) for your `veloz.com.uy` domain to improve email deliverability and security.

## 🎯 What is DMARC?

DMARC is an email authentication protocol that helps protect your domain from email spoofing and phishing attacks. It works alongside SPF and DKIM to provide comprehensive email security.

## 📋 Prerequisites

Before configuring DMARC, ensure you have:

- [x] Domain: `veloz.com.uy`
- [x] DNS access for your domain
- [x] Email services configured (EmailJS, Resend)
- [x] Admin email for DMARC reports

## 🔧 Step-by-Step Configuration

### Step 1: Configure SPF Record

SPF (Sender Policy Framework) specifies which servers are authorized to send email from your domain.

#### Current Email Services:

- **EmailJS**: Uses your configured email provider (Gmail, Outlook, etc.)
- **Resend**: `contacto@veloz.com.uy` (primary email service)

#### SPF Record Configuration:

Add this TXT record to your DNS:

```
Type: TXT
Name: @ (or veloz.com.uy)
Value: v=spf1 include:_spf.google.com include:_spf.resend.com ~all
TTL: 3600 (or default)
```

**Explanation:**

- `v=spf1` - SPF version 1
- `include:_spf.google.com` - Authorizes Gmail/Google Workspace servers
- `include:_spf.resend.com` - Authorizes Resend email service
- `~all` - Soft fail for unauthorized servers (recommended for initial setup)

### Step 2: Configure DKIM Records

DKIM (DomainKeys Identified Mail) adds a digital signature to your emails.

#### For Resend (Primary Service):

1. **Get DKIM Keys from Resend:**
   - Log into your Resend dashboard
   - Go to Domains → veloz.com.uy
   - Copy the DKIM public key

2. **Add DKIM Record:**
   ```
   Type: TXT
   Name: resend._domainkey
   Value: v=DKIM1; k=rsa; p=YOUR_RESEND_DKIM_PUBLIC_KEY
   TTL: 3600
   ```

#### For Gmail/Google Workspace (if using):

1. **Enable DKIM in Google Workspace:**
   - Go to Google Workspace Admin Console
   - Apps → Gmail → Authenticate email
   - Generate DKIM key

2. **Add DKIM Record:**
   ```
   Type: TXT
   Name: google._domainkey
   Value: v=DKIM1; k=rsa; p=YOUR_GOOGLE_DKIM_PUBLIC_KEY
   TTL: 3600
   ```

### Step 3: Configure DMARC Record

DMARC tells receiving servers what to do with emails that fail authentication.

#### Initial DMARC Record (Monitoring Mode):

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc-reports@veloz.com.uy; ruf=mailto:dmarc-forensic@veloz.com.uy; pct=100; adkim=r; aspf=r;
TTL: 3600
```

**Explanation:**

- `v=DMARC1` - DMARC version 1
- `p=none` - No action taken (monitoring only)
- `rua=mailto:dmarc-reports@veloz.com.uy` - Aggregate reports email
- `ruf=mailto:dmarc-forensic@veloz.com.uy` - Forensic reports email
- `pct=100` - Apply policy to 100% of emails
- `adkim=r` - Relaxed DKIM alignment
- `aspf=r` - Relaxed SPF alignment

#### Production DMARC Record (After Monitoring):

After 2-4 weeks of monitoring, upgrade to:

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@veloz.com.uy; ruf=mailto:dmarc-forensic@veloz.com.uy; pct=100; adkim=r; aspf=r; sp=reject;
TTL: 3600
```

**Explanation:**

- `p=quarantine` - Quarantine emails that fail authentication
- `sp=reject` - Reject emails from subdomains that fail authentication

### Step 4: Set Up DMARC Report Email Addresses

Create email addresses to receive DMARC reports:

1. **Create Forwarding Rules:**
   - `dmarc-reports@veloz.com.uy` → Your admin email
   - `dmarc-forensic@veloz.com.uy` → Your admin email

2. **Or Use Existing Email:**
   - Use `contacto@veloz.com.uy` for reports
   - Update DMARC record accordingly

### Step 5: Verify Configuration

#### Test Your Setup:

1. **SPF Checker:**

   ```bash
   nslookup -type=txt veloz.com.uy
   ```

2. **DMARC Checker:**

   ```bash
   nslookup -type=txt _dmarc.veloz.com.uy
   ```

3. **Online Tools:**
   - [MXToolbox SPF Checker](https://mxtoolbox.com/spf.aspx)
   - [DMARC Analyzer](https://dmarc.postmarkapp.com/)

## 📊 Monitoring and Maintenance

### Initial Monitoring Period (2-4 weeks):

1. **Check DMARC Reports Daily:**
   - Review aggregate reports for authentication failures
   - Identify legitimate senders that need to be added to SPF
   - Monitor for any delivery issues

2. **Common Issues to Watch For:**
   - Legitimate emails being flagged as spam
   - Third-party services not included in SPF
   - DKIM signature failures

### Gradual Policy Enforcement:

1. **Week 1-2:** `p=none` (monitoring only)
2. **Week 3-4:** `p=quarantine; pct=25` (quarantine 25% of failing emails)
3. **Week 5-6:** `p=quarantine; pct=50` (quarantine 50% of failing emails)
4. **Week 7-8:** `p=quarantine; pct=100` (quarantine all failing emails)
5. **Week 9+:** `p=reject` (reject all failing emails)

## 🔧 Integration with Current Email Setup

### EmailJS Configuration:

Your current EmailJS setup will work with DMARC. Ensure:

1. **Email Service Provider is in SPF:**
   - If using Gmail: `include:_spf.google.com`
   - If using Outlook: `include:outlook.com`
   - If using custom SMTP: Add the server's IP range

2. **DKIM Configuration:**
   - Configure DKIM for your email service provider
   - Add the DKIM public key to DNS

### Resend Integration:

Resend already provides DKIM support. Ensure:

1. **Domain Verification:**
   - Verify `veloz.com.uy` in Resend dashboard
   - Add the provided DKIM record to DNS

2. **From Address:**
   - Use `contacto@veloz.com.uy` as the from address
   - This ensures proper alignment with your domain

## 🛠️ Troubleshooting

### Common Issues:

1. **"SPF Record Too Long":**
   - Some DNS providers have TXT record length limits
   - Solution: Use multiple TXT records or shorten includes

2. **"DKIM Signature Failed":**
   - Check DKIM key is properly added to DNS
   - Verify key format and encoding
   - Ensure DNS propagation is complete

3. **"DMARC Policy Too Strict":**
   - Start with `p=none` and gradually increase
   - Monitor reports for legitimate failures
   - Adjust policy based on findings

### Testing Commands:

```bash
# Test SPF
dig TXT veloz.com.uy

# Test DMARC
dig TXT _dmarc.veloz.com.uy

# Test DKIM (replace with your selector)
dig TXT resend._domainkey.veloz.com.uy
```

## 📈 Benefits for Veloz

### Email Deliverability:

- ✅ Improved inbox placement
- ✅ Reduced spam folder delivery
- ✅ Better sender reputation

### Security:

- ✅ Protection against email spoofing
- ✅ Reduced phishing risk
- ✅ Enhanced brand protection

### Analytics:

- ✅ Detailed email authentication reports
- ✅ Visibility into email delivery issues
- ✅ Monitoring of third-party email services

## 🔄 Maintenance Schedule

### Weekly:

- [ ] Review DMARC aggregate reports
- [ ] Check for authentication failures
- [ ] Monitor email delivery rates

### Monthly:

- [ ] Analyze DMARC report trends
- [ ] Update SPF records if needed
- [ ] Review and adjust DMARC policy

### Quarterly:

- [ ] Comprehensive email security audit
- [ ] Update DKIM keys if recommended
- [ ] Review and optimize DMARC policy

## 📞 Support

If you encounter issues with DMARC configuration:

1. **Check DNS Propagation:** Use online tools to verify records
2. **Review Email Service Documentation:** Check Resend and EmailJS docs
3. **Monitor DMARC Reports:** Look for specific failure reasons
4. **Contact DNS Provider:** For DNS-related issues

---

**Note:** This configuration will significantly improve your email deliverability and security. Start with monitoring mode and gradually increase enforcement based on the reports you receive.
