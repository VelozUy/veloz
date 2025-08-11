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
  try {
    let locale: string;
    try {
      const resolvedParams = await params;
      locale = resolvedParams.locale;
    } catch (error) {
      console.error('Error resolving params in our-work metadata:', error);
      return {
        title: 'Our Work | Veloz Photography & Videography',
        description:
          'Explore our portfolio of weddings, corporate events, birthdays and more.',
      };
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
  } catch (error) {
    console.error('Error generating metadata for our-work page:', error);
    return {
      title: 'Our Work | Veloz Photography & Videography',
      description:
        'Explore our portfolio of weddings, corporate events, birthdays and more.',
    };
  }
}

// Disable static generation temporarily to fix build issues
export const dynamic = 'force-dynamic';

export default async function OurWorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  try {
    // Handle case where params is undefined
    if (!params) {
      console.error('Params is undefined in our-work page');
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Page not available
            </h1>
            <p className="text-muted-foreground">
              The requested page is not available.
            </p>
          </div>
        </div>
      );
    }

    let locale: string;
    try {
      const resolvedParams = await params;
      locale = resolvedParams.locale;
    } catch (error) {
      console.error('Error resolving params in our-work page:', error);
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Page not available
            </h1>
            <p className="text-muted-foreground">
              The requested page is not available.
            </p>
          </div>
        </div>
      );
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
  } catch (error) {
    console.error('Error in our-work page:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Error loading page
          </h1>
          <p className="text-muted-foreground">
            An error occurred while loading the page.
          </p>
        </div>
      </div>
    );
  }
}
