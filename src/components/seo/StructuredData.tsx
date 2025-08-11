'use client';

import { useEffect } from 'react';
import { BUSINESS_CONFIG, businessHelpers } from '@/lib/business-config';

interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  description: string;
  url: string;
  logo: string;
  image: string;
  contactPoint: {
    '@type': 'ContactPoint';
    telephone: string;
    contactType: string;
    availableLanguage: string[];
  };
  address: {
    '@type': 'PostalAddress';
    addressCountry: string;
    addressLocality: string;
  };
  sameAs: string[];
}

interface LocalBusinessSchema {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness';
  name: string;
  description: string;
  url: string;
  telephone: string;
  logo: string;
  image: string;
  address: {
    '@type': 'PostalAddress';
    addressLocality: string;
    addressCountry: string;
  };
  geo: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  openingHours: string[];
  priceRange: string;
  areaServed: {
    '@type': 'Country';
    name: string;
  };
}

interface ContactPageSchema {
  '@context': 'https://schema.org';
  '@type': 'ContactPage';
  name: string;
  description: string;
  url: string;
  mainEntity: {
    '@type': 'Organization';
    name: string;
    url: string;
    contactPoint: {
      '@type': 'ContactPoint';
      telephone: string;
      contactType: string;
      availableLanguage: string[];
      areaServed: {
        '@type': 'Country';
        name: string;
      };
    };
  };
  breadcrumb: {
    '@type': 'BreadcrumbList';
    itemListElement: Array<{
      '@type': 'ListItem';
      position: number;
      name: string;
      item: string;
    }>;
  };
}

interface PersonSchema {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  jobTitle?: string;
  description?: string;
  image?: string;
  url?: string;
  worksFor?: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  knowsAbout?: string[];
  sameAs?: string[];
  address?: {
    '@type': 'PostalAddress';
    addressLocality: string;
    addressCountry: string;
  };
}

interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

interface GallerySchema {
  '@context': 'https://schema.org';
  '@type': 'CollectionPage';
  name: string;
  description: string;
  url: string;
  mainEntity: {
    '@type': 'ItemList';
    numberOfItems: number;
    itemListElement: Array<{
      '@type': 'ListItem';
      position: number;
      item: {
        '@type': 'CreativeWork';
        name: string;
        description: string;
        creator: {
          '@type': 'Organization';
          name: string;
          url: string;
        };
        locationCreated: {
          '@type': 'Place';
          name: string;
        };
      };
    }>;
  };
  breadcrumb: {
    '@type': 'BreadcrumbList';
    itemListElement: Array<{
      '@type': 'ListItem';
      position: number;
      name: string;
      item: string;
    }>;
  };
}

interface FAQPageSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

interface AboutPageSchema {
  '@context': 'https://schema.org';
  '@type': 'AboutPage';
  name: string;
  description: string;
  url: string;
  mainEntity: {
    '@type': 'Organization';
    name: string;
    description: string;
    url: string;
    logo: string;
    image: string;
    address: {
      '@type': 'PostalAddress';
      addressCountry: string;
      addressLocality: string;
    };
    contactPoint: {
      '@type': 'ContactPoint';
      contactType: string;
      availableLanguage: string[];
    };
    sameAs: string[];
  };
  breadcrumb: {
    '@type': 'BreadcrumbList';
    itemListElement: Array<{
      '@type': 'ListItem';
      position: number;
      name: string;
      item: string;
    }>;
  };
}

type SchemaType =
  | 'organization'
  | 'gallery'
  | 'localBusiness'
  | 'contactPage'
  | 'faq'
  | 'aboutPage'
  | 'breadcrumb'
  | 'person';

interface StructuredDataProps {
  type: SchemaType;
  data:
    | OrganizationSchema
    | GallerySchema
    | LocalBusinessSchema
    | ContactPageSchema
    | FAQPageSchema
    | AboutPageSchema
    | BreadcrumbSchema
    | PersonSchema;
}

// Reusable LocalBusiness data
export const localBusinessData: LocalBusinessSchema =
  businessHelpers.getLocalBusinessData();

// Reusable ContactPage data
export const contactPageData: ContactPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Veloz - Contacto',
  description:
    'Cuéntanos sobre tu evento y hagamos que sea perfecto. Obtén una cotización gratuita y sin compromiso para fotografía y video profesional.',
  url: `${BUSINESS_CONFIG.website}/contact`,
  mainEntity: {
    '@type': 'Organization',
    name: BUSINESS_CONFIG.shortName,
    url: BUSINESS_CONFIG.website,
    contactPoint: businessHelpers.getContactPointData(),
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: BUSINESS_CONFIG.website,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Contacto',
        item: `${BUSINESS_CONFIG.website}/contact`,
      },
    ],
  },
};

export function StructuredData({ type, data }: StructuredDataProps) {
  switch (type) {
    case 'organization':
      return (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data as OrganizationSchema),
          }}
        />
      );
    case 'gallery':
      return (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data as GallerySchema),
          }}
        />
      );
    case 'localBusiness':
      return (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data as LocalBusinessSchema),
          }}
        />
      );
    case 'contactPage':
      return (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data as ContactPageSchema),
          }}
        />
      );
    case 'faq':
      return (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data as FAQPageSchema),
          }}
        />
      );
    case 'aboutPage':
      return (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data as AboutPageSchema),
          }}
        />
      );
    case 'breadcrumb':
      return (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data as BreadcrumbSchema),
          }}
        />
      );
    case 'person':
      return (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data as PersonSchema),
          }}
        />
      );
    default:
      return null;
  }
}

// Reusable Organization data
export const organizationData: OrganizationSchema =
  businessHelpers.getOrganizationData();

export const localBusinessSchema: LocalBusinessSchema =
  businessHelpers.getLocalBusinessData({
    name: BUSINESS_CONFIG.shortName,
    description: BUSINESS_CONFIG.descriptionEn,
    logo: BUSINESS_CONFIG.logoAlt,
    image: BUSINESS_CONFIG.logoAlt,
  });

export function createBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
