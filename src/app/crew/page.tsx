import { Metadata } from 'next';
import CrewListing from '@/components/crew/CrewListing';
import { StructuredData } from '@/components/seo/StructuredData';
import { BUSINESS_CONFIG, businessHelpers } from '@/lib/business-config';
import { getStaticContent } from '@/lib/utils';

// Force static generation at build time
export const dynamic = 'force-static';

// Disable automatic revalidation - content updates require manual build trigger
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Nuestro Equipo - Fotógrafos y Videógrafos Profesionales | Veloz',
  description:
    'Conoce a nuestro equipo de fotógrafos y videógrafos profesionales en Uruguay. Cada miembro tiene su estilo único y especialidades en bodas, eventos corporativos y más.',
  keywords:
    'fotógrafos Uruguay, videógrafos Montevideo, equipo fotografía, bodas Uruguay, eventos corporativos, fotografía profesional, videografía profesional',
  authors: [{ name: 'Veloz Fotografía y Videografía' }],
  creator: 'Veloz Fotografía y Videografía',
  publisher: 'Veloz Fotografía y Videografía',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://veloz.com.uy'),
  alternates: {
    canonical: 'https://veloz.com.uy/crew',
  },
  openGraph: {
    title: 'Nuestro Equipo - Fotógrafos y Videógrafos Profesionales | Veloz',
    description:
      'Conoce a nuestro equipo de fotógrafos y videógrafos profesionales en Uruguay. Cada miembro tiene su estilo único y especialidades.',
    url: 'https://veloz.com.uy/crew',
    siteName: 'Veloz Fotografía y Videografía',
    locale: 'es_UY',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nuestro Equipo - Fotógrafos y Videógrafos Profesionales | Veloz',
    description:
      'Conoce a nuestro equipo de fotógrafos y videógrafos profesionales en Uruguay.',
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
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default async function CrewPage() {
  try {
    // Get static content for Spanish locale (default)
    const staticContent = getStaticContent('es');
    const crewMembers = staticContent.content.crewMembers || [];

    if (!crewMembers || crewMembers.length === 0) {
      return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 md:px-8 lg:px-8 xl:px-16 py-8">
            <div className="text-center">
              <h1 className="text-section-title-md font-body font-semibold mb-4">
                Nuestro Equipo
              </h1>
              <p className="text-muted-foreground">
                No hay miembros del equipo disponibles en este momento.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Generate structured data for the team page
    const teamSchema = businessHelpers.getOrganizationData({
      description:
        'Equipo de fotógrafos y videógrafos profesionales en Uruguay',
    });

    // Generate breadcrumb structured data
    const breadcrumbSchema = {
      '@context': 'https://schema.org' as const,
      '@type': 'BreadcrumbList' as const,
      itemListElement: [
        {
          '@type': 'ListItem' as const,
          position: 1,
          name: 'Inicio',
          item: BUSINESS_CONFIG.website,
        },
        {
          '@type': 'ListItem' as const,
          position: 2,
          name: 'Nuestro Equipo',
          item: `${BUSINESS_CONFIG.website}/crew`,
        },
      ],
    };

    // Transform static crew members to match CrewMember type
    const transformedCrewMembers = crewMembers.map((member: any) => ({
      id: member.id,
      name: { es: member.name, en: member.name, pt: member.name },
      role: { es: member.role, en: member.role, pt: member.role },
      portrait: member.portrait,
      bio: { es: member.bio, en: member.bio, pt: member.bio },
      socialLinks: member.socialLinks || {},
      skills: member.skills || [],
      order: member.order || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return (
      <>
        <StructuredData type="breadcrumb" data={breadcrumbSchema} />
        <StructuredData type="organization" data={teamSchema} />
        <CrewListing crewMembers={transformedCrewMembers} />
      </>
    );
  } catch (error) {
    console.error('Error loading crew members:', error);
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-8 lg:px-8 xl:px-16 py-8">
          <div className="text-center">
            <h1 className="text-section-title-md font-body font-semibold mb-4">
              Nuestro Equipo
            </h1>
            <p className="text-muted-foreground">
              Error al cargar los miembros del equipo. Por favor, intenta de
              nuevo más tarde.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
