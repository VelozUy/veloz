import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate Netlify deployment hook
    const authHeader = request.headers.get('authorization');
    const deployHookSecret = process.env.NETLIFY_DEPLOY_HOOK_SECRET;

    if (
      deployHookSecret &&
      (!authHeader || authHeader !== `Bearer ${deployHookSecret}`)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get deployment information from request body
    const body = await request.json();
    const { url, deploy_url, site_id, build_id } = body;

    console.log('🚀 Deployment hook triggered:', {
      siteId: site_id,
      buildId: build_id,
      url: url || deploy_url,
      timestamp: new Date().toISOString(),
    });

    // Determine the site URL to warm up
    const siteUrl = url || deploy_url || process.env.URL;

    if (!siteUrl) {
      console.error('No site URL found for warmup');
      return NextResponse.json(
        { error: 'No site URL available' },
        { status: 400 }
      );
    }

    // Trigger warmup asynchronously (don't wait for it to complete)
    warmupPagesAsync(siteUrl);

    return NextResponse.json({
      success: true,
      message: 'Deployment hook processed, warmup initiated',
      siteUrl,
      buildId: build_id,
    });
  } catch (error) {
    console.error('Deployment hook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Asynchronously warm up pages without blocking the response
 */
async function warmupPagesAsync(siteUrl: string) {
  try {
    // Import the warmup function
    const { warmupPages } = await import('../../../scripts/warmup-pages.js');

    // Define pages to warm up
    const pages = [
      '/', // Homepage
      '/about',
      '/contact',
    ];

    console.log(`🔥 Starting async warmup for ${siteUrl}`);

    const result = await warmupPages(siteUrl, pages);

    console.log('✅ Async warmup completed:', {
      successful: result.summary.successful,
      failed: result.summary.failed,
      totalTime: result.summary.totalDuration,
    });
  } catch (error) {
    console.error('❌ Async warmup failed:', error);
  }
}

// Also handle GET requests for testing
export async function GET() {
  return NextResponse.json({
    message: 'Deployment hook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
