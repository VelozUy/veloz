import { Metadata } from 'next';
import { getStaticContent } from '@/lib/utils';
import OurWorkClient from '@/components/our-work/OurWorkClient';
import { ContactWidget } from '@/components/gallery/ContactWidget';

// Generate static params for English and Portuguese only (Spanish is default)
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'pt' }];
}

// Generate metadata for each locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  // Handle Next.js 15 static generation issue where params can be undefined
  let locale = 'es'; // Default to Spanish

  try {
    // Check if params exists and is a Promise
    if (params && typeof params.then === 'function') {
      const resolvedParams = await params;
      if (resolvedParams && resolvedParams.locale) {
        locale = resolvedParams.locale;
      }
    }
  } catch (error) {
    // If params resolution fails, keep default locale
    console.warn(
      'Failed to resolve params in metadata, using default locale:',
      error
    );
  }

  const metadata: Record<string, Metadata> = {
    en: {
      title: 'Our Work | Veloz Photography & Videography',
      description:
        'Explore our portfolio of weddings, corporate events, birthdays and more. Discover why clients choose Veloz for their special moments.',
      keywords: [
        'photography portfolio',
        'work gallery',
        'Veloz weddings',
        'corporate events',
        'professional photography',
        'videography',
        'special moments',
      ],
      openGraph: {
        title: 'Our Work | Veloz Photography & Videography',
        description:
          'Explore our portfolio of weddings, corporate events, birthdays and more.',
        type: 'website',
        locale: 'en_US',
      },
    },
    pt: {
      title: 'Nosso Trabalho | Veloz Fotografia e Videografia',
      description:
        'Explore nosso portfólio de casamentos, eventos corporativos, aniversários e mais. Descubra por que os clientes escolhem Veloz para seus momentos especiais.',
      keywords: [
        'portfólio fotografia',
        'galeria de trabalhos',
        'casamentos Veloz',
        'eventos corporativos',
        'fotografia profissional',
        'videografia',
        'momentos especiais',
      ],
      openGraph: {
        title: 'Nosso Trabalho | Veloz Fotografia e Videografia',
        description:
          'Explore nosso portfólio de casamentos, eventos corporativos, aniversários e mais.',
        type: 'website',
        locale: 'pt_BR',
      },
    },
  };

  return metadata[locale] || metadata.en;
}

// Temporarily use dynamic rendering to avoid Next.js 15 static generation issues
export const dynamic = 'force-dynamic';

export default async function OurWorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Handle Next.js 15 static generation issue where params can be undefined
  let locale = 'es'; // Default to Spanish

  try {
    // Check if params exists and is a Promise
    if (params && typeof params.then === 'function') {
      const resolvedParams = await params;
      if (resolvedParams && resolvedParams.locale) {
        locale = resolvedParams.locale;
      }
    }
  } catch (error) {
    // If params resolution fails, keep default locale
    console.warn('Failed to resolve params, using default locale:', error);
  }

  // Get static content for the specific locale
  const content = getStaticContent(locale);

  // Handle case where content is undefined
  if (!content) {
    console.error(`No content found for locale: ${locale}`);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Content not available
          </h1>
          <p className="text-muted-foreground">
            The content for this locale is not available.
          </p>
        </div>
      </div>
    );
  }

  const projects = content.content.projects || [];
  const categories = content.content.categories || [];

  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* Single Tiled Grid with All Featured Media */}
      <OurWorkClient projects={projects} locale={content.locale} />

      {/* Contact Widget (client) */}
      <ContactWidget language={content.locale} isGallery={true} />
    </div>
  );
}
