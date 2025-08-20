#!/usr/bin/env node

/**
 * Domain Configuration Test Script
 * Tests both www.veloz.com.uy and veloz.com.uy to identify issues
 */

const https = require('https');
const http = require('http');

const domains = ['www.veloz.com.uy', 'veloz.com.uy'];

const protocols = ['https', 'http'];

async function testDomain(protocol, domain, path = '/') {
  return new Promise(resolve => {
    const url = `${protocol}://${domain}${path}`;
    const client = protocol === 'https' ? https : http;

    const req = client.get(url, { timeout: 10000 }, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        resolve({
          domain,
          protocol,
          url,
          statusCode: res.statusCode,
          headers: res.headers,
          redirectLocation: res.headers.location,
          success: res.statusCode >= 200 && res.statusCode < 400,
        });
      });
    });

    req.on('error', error => {
      resolve({
        domain,
        protocol,
        url,
        error: error.message,
        success: false,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        domain,
        protocol,
        url,
        error: 'Request timeout',
        success: false,
      });
    });
  });
}

async function runTests() {
  console.log('🔍 Testing Veloz Domain Configuration...\n');

  const results = [];

  for (const protocol of protocols) {
    for (const domain of domains) {
      console.log(`Testing ${protocol}://${domain}...`);
      const result = await testDomain(protocol, domain);
      results.push(result);

      if (result.success) {
        console.log(`✅ ${result.url} - Status: ${result.statusCode}`);
        if (result.redirectLocation) {
          console.log(`   ↪️  Redirects to: ${result.redirectLocation}`);
        }
      } else {
        console.log(`❌ ${result.url} - Error: ${result.error}`);
      }
      console.log('');
    }
  }

  console.log('📊 Test Results Summary:');
  console.log('========================');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}\n`);

  if (failed.length > 0) {
    console.log('❌ Failed Tests:');
    failed.forEach(result => {
      console.log(`   - ${result.url}: ${result.error}`);
    });
    console.log('');
  }

  if (successful.length > 0) {
    console.log('✅ Successful Tests:');
    successful.forEach(result => {
      console.log(`   - ${result.url} (${result.statusCode})`);
      if (result.redirectLocation) {
        console.log(`     ↪️  → ${result.redirectLocation}`);
      }
    });
    console.log('');
  }

  // Check for redirect patterns
  const redirects = results.filter(r => r.redirectLocation);
  if (redirects.length > 0) {
    console.log('🔄 Redirect Analysis:');
    redirects.forEach(result => {
      console.log(`   ${result.url} → ${result.redirectLocation}`);
    });
    console.log('');
  }

  // Recommendations
  console.log('💡 Recommendations:');

  const wwwHttps = results.find(
    r => r.domain === 'www.veloz.com.uy' && r.protocol === 'https'
  );
  const nonWwwHttps = results.find(
    r => r.domain === 'veloz.com.uy' && r.protocol === 'https'
  );

  if (wwwHttps?.success && !nonWwwHttps?.success) {
    console.log(
      '   ⚠️  Non-www domain is not working. Check Netlify domain configuration.'
    );
    console.log(
      '   📝 Ensure veloz.com.uy is added as a custom domain in Netlify.'
    );
    console.log(
      '   🔧 Add redirect rules in netlify.toml to redirect non-www to www.'
    );
  } else if (wwwHttps?.success && nonWwwHttps?.success) {
    console.log('   ✅ Both domains are working correctly.');
  } else if (!wwwHttps?.success) {
    console.log('   ❌ www domain is not working. Check Netlify deployment.');
  }

  console.log('\n🔧 Next Steps:');
  console.log('   1. Check Netlify domain settings');
  console.log('   2. Verify DNS records');
  console.log('   3. Ensure SSL certificates are provisioned');
  console.log('   4. Test redirect rules after deployment');
}

// Run the tests
runTests().catch(console.error);
