import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

const COOKIES_METADATA: Record<
  'en' | 'pt',
  { title: string; description: string }
> = {
  en: {
    title: 'Cookies Settings | Veloz',
    description: 'Cookie settings and management for Veloz.',
  },
  pt: {
    title: 'Configuracao de Cookies | Veloz',
    description: 'Configuracao e gerenciamento de cookies da Veloz.',
  },
};

export async function generateMetadata({
  params,
}: {
  params?: Promise<{ locale: 'en' | 'pt' }>;
}): Promise<Metadata> {
  if (!params) {
    // Default to 'en' if params is not provided during static generation
    const locale = 'en';
    const meta = COOKIES_METADATA[locale];
    return {
      title: meta.title,
      description: meta.description,
      robots: {
        index: false,
        follow: false,
      },
    };
  }
  const resolvedParams = await params;
  if (
    !resolvedParams ||
    typeof resolvedParams !== 'object' ||
    !('locale' in resolvedParams)
  ) {
    throw new Error(
      `Invalid params in generateMetadata: ${JSON.stringify(resolvedParams)}`
    );
  }
  const rawLocale = resolvedParams.locale;
  const locale = rawLocale === 'pt' ? 'pt' : 'en';
  const meta = COOKIES_METADATA[locale];

  return {
    title: meta.title,
    description: meta.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

// Force static generation at build time
export const dynamic = 'force-static';

// Disable automatic revalidation - content updates require manual build trigger
export const revalidate = false;

export default async function CookiesPage({
  params,
}: {
  params?: Promise<{ locale: 'en' | 'pt' }>;
}) {
  if (!params) {
    // Default to 'en' if params is not provided during static generation
    return <LegalPage locale="en" pageType="cookies" />;
  }
  const resolvedParams = await params;
  if (
    !resolvedParams ||
    typeof resolvedParams !== 'object' ||
    !('locale' in resolvedParams)
  ) {
    throw new Error(`Invalid params: ${JSON.stringify(resolvedParams)}`);
  }
  const locale = resolvedParams.locale;
  return <LegalPage locale={locale} pageType="cookies" />;
}
