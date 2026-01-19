import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

const PRIVACY_METADATA: Record<
  'en' | 'pt',
  { title: string; description: string }
> = {
  en: {
    title: 'Privacy Policy | Veloz',
    description: 'Privacy policy and data protection information for Veloz.',
  },
  pt: {
    title: 'Politica de Privacidade | Veloz',
    description: 'Politica de privacidade e protecao de dados da Veloz.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: 'en' | 'pt' }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale: 'en' | 'pt' = resolvedParams.locale === 'pt' ? 'pt' : 'en';
  const meta = PRIVACY_METADATA[locale];

  return {
    title: meta.title,
    description: meta.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

// Generate static params at build time
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'pt' }];
}

// Force static generation at build time
export const dynamic = 'force-static';

// Disable automatic revalidation - content updates require manual build trigger
export const revalidate = false;

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'pt' }>;
}) {
  const resolvedParams = await params;
  const locale: 'en' | 'pt' = resolvedParams.locale === 'pt' ? 'pt' : 'en';
  return <LegalPage locale={locale} pageType="privacy" />;
}
