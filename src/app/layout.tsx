import type { Metadata } from 'next';
import {
  Geist,
  Geist_Mono,
  Inter,
  Roboto,
  Open_Sans,
  Poppins,
  Playfair_Display,
  Cormorant_Garamond,
  Cinzel,
  Libre_Baskerville,
  Montserrat,
  Raleway,
  Quicksand,
  Nunito,
  Oswald,
  Anton,
  Bebas_Neue,
  Lato,
  Source_Sans_3,
  Ubuntu,
  Work_Sans,
} from 'next/font/google';
import './globals.css';
import '@/lib/emergency-console-fix';
import { ConditionalNavigation, PageLayout } from '@/components/layout';
import { AnalyticsWrapper } from '@/components/analytics';
import {
  StructuredData,
  organizationSchema,
} from '@/components/seo/StructuredData';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { QRCodeTracker } from '@/components/QRCodeTracker';
import { Toaster } from 'sonner';
import { initCrossBrowserTesting } from '@/lib/cross-browser-testing';
import { initMobileResponsivenessTesting } from '@/lib/mobile-responsiveness-testing';
import { initAccessibilityTesting } from '@/lib/accessibility-testing';
import { Suspense } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Initialize all Google Fonts for the title editor
const inter = Inter({
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
const roboto = Roboto({
  variable: '--font-roboto',
  weight: ['400', '500', '700'],
  subsets: ['latin'],
});
const openSans = Open_Sans({
  variable: '--font-open-sans',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
const poppins = Poppins({
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-cormorant',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
const cinzel = Cinzel({
  variable: '--font-cinzel',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
const libreBaskerville = Libre_Baskerville({
  variable: '--font-libre-baskerville',
  weight: ['400', '700'],
  subsets: ['latin'],
});
const montserrat = Montserrat({
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
const raleway = Raleway({
  variable: '--font-raleway',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
const quicksand = Quicksand({
  variable: '--font-quicksand',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
const nunito = Nunito({
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
const oswald = Oswald({
  variable: '--font-oswald',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
const anton = Anton({
  variable: '--font-anton',
  weight: ['400'],
  subsets: ['latin'],
});
const bebasNeue = Bebas_Neue({
  variable: '--font-bebas-neue',
  weight: ['400'],
  subsets: ['latin'],
});
const lato = Lato({
  variable: '--font-lato',
  weight: ['400', '700'],
  subsets: ['latin'],
});
const sourceSansPro = Source_Sans_3({
  variable: '--font-source-sans',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
const ubuntu = Ubuntu({
  variable: '--font-ubuntu',
  weight: ['400', '500', '700'],
  subsets: ['latin'],
});
const workSans = Work_Sans({
  variable: '--font-work-sans',
  weight: ['400', '500', '600', '700'],
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${roboto.variable} ${openSans.variable} ${poppins.variable} ${playfairDisplay.variable} ${cormorantGaramond.variable} ${cinzel.variable} ${libreBaskerville.variable} ${montserrat.variable} ${raleway.variable} ${quicksand.variable} ${nunito.variable} ${oswald.variable} ${anton.variable} ${bebasNeue.variable} ${lato.variable} ${sourceSansPro.variable} ${ubuntu.variable} ${workSans.variable} antialiased`}
      >
        <StructuredData type="organization" data={organizationSchema} />
        <PerformanceMonitor />
        <Suspense fallback={null}>
          <QRCodeTracker />
        </Suspense>
        <Toaster />
        <AnalyticsWrapper>
          <ConditionalNavigation />
          <PageLayout>{children}</PageLayout>
        </AnalyticsWrapper>
      </body>
    </html>
  );
}
