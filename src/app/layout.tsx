import type { Metadata } from 'next';
import { Geist, Geist_Mono, Bebas_Neue, Oswald } from 'next/font/google';
import './globals.css';
import '@/lib/emergency-console-fix';
import { ConditionalNavigation, PageLayout } from '@/components/layout';
import { NavigationProvider } from '@/components/layout/NavigationProvider';
import { AnalyticsWrapper } from '@/components/analytics';
import {
  StructuredData,
  organizationData,
} from '@/components/seo/StructuredData';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import { ServiceWorkerRegistration } from '@/components/performance/ServiceWorkerRegistration';
import { PerformanceOptimizer } from '@/components/performance/PerformanceOptimizer';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { QRCodeTracker } from '@/components/QRCodeTracker';
import { Toaster } from 'sonner';
import { initCrossBrowserTesting } from '@/lib/cross-browser-testing';
import { initMobileResponsivenessTesting } from '@/lib/mobile-responsiveness-testing';
import { initAccessibilityTesting } from '@/lib/accessibility-testing';
import { initializeTBTOptimizations } from '@/lib/tbt-optimization';
import { initializeSpeedIndexOptimizations } from '@/lib/speed-index-optimization';
import { initializePerformanceMonitoring } from '@/lib/performance-monitoring';
import { initializeLCPImageOptimization } from '@/lib/lcp-image-optimization';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import HomepageBodyClass from '@/components/layout/HomepageBodyClass';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Only load fonts needed for main site (logo fallbacks)
const bebasNeue = Bebas_Neue({
  variable: '--font-bebas-neue',
  weight: ['400'],
  subsets: ['latin'],
});

const oswald = Oswald({
  variable: '--font-oswald',
  weight: ['400'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Veloz - Professional Event Photography & Videography',
    template: '%s | Veloz',
  },
  description:
    'Professional event photography and videography with our unique team-based production model. Experience excellence, warmth, and agility in every shot.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  keywords: [
    'event photography',
    'event videography',
    'wedding photography',
    'corporate events',
    'professional photography',
    'Uruguay photography',
    'Montevideo events',
    'team photography',
    'event coverage',
    'professional videography',
  ],
  authors: [{ name: 'Veloz Team' }],
  creator: 'Veloz',
  publisher: 'Veloz',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'https://veloz.com.uy'
  ),
  alternates: {
    canonical: '/',
    languages: {
      en: '/en',
      es: '/',
      pt: '/pt',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_UY',
    url: '/',
    siteName: 'Veloz',
    title: 'Veloz - Professional Event Photography & Videography',
    description:
      'Professional event photography and videography with our unique team-based production model. Experience excellence, warmth, and agility in every shot.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Veloz - Professional Event Photography & Videography',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veloz - Professional Event Photography & Videography',
    description:
      'Professional event photography and videography with our unique team-based production model. Experience excellence, warmth, and agility in every shot.',
    images: ['/twitter-image.jpg'],
    creator: '@veloz_uy',
    site: '@veloz_uy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize cross-browser, mobile, and accessibility testing in development
  if (typeof window !== 'undefined') {
    initCrossBrowserTesting();
    initMobileResponsivenessTesting();
    initAccessibilityTesting();
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* DNS Prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />

        {/* Preconnect to external domains */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://www.google-analytics.com"
          crossOrigin="anonymous"
        />

        {/* Preload critical LCP images - Optimized for sub-2.5s LCP */}
        <link
          rel="preload"
          href="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=300&fit=crop&q=50&fm=webp"
          as="image"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=300&fit=crop&q=50&fm=webp"
          as="image"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300&h=300&fit=crop&q=50&fm=webp"
          as="image"
          fetchPriority="high"
        />
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/redjola/Redjola.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/Roboto/Roboto-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        
        {/* Preload critical CSS */}
        <link
          rel="preload"
          href="/globals.css"
          as="style"
        />
        
        {/* DNS prefetch and preconnect for external resources */}
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//storage.googleapis.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://storage.googleapis.com" crossOrigin="anonymous" />

        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="hsl(var(--background))" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Veloz" />
        <link rel="apple-touch-icon" href="/favicon.svg" />

        {/* Immediate homepage class application */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Apply homepage class immediately if on homepage
              if (window.location.pathname === '/') {
                document.documentElement.classList.add('homepage');
                document.body.classList.add('homepage');
              }
            `,
          }}
        />

        {/* Global performance optimization functions */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Make optimization functions globally available
              window.initializeTBTOptimizations = ${initializeTBTOptimizations.toString()};
              window.initializeSpeedIndexOptimizations = ${initializeSpeedIndexOptimizations.toString()};
              window.initializePerformanceMonitoring = ${initializePerformanceMonitoring.toString()};
            `,
          }}
        />
        
        {/* Initialize critical optimizations immediately */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize critical optimizations immediately
              if (typeof window !== 'undefined') {
                // Initialize Speed Index optimizations immediately for better LCP
                if (typeof window.initializeSpeedIndexOptimizations === 'function') {
                  window.initializeSpeedIndexOptimizations();
                }
                
                // Defer non-critical optimizations
                if ('requestIdleCallback' in window) {
                  window.requestIdleCallback(function() {
                    // Initialize TBT optimizations
                    if (typeof window.initializeTBTOptimizations === 'function') {
                      window.initializeTBTOptimizations();
                    }
                    
                    // Initialize performance monitoring
                    if (typeof window.initializePerformanceMonitoring === 'function') {
                      window.initializePerformanceMonitoring();
                    }
                  }, { timeout: 1000 });
                } else {
                  setTimeout(function() {
                    // Initialize TBT optimizations
                    if (typeof window.initializeTBTOptimizations === 'function') {
                      window.initializeTBTOptimizations();
                    }
                    
                    // Initialize performance monitoring
                    if (typeof window.initializePerformanceMonitoring === 'function') {
                      window.initializePerformanceMonitoring();
                    }
                  }, 1000);
                }
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${oswald.variable} antialiased`}
      >
        <StructuredData type="organization" data={organizationData} />
        <PerformanceMonitor />
        <ServiceWorkerRegistration />
        <PerformanceOptimizer />
        <Suspense fallback={null}>
          <QRCodeTracker />
        </Suspense>
        <Toaster />
        <ErrorBoundary>
          <AnalyticsWrapper>
            <NavigationProvider>
              <HomepageBodyClass />
              <ConditionalNavigation />
              <PageLayout>{children}</PageLayout>
            </NavigationProvider>
          </AnalyticsWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
