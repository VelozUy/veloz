# Page Warming Guide

This guide explains how to set up and use the page warming system for your Netlify deployment.

## Overview

Page warming helps improve user experience by pre-loading pages after deployment, reducing cold start times and ensuring faster page loads for your visitors.

## Setup Options

### Option 1: Netlify Functions (Recommended)

The `functions/warmup-pages.js` function automatically runs after deployment to warm up your key pages.

**Setup:**

1. The function is already configured in your `netlify.toml`
2. It will automatically run after successful deployments
3. No additional configuration needed

**Configuration:**
Edit `functions/warmup-pages.js` to customize:

- Pages to warm up
- Concurrency settings
- Timeout values

### Option 2: Manual Script

Use the standalone script for manual warmup or custom automation.

**Usage:**

```bash
# Warm up with specific URL
npm run warmup https://your-site.netlify.app

# Or set environment variable
SITE_URL=https://your-site.netlify.app npm run warmup
```

### Option 3: Deployment Hook API

Use the `/api/deployment-hook` endpoint for custom deployment integrations.

**Setup:**

1. Configure Netlify deployment hook to call your API
2. Set `NETLIFY_DEPLOY_HOOK_SECRET` environment variable
3. The API will trigger warmup after deployment

## Configuration

### Environment Variables

Add these to your Netlify environment variables:

```bash
# For deployment hook authentication
NETLIFY_DEPLOY_HOOK_SECRET=your-secret-here

# For manual warmup
SITE_URL=https://your-site.netlify.app
```

### Customizing Pages to Warm Up

Edit the pages array in your chosen method:

```javascript
const PAGES_TO_WARM_UP = [
  '/', // Homepage (highest priority)
  '/about', // About page
  '/contact', // Contact page
];
```

### Dynamic Pages

The system can automatically load dynamic pages from your data files:

```javascript
// Pages will be loaded from:
// - src/data/content-projects.json
// - src/data/content-crew.json
// - Add more files as needed
```

## Performance Settings

### Concurrency

- **Default:** 3 concurrent requests
- **Adjust:** Change `concurrencyLimit` in the script
- **Recommendation:** 3-5 for most sites

### Timeouts

- **Default:** 30 seconds per page
- **Adjust:** Change `timeout` value
- **Recommendation:** 30-60 seconds

### Batch Delays

- **Default:** 2 seconds between batches
- **Adjust:** Change `delayBetweenBatches`
- **Purpose:** Prevents overwhelming the server

## Monitoring

### Logs

All warmup activities are logged to:

- Netlify function logs
- Console output (for manual runs)
- API response data

### Metrics

The system tracks:

- Success/failure rates
- Response times
- Page sizes
- Total warmup duration

### Example Output

```
🚀 Starting page warmup for 3 pages
📍 Base URL: https://your-site.netlify.app
⚡ Concurrency: 3
⏱️  Timeout: 30000ms
────────────────────────────────────────────

📦 Batch 1/3
🔥 Warming up: /
✅ / - 245ms (156KB)
🔥 Warming up: /about
✅ /about - 189ms (142KB)
🔥 Warming up: /contact
✅ /contact - 203ms (98KB)

📊 WARMUP SUMMARY
────────────────────────────────────────────
✅ Successful: 3/3
❌ Failed: 0/3
⏱️  Total time: 2847ms
📈 Average per page: 406ms
```

## Troubleshooting

### Common Issues

**1. Function Not Running**

- Check Netlify function logs
- Verify `netlify.toml` configuration
- Ensure function is in correct directory

**2. Pages Failing to Load**

- Check site URL configuration
- Verify pages exist
- Check for authentication requirements

**3. Timeout Errors**

- Increase timeout value
- Reduce concurrency
- Check server performance

**4. Dynamic Pages Not Loading**

- Verify data files exist
- Check file structure
- Ensure slugs are properly formatted

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG_WARMUP=true
```

## Best Practices

### 1. Prioritize Important Pages

- Homepage should always be first
- Focus on high-traffic pages
- Include critical user journey pages

### 2. Monitor Performance

- Track warmup success rates
- Monitor response times
- Adjust settings based on results

### 3. Test Regularly

- Test warmup after deployments
- Verify all pages load correctly
- Check for new dynamic content

### 4. Optimize Settings

- Start with conservative concurrency
- Increase gradually based on performance
- Monitor server resources

## Integration Examples

### GitHub Actions

```yaml
- name: Warm up pages
  run: |
    npm run warmup ${{ secrets.SITE_URL }}
  if: success()
```

### Netlify Build Hook

```bash
curl -X POST https://your-site.netlify.app/api/deployment-hook \
  -H "Authorization: Bearer $NETLIFY_DEPLOY_HOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-site.netlify.app"}'
```

### Custom Automation

```javascript
const { warmupPages } = require('./scripts/warmup-pages.js');

// Custom warmup logic
async function customWarmup() {
  const pages = ['/', '/about', '/contact'];
  await warmupPages('https://your-site.netlify.app', pages);
}
```

## Security Considerations

### Authentication

- Use deployment hook secrets
- Validate request sources
- Limit API access

### Rate Limiting

- Respect server limits
- Use appropriate delays
- Monitor for abuse

### Error Handling

- Graceful failure handling
- Log security events
- Don't expose sensitive data

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review Netlify function logs
3. Test with manual warmup script
4. Verify configuration settings
