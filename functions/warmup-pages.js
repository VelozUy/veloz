const fetch = require('node-fetch');

// List of pages to warm up after deployment
const PAGES_TO_WARM_UP = [
  '/', // Homepage
  '/about',
  '/contact',
];

// Optional: Add pages with query parameters or dynamic routes
const DYNAMIC_PAGES = [
  // Example: '/our-work/culturales',
  // Example: '/crew/john-doe',
];

exports.handler = async function (event, context) {
  // Only run on deployment success
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const siteUrl = process.env.URL || process.env.DEPLOY_URL;

    if (!siteUrl) {
      console.log('No site URL found, skipping warmup');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No site URL found, skipping warmup' }),
      };
    }

    console.log(`Starting page warmup for: ${siteUrl}`);

    const allPages = [...PAGES_TO_WARM_UP, ...DYNAMIC_PAGES];
    const results = [];

    // Warm up pages concurrently with a limit
    const concurrencyLimit = 5;
    for (let i = 0; i < allPages.length; i += concurrencyLimit) {
      const batch = allPages.slice(i, i + concurrencyLimit);

      const batchPromises = batch.map(async page => {
        const url = `${siteUrl}${page}`;
        const startTime = Date.now();

        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'User-Agent': 'Netlify-Warmup/1.0',
              'Cache-Control': 'no-cache',
            },
            timeout: 30000, // 30 second timeout
          });

          const endTime = Date.now();
          const duration = endTime - startTime;

          return {
            page,
            url,
            status: response.status,
            duration: `${duration}ms`,
            success: response.ok,
          };
        } catch (error) {
          const endTime = Date.now();
          const duration = endTime - startTime;

          return {
            page,
            url,
            status: 'ERROR',
            duration: `${duration}ms`,
            success: false,
            error: error.message,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to avoid overwhelming the server
      if (i + concurrencyLimit < allPages.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Warmup completed: ${successful} successful, ${failed} failed`);
    console.log('Results:', JSON.stringify(results, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Page warmup completed',
        summary: {
          total: results.length,
          successful,
          failed,
        },
        results,
      }),
    };
  } catch (error) {
    console.error('Warmup function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Warmup failed',
        message: error.message,
      }),
    };
  }
};
