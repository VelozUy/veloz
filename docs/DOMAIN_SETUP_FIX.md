# 🔧 Domain Setup Fix - Veloz.com.uy

## 🚨 Current Issue

- ✅ `www.veloz.com.uy` - Working correctly
- ❌ `veloz.com.uy` - SSL certificate error (TLS internal error)

## 🔍 Root Cause Analysis

The issue is that only the `www` subdomain has been properly configured in Netlify, while the apex domain (`veloz.com.uy`) lacks proper SSL certificate configuration.

## 🛠️ Solution Steps

### 1. Netlify Domain Configuration

#### Step 1: Add Custom Domain

1. Go to your Netlify dashboard
2. Navigate to **Site settings** → **Domain management**
3. Click **Add custom domain**
4. Add `veloz.com.uy` (without www)
5. Click **Verify** to check DNS configuration

#### Step 2: Configure Domain Settings

1. In the domain settings for `veloz.com.uy`:
   - Enable **HTTPS**
   - Set **Force HTTPS** to **Yes**
   - Enable **Automatic TLS certificates**

#### Step 3: Set Primary Domain

1. Set `www.veloz.com.uy` as the **Primary domain**
2. This ensures proper redirects and SEO benefits

### 2. DNS Configuration

#### Required DNS Records

Ensure these records are configured in your domain registrar:

```dns
# Apex domain (veloz.com.uy)
A     veloz.com.uy    75.2.60.5

# www subdomain
CNAME  www.veloz.com.uy    your-site-name.netlify.app

# Netlify verification (if needed)
TXT    veloz.com.uy        netlify-site-verification=your-verification-code
```

#### DNS Verification

```bash
# Check A record
dig veloz.com.uy A

# Check CNAME record
dig www.veloz.com.uy CNAME

# Check if pointing to Netlify
dig veloz.com.uy +short
dig www.veloz.com.uy +short
```

### 3. Netlify Redirect Configuration

The `netlify.toml` file has been updated with proper redirect rules:

```toml
# Redirect non-www to www for SEO and consistency
[[redirects]]
  from = "https://veloz.com.uy/*"
  to = "https://www.veloz.com.uy/:splat"
  status = 301
  force = true

# Redirect HTTP to HTTPS
[[redirects]]
  from = "http://veloz.com.uy/*"
  to = "https://www.veloz.com.uy/:splat"
  status = 301
  force = true

[[redirects]]
  from = "http://www.veloz.com.uy/*"
  to = "https://www.veloz.com.uy/:splat"
  status = 301
  force = true
```

### 4. SSL Certificate Provisioning

#### Automatic SSL (Recommended)

1. Netlify automatically provisions SSL certificates
2. Wait 24-48 hours for certificate generation
3. Monitor the **HTTPS** status in domain settings

#### Manual SSL (If needed)

1. Go to **Site settings** → **HTTPS**
2. Click **Verify DNS configuration**
3. If issues persist, contact Netlify support

### 5. Testing and Verification

#### Run Domain Test

```bash
node scripts/test-domain-config.js
```

#### Expected Results After Fix

```
✅ https://www.veloz.com.uy/ - Status: 200
✅ https://veloz.com.uy/ - Status: 301 (redirects to www)
✅ http://www.veloz.com.uy/ - Status: 301 (redirects to https)
✅ http://veloz.com.uy/ - Status: 301 (redirects to https)
```

#### Manual Testing

1. Visit `https://veloz.com.uy` - should redirect to `https://www.veloz.com.uy`
2. Visit `http://veloz.com.uy` - should redirect to `https://www.veloz.com.uy`
3. Visit `http://www.veloz.com.uy` - should redirect to `https://www.veloz.com.uy`

### 6. SEO Considerations

#### Canonical URLs

The site will use `www.veloz.com.uy` as the canonical domain:

- All internal links use `www.veloz.com.uy`
- Search engines will index `www.veloz.com.uy`
- Non-www URLs redirect to www for consistency

#### Sitemap and Robots

- Sitemap: `https://www.veloz.com.uy/sitemap.xml`
- Robots: `https://www.veloz.com.uy/robots.txt`

### 7. Monitoring

#### SSL Certificate Status

- Monitor SSL certificate expiration
- Check HTTPS status in Netlify dashboard
- Set up SSL certificate renewal notifications

#### Domain Health

- Regular domain testing with the provided script
- Monitor redirect chains and response times
- Check for any SSL/TLS errors

## 🚀 Deployment

### Trigger New Deployment

After making DNS changes:

1. **Wait for DNS propagation** (up to 48 hours)
2. **Trigger a new Netlify deployment**:

   ```bash
   # Push changes to trigger deployment
   git add .
   git commit -m "Fix domain configuration and redirects"
   git push
   ```

3. **Monitor deployment** in Netlify dashboard
4. **Test domains** after deployment completes

### Verification Checklist

- [ ] DNS records properly configured
- [ ] SSL certificate provisioned for both domains
- [ ] Redirects working correctly
- [ ] No SSL/TLS errors
- [ ] All pages accessible via www domain
- [ ] Non-www domain redirects to www
- [ ] HTTP redirects to HTTPS

## 🔧 Troubleshooting

### Common Issues

#### SSL Certificate Not Provisioned

- Wait 24-48 hours for automatic provisioning
- Check DNS configuration is correct
- Verify domain is added to Netlify

#### Redirect Loop

- Check `netlify.toml` redirect rules
- Ensure no conflicting redirects
- Test with browser developer tools

#### DNS Not Propagated

- Use `dig` or `nslookup` to check DNS
- Wait up to 48 hours for full propagation
- Check with different DNS servers

### Support Resources

- [Netlify Domain Management](https://docs.netlify.com/domains-https/custom-domains/)
- [Netlify SSL/TLS](https://docs.netlify.com/domains-https/https-ssl/)
- [Netlify Redirects](https://docs.netlify.com/routing/redirects/)

## 📞 Next Steps

1. **Immediate**: Add `veloz.com.uy` as custom domain in Netlify
2. **Short-term**: Configure DNS records and wait for SSL
3. **Long-term**: Monitor domain health and performance

---

**Last Updated**: 2025-01-27  
**Status**: In Progress  
**Priority**: High
