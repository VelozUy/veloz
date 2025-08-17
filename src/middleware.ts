import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Handle admin routes
  if (pathname.startsWith('/admin')) {
    // Skip login page to avoid redirect loop
    if (pathname === '/admin/login') {
      return response;
    }

    // For all other admin routes, let the client-side handle authentication
    // This prevents SSR issues with Firebase auth
    return response;
  }

  // Performance optimizations for TTFB reduction

  // 1. Add compression headers for all responses
  response.headers.set('Accept-Encoding', 'gzip, deflate, br');

  // 2. Add cache control headers based on route type
  if (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/public/')
  ) {
    // Static assets - aggressive caching
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
    response.headers.set(
      'CDN-Cache-Control',
      'public, max-age=31536000, immutable'
    );
  } else if (pathname.startsWith('/api/')) {
    // API routes - shorter cache for dynamic content
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    response.headers.set(
      'CDN-Cache-Control',
      'public, max-age=300, s-maxage=600'
    );
  } else {
    // HTML pages - moderate caching with revalidation
    response.headers.set(
      'Cache-Control',
      'public, max-age=3600, s-maxage=86400'
    );
    response.headers.set(
      'CDN-Cache-Control',
      'public, max-age=3600, s-maxage=86400'
    );
  }

  // 3. Add performance headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 4. Add preload hints for critical resources on main pages
  if (
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/contact' ||
    pathname === '/our-work'
  ) {
    const preloadLinks = [
      '</redjola/Redjola.otf>; rel=preload; as=font; crossorigin',
      '</Roboto/static/Roboto-Regular.ttf>; rel=preload; as=font; crossorigin',
      '</favicon.svg>; rel=preload; as=image',
    ];
    response.headers.set('Link', preloadLinks.join(', '));
  }

  // 5. Add resource hints for external domains
  const resourceHints = [
    '<https://fonts.googleapis.com>; rel=dns-prefetch',
    '<https://fonts.gstatic.com>; rel=dns-prefetch',
    '<https://www.google-analytics.com>; rel=dns-prefetch',
    '<https://firebasestorage.googleapis.com>; rel=dns-prefetch',
    '<https://storage.googleapis.com>; rel=dns-prefetch',
    '<https://images.unsplash.com>; rel=dns-prefetch',
  ];
  response.headers.set(
    'Link',
    (response.headers.get('Link') || '') + ', ' + resourceHints.join(', ')
  );

  // 6. Add preconnect hints for critical external domains
  const preconnectHints = [
    '<https://fonts.googleapis.com>; rel=preconnect; crossorigin',
    '<https://fonts.gstatic.com>; rel=preconnect; crossorigin',
    '<https://www.google-analytics.com>; rel=preconnect; crossorigin',
    '<https://firebasestorage.googleapis.com>; rel=preconnect; crossorigin',
  ];
  response.headers.set(
    'Link',
    (response.headers.get('Link') || '') + ', ' + preconnectHints.join(', ')
  );

  // 7. Add timing headers for performance monitoring
  response.headers.set('Server-Timing', 'middleware;dur=1');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
