import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the Firebase token
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin (you can add more specific checks here)
    if (!decodedToken.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid user' },
        { status: 401 }
      );
    }

    // Get Netlify configuration
    const netlifySiteId = process.env.NETLIFY_SITE_ID;
    const netlifyAccessToken = process.env.NETLIFY_ACCESS_TOKEN;

    if (!netlifySiteId || !netlifyAccessToken) {
      console.error('Missing Netlify configuration');
      return NextResponse.json(
        { error: 'Build trigger not configured' },
        { status: 500 }
      );
    }

    // Trigger Netlify build
    const buildResponse = await fetch(
      `https://api.netlify.com/api/v1/sites/${netlifySiteId}/builds`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${netlifyAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clear_cache: 'true', // Clear cache to ensure fresh build
        }),
      }
    );

    if (!buildResponse.ok) {
      const errorText = await buildResponse.text();
      console.error('Netlify build trigger failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to trigger build' },
        { status: 500 }
      );
    }

    const buildData = await buildResponse.json();

    console.log(`Build triggered successfully by ${decodedToken.email}`, {
      buildId: buildData.id,
      buildUrl: buildData.deploy_url,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Build triggered successfully',
      buildId: buildData.id,
      buildUrl: buildData.deploy_url,
      deployUrl: buildData.deploy_url,
    });
  } catch (error) {
    console.error('Error triggering build:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
