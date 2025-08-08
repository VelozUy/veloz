import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStaticContent } from '@/lib/utils';
import CategoryPageClient from '@/components/our-work/CategoryPageClient';
import { ContactWidget } from '@/components/gallery/ContactWidget';

// Force static generation at build time
export const dynamic = 'force-static';
export const revalidate = false;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params at build time
export async function generateStaticParams() {
  const content = getStaticContent('es');

  const params: Array<{ slug: string }> = [];

  // Add category slugs only
  if (content.content.categories) {
    content.content.categories.forEach(category => {
      params.push({
        slug: category.id,
      });
    });
  }

  return params;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = getStaticContent('es');

  // Try to find category by ID
  const category = content.content.categories?.find(c => c.id === slug);

  if (category) {
    return {
      title: `${category.title} | Veloz Fotografía y Videografía`,
      description: `Explora nuestra colección de ${category.title.toLowerCase()} en Veloz Fotografía y Videografía.`,
      openGraph: {
        title: `${category.title} | Veloz Fotografía y Videografía`,
        description: `Explora nuestra colección de ${category.title.toLowerCase()} en Veloz Fotografía y Videografía.`,
        images: [
          {
            url: '/og-gallery.jpg',
            width: 1200,
            height: 630,
            alt: `Portafolio de ${category.title} - Veloz Fotografía y Videografía`,
          },
        ],
      },
    };
  }

  return {
    title: 'Page Not Found',
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const content = getStaticContent('es');

  // Try to find category by ID
  const category = content.content.categories?.find(c => c.id === slug);

  if (category) {
    return (
      <div className="relative min-h-screen w-full bg-background">
        {/* Category Page (client) */}
        <CategoryPageClient
          projects={content.content.projects || []}
          categories={content.content.categories || []}
          locale={content.locale}
          categorySlug={category.id}
        />

        {/* CTA Widget */}
        <ContactWidget language={content.locale} isGallery={true} />
      </div>
    );
  }

  notFound();
}
