import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

const TERMS_METADATA: Record<
  'en' | 'pt',
  { title: string; description: string }
> = {
  en: {
    title: 'Terms of Service | Veloz',
    description: 'Terms and conditions of service for Veloz.',
  },
  pt: {
    title: 'Termos de Servico | Veloz',
    description: 'Termos e condicoes de servico da Veloz.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: 'en' | 'pt' }>;
}): Promise<Metadata> {
  if (!params) {
    throw new Error('Params Promise is undefined');
  }
  const resolvedParams = await params;
  if (
    !resolvedParams ||
    typeof resolvedParams !== 'object' ||
    !('locale' in resolvedParams)
  ) {
    throw new Error(`Invalid params: ${JSON.stringify(resolvedParams)}`);
  }
  const rawLocale = resolvedParams.locale;
  const locale = rawLocale === 'pt' ? 'pt' : 'en';
  const meta = TERMS_METADATA[locale];

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

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'pt' }>;
}) {
  if (!params) {
    throw new Error('Params Promise is undefined');
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
  return <LegalPage locale={locale} pageType="terms" />;
}
