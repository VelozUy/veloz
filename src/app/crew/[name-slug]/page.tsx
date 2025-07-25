import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CrewProfile from '@/components/crew/CrewProfile';
import { StructuredData } from '@/components/seo/StructuredData';
import { getStaticContent } from '@/lib/utils';
import type { CrewMember } from '@/types';

interface CrewProfilePageProps {
  params: Promise<{
    'name-slug': string;
  }>;
}

// Force static generation at build time
export const dynamic = 'force-static';

// Disable automatic revalidation - content updates require manual build trigger
export const revalidate = false;

export async function generateMetadata({
  params,
}: CrewProfilePageProps): Promise<Metadata> {
  const { 'name-slug': nameSlug } = await params;

  try {
    // Get static content for Spanish locale (default)
    const staticContent = getStaticContent('es');
    const crewMembers = staticContent.content.crewMembers || [];

    const crewMember = crewMembers.find(
      member => member.name?.toLowerCase().replace(/\s+/g, '-') === nameSlug
    );

    if (!crewMember) {
      return {
        title: 'Crew Member Not Found - Veloz',
        description: 'The requested crew member could not be found.',
        robots: 'noindex, nofollow',
      };
    }

    // Enhanced SEO metadata
    const title = `${crewMember.name} - ${crewMember.role || 'Crew Member'} | Veloz Fotografía y Videografía`;
    const description = crewMember.bio
      ? `${crewMember.bio.substring(0, 160)}...`
      : `Conoce a ${crewMember.name}, ${crewMember.role || 'miembro del equipo'} en Veloz. Especialista en fotografía y videografía profesional en Uruguay.`;

    const keywords = [
      crewMember.name,
      crewMember.role,
      'fotógrafo',
      'videógrafo',
      'fotografía',
      'videografía',
      'Uruguay',
      'Montevideo',
      'eventos',
      'bodas',
      'corporativos',
      ...(crewMember.skills || []),
    ].filter(Boolean);

    const canonicalUrl = `https://veloz.com.uy/crew/${nameSlug}`;

    return {
      title,
      description,
      keywords: keywords.join(', '),
      authors: [{ name: crewMember.name }],
      creator: crewMember.name,
      publisher: 'Veloz Fotografía y Videografía',
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      metadataBase: new URL('https://veloz.com.uy'),
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: 'Veloz Fotografía y Videografía',
        images: crewMember.portrait
          ? [
              {
                url: crewMember.portrait,
                width: 1200,
                height: 630,
                alt: `${crewMember.name} - ${crewMember.role || 'Crew Member'}`,
              },
            ]
          : [],
        locale: 'es_UY',
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        creator: '@veloz_uy',
        site: '@veloz_uy',
        images: crewMember.portrait ? [crewMember.portrait] : [],
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
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Crew Member - Veloz',
      description: 'Crew member profile page.',
      robots: 'noindex, nofollow',
    };
  }
}

export default async function CrewProfilePage({
  params,
}: CrewProfilePageProps) {
  const { 'name-slug': nameSlug } = await params;

  try {
    // Get static content for Spanish locale (default)
    const staticContent = getStaticContent('es');
    const crewMembers = staticContent.content.crewMembers || [];

    const crewMember = crewMembers.find(
      member => member.name?.toLowerCase().replace(/\s+/g, '-') === nameSlug
    );

    if (!crewMember) {
      notFound();
    }

    // Convert static content format to CrewMember type
    const crewMemberData: CrewMember = {
      id: crewMember.id,
      name: {
        es: crewMember.name,
        en: crewMember.name,
        pt: crewMember.name,
      },
      role: {
        es: crewMember.role || '',
        en: crewMember.role || '',
        pt: crewMember.role || '',
      },
      portrait: crewMember.portrait,
      bio: {
        es: crewMember.bio || '',
        en: crewMember.bio || '',
        pt: crewMember.bio || '',
      },
      socialLinks: crewMember.socialLinks || {},
      skills: crewMember.skills || [],
      order: crewMember.order || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Generate structured data for the crew member
    const personSchema = {
      '@context': 'https://schema.org' as const,
      '@type': 'Person' as const,
      name: crewMemberData.name.es || '',
      jobTitle: crewMemberData.role.es || '',
      description: crewMemberData.bio.es || '',
      image: crewMemberData.portrait || '',
      url: `https://veloz.com.uy/crew/${nameSlug}`,
      worksFor: {
        '@type': 'Organization' as const,
        name: 'Veloz Fotografía y Videografía',
        url: 'https://veloz.com.uy',
      },
      knowsAbout: crewMemberData.skills || [],
      sameAs: [
        ...(crewMemberData.socialLinks?.instagram
          ? [`https://instagram.com/${crewMemberData.socialLinks.instagram}`]
          : []),
        ...(crewMemberData.socialLinks?.website
          ? [crewMemberData.socialLinks.website]
          : []),
      ].filter(Boolean),
      address: {
        '@type': 'PostalAddress' as const,
        addressLocality: 'Montevideo',
        addressCountry: 'UY',
      },
    };

    // Generate breadcrumb structured data
    const breadcrumbSchema = {
      '@context': 'https://schema.org' as const,
      '@type': 'BreadcrumbList' as const,
      itemListElement: [
        {
          '@type': 'ListItem' as const,
          position: 1,
          name: 'Inicio',
          item: 'https://veloz.com.uy',
        },
        {
          '@type': 'ListItem' as const,
          position: 2,
          name: 'Nuestro Equipo',
          item: 'https://veloz.com.uy/crew',
        },
        {
          '@type': 'ListItem' as const,
          position: 3,
          name: crewMemberData.name.es || 'Crew Member',
          item: `https://veloz.com.uy/crew/${nameSlug}`,
        },
      ],
    };

    return (
      <>
        <StructuredData type="breadcrumb" data={breadcrumbSchema} />
        <StructuredData type="person" data={personSchema} />
        <CrewProfile crewMember={crewMemberData} />
      </>
    );
  } catch (error) {
    console.error('Error loading crew member:', error);
    notFound();
  }
}
