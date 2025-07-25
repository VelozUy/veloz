import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { crewMemberService } from '@/services/crew-member';
import CrewProfile from '@/components/crew/CrewProfile';
import { StructuredData } from '@/components/seo/StructuredData';
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
    const result = await crewMemberService.getAllCrewMembers();
    if (!result.success || !result.data) {
      return {
        title: 'Crew Member Not Found - Veloz',
        description: 'The requested crew member could not be found.',
        robots: 'noindex, nofollow',
      };
    }

    const crewMember = result.data.find(
      member =>
        member.name.es?.toLowerCase().replace(/\s+/g, '-') === nameSlug ||
        member.name.en?.toLowerCase().replace(/\s+/g, '-') === nameSlug
    );

    if (!crewMember) {
      return {
        title: 'Crew Member Not Found - Veloz',
        description: 'The requested crew member could not be found.',
        robots: 'noindex, nofollow',
      };
    }

    // Enhanced SEO metadata
    const title = `${crewMember.name.es} - ${crewMember.role.es} | Veloz Fotografía y Videografía`;
    const description = crewMember.bio.es 
      ? `${crewMember.bio.es.substring(0, 160)}...`
      : `Conoce a ${crewMember.name.es}, ${crewMember.role.es} en Veloz. Especialista en fotografía y videografía profesional en Uruguay.`;
    
    const keywords = [
      crewMember.name.es,
      crewMember.role.es,
      'fotógrafo',
      'videógrafo',
      'fotografía',
      'videografía',
      'Uruguay',
      'Montevideo',
      'eventos',
      'bodas',
      'corporativos',
      ...crewMember.skills,
    ].filter(Boolean);

    const canonicalUrl = `https://veloz.com.uy/crew/${nameSlug}`;

    return {
      title,
      description,
      keywords: keywords.join(', '),
      authors: [{ name: crewMember.name.es }],
      creator: crewMember.name.es,
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
        images: crewMember.portrait ? [
          {
            url: crewMember.portrait,
            width: 1200,
            height: 630,
            alt: `${crewMember.name.es} - ${crewMember.role.es}`,
          }
        ] : [],
        locale: 'es_UY',
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: crewMember.portrait ? [crewMember.portrait] : [],
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
    const result = await crewMemberService.getAllCrewMembers();
    if (!result.success || !result.data) {
      notFound();
    }

    const crewMember = result.data.find(
      member =>
        member.name.es?.toLowerCase().replace(/\s+/g, '-') === nameSlug ||
        member.name.en?.toLowerCase().replace(/\s+/g, '-') === nameSlug
    );

    if (!crewMember) {
      notFound();
    }

    // Generate structured data for the crew member
    const personSchema = {
      '@context': 'https://schema.org' as const,
      '@type': 'Person' as const,
      name: crewMember.name.es || '',
      jobTitle: crewMember.role.es || '',
      description: crewMember.bio.es || '',
      image: crewMember.portrait || '',
      url: `https://veloz.com.uy/crew/${nameSlug}`,
      worksFor: {
        '@type': 'Organization' as const,
        name: 'Veloz Fotografía y Videografía',
        url: 'https://veloz.com.uy',
      },
      knowsAbout: crewMember.skills || [],
      sameAs: [
        ...(crewMember.socialLinks?.instagram ? [`https://instagram.com/${crewMember.socialLinks.instagram}`] : []),
        ...(crewMember.socialLinks?.website ? [crewMember.socialLinks.website] : []),
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
          name: crewMember.name.es || 'Crew Member',
          item: `https://veloz.com.uy/crew/${nameSlug}`,
        },
      ],
    };

    return (
      <>
        <StructuredData type="breadcrumb" data={breadcrumbSchema} />
        <StructuredData type="person" data={personSchema} />
        <CrewProfile crewMember={crewMember} />
      </>
    );
  } catch (error) {
    console.error('Error loading crew member:', error);
    notFound();
  }
}
