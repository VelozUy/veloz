#!/usr/bin/env node

/**
 * Domain SSL Fix Script
 * Diagnoses and provides solutions for SSL certificate issues
 */

const https = require('https');
const tls = require('tls');

async function checkSSL(hostname, port = 443) {
  return new Promise(resolve => {
    const options = {
      hostname,
      port,
      servername: hostname,
      rejectUnauthorized: false,
      timeout: 10000,
    };

    const req = https.request(options, res => {
      const cert = res.socket.getPeerCertificate();
      resolve({
        hostname,
        statusCode: res.statusCode,
        certificate: {
          subject: cert.subject,
          issuer: cert.issuer,
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          serialNumber: cert.serialNumber,
        },
        headers: res.headers,
        success: true,
      });
    });

    req.on('error', error => {
      resolve({
        hostname,
        error: error.message,
        code: error.code,
        success: false,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        hostname,
        error: 'Request timeout',
        success: false,
      });
    });

    req.end();
  });
}

async function checkTLSConnection(hostname, port = 443) {
  return new Promise(resolve => {
    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname,
        rejectUnauthorized: false,
        timeout: 10000,
      },
      () => {
        const cert = socket.getPeerCertificate();
        const info = socket.getProtocol();
        socket.end();

        resolve({
          hostname,
          protocol: info,
          certificate: {
            subject: cert.subject,
            issuer: cert.issuer,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
          },
          success: true,
        });
      }
    );

    socket.on('error', error => {
      resolve({
        hostname,
        error: error.message,
        code: error.code,
        success: false,
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        hostname,
        error: 'Connection timeout',
        success: false,
      });
    });
  });
}

async function runDiagnostics() {
  console.log('🔍 SSL Certificate Diagnostics for Veloz.com.uy\n');

  const domains = ['www.veloz.com.uy', 'veloz.com.uy'];

  for (const domain of domains) {
    console.log(`\n📋 Testing ${domain}:`);
    console.log('='.repeat(50));

    // Test HTTPS request
    console.log('\n1️⃣ HTTPS Request Test:');
    const httpsResult = await checkSSL(domain);
    if (httpsResult.success) {
      console.log(`   ✅ HTTPS working - Status: ${httpsResult.statusCode}`);
      console.log(`   📜 Certificate: ${httpsResult.certificate.subject.CN}`);
      console.log(`   🏢 Issuer: ${httpsResult.certificate.issuer.CN}`);
      console.log(`   📅 Valid until: ${httpsResult.certificate.validTo}`);
    } else {
      console.log(`   ❌ HTTPS failed: ${httpsResult.error}`);
      if (httpsResult.code) {
        console.log(`   🔍 Error code: ${httpsResult.code}`);
      }
    }

    // Test TLS connection
    console.log('\n2️⃣ TLS Connection Test:');
    const tlsResult = await checkTLSConnection(domain);
    if (tlsResult.success) {
      console.log(`   ✅ TLS working - Protocol: ${tlsResult.protocol}`);
      console.log(`   📜 Certificate: ${tlsResult.certificate.subject.CN}`);
      console.log(`   🏢 Issuer: ${tlsResult.certificate.issuer.CN}`);
    } else {
      console.log(`   ❌ TLS failed: ${tlsResult.error}`);
      if (tlsResult.code) {
        console.log(`   🔍 Error code: ${tlsResult.code}`);
      }
    }
  }

  console.log('\n\n🔧 Diagnosis Summary:');
  console.log('===================');

  const wwwHttps = await checkSSL('www.veloz.com.uy');
  const apexHttps = await checkSSL('veloz.com.uy');

  if (wwwHttps.success && !apexHttps.success) {
    console.log('🚨 ISSUE IDENTIFIED: Apex domain SSL certificate problem');
    console.log('\n💡 SOLUTION:');
    console.log(
      '   1. Go to Netlify Dashboard → Site Settings → Domain Management'
    );
    console.log('   2. Add "veloz.com.uy" as a custom domain');
    console.log('   3. Enable HTTPS and Force HTTPS');
    console.log('   4. Wait 24-48 hours for SSL certificate provisioning');
    console.log(
      '   5. The redirect rules in netlify.toml will handle redirects'
    );
  } else if (wwwHttps.success && apexHttps.success) {
    console.log('✅ Both domains working correctly');
  } else if (!wwwHttps.success) {
    console.log('❌ WWW domain also has issues - check Netlify deployment');
  }

  console.log('\n📋 Next Steps:');
  console.log('   1. Add apex domain to Netlify');
  console.log('   2. Configure SSL certificate');
  console.log('   3. Test redirects after deployment');
  console.log('   4. Run: node scripts/test-domain-config.js');
}

// Run diagnostics
runDiagnostics().catch(console.error);
