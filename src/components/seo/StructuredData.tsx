'use client';

import { useEffect } from 'react';

interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  description: string;
  logo?: string;
  address?: {
    '@type': 'PostalAddress';
    addressLocality: string;
    addressCountry: string;
  };
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone: string;
    contactType: string;
  };
  sameAs?: string[];
  employee?: Array<{
    '@type': 'Person';
    name: string;
    jobTitle?: string;
    description?: string;
    image?: string;
    url?: string;
    knowsAbout?: string[];
  }>;
}

interface LocalBusinessSchema {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness';
  name: string;
  description: string;
  url: string;
  telephone: string;
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

interface StructuredDataProps {
  type: 'organization' | 'localBusiness' | 'breadcrumb' | 'person';
  data: OrganizationSchema | LocalBusinessSchema | BreadcrumbSchema | PersonSchema;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    // Add structured data to the page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      // Clean up when component unmounts
      document.head.removeChild(script);
    };
  }, [data]);

  return null; // This component doesn't render anything
}

// Predefined schemas for common use cases
export const organizationSchema: OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Veloz',
  url: 'https://veloz.com.uy',
  logo: 'https://veloz.com.uy/logo.png',
  description: 'Professional event photography and videography services in Uruguay',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Montevideo',
    addressCountry: 'UY',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+598-XXX-XXX-XXX',
    contactType: 'customer service',
  },
  sameAs: [
    'https://instagram.com/veloz_uy',
    'https://facebook.com/veloz.uy',
  ],
};

export const localBusinessSchema: LocalBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Veloz',
  description: 'Professional event photography and videography services',
  url: 'https://veloz.com.uy',
  telephone: '+598-XXX-XXX-XXX',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Montevideo',
    addressCountry: 'UY',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -34.9011,
    longitude: -56.1645,
  },
  openingHours: [
    'Mo-Fr 09:00-18:00',
    'Sa 09:00-14:00',
  ],
  priceRange: '$$',
  areaServed: {
    '@type': 'Country',
    name: 'Uruguay',
  },
};

export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>): BreadcrumbSchema {
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