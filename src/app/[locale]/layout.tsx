import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const SUPPORTED_LOCALES = ['en', 'pt'] as const;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://veloz.com.uy';

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  if (
    !resolvedParams ||
    typeof resolvedParams !== 'object' ||
    !('locale' in resolvedParams)
  ) {
    return {};
  }
  const locale = resolvedParams.locale;

  if (!SUPPORTED_LOCALES.includes(locale as 'en' | 'pt')) {
    return {};
  }

  // Generate hreflang alternates for all locales
  const alternates: Metadata['alternates'] = {
    canonical: `/${locale}`,
    languages: {
      es: '/',
      en: '/en',
      pt: '/pt',
      'x-default': '/',
    },
  };

  return {
    alternates,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  if (
    !resolvedParams ||
    typeof resolvedParams !== 'object' ||
    !('locale' in resolvedParams)
  ) {
    notFound();
  }
  const locale = resolvedParams.locale;

  if (!SUPPORTED_LOCALES.includes(locale as 'en' | 'pt')) {
    notFound();
  }

  return children;
}
