/**
 * Centralized business configuration
 *
 * This file contains all business information in one place to avoid duplication
 * across structured data schemas and other components.
 */

export const BUSINESS_CONFIG = {
  // Basic Information
  name: 'Veloz Fotografía y Videografía',
  shortName: 'Veloz',
  description:
    'Servicios profesionales de fotografía y videografía en Montevideo, Uruguay. Especialistas en bodas, eventos corporativos y fotografía comercial.',
  descriptionEn:
    'Professional event photography and videography services in Uruguay',

  // Contact Information
  phone: '+59895320541',
  email: 'contacto@veloz.com.uy',
  website: 'https://veloz.com.uy',

  // Address
  address: {
    locality: 'Montevideo',
    country: 'UY',
    countryName: 'Uruguay',
  },

  // Geographic Coordinates
  coordinates: {
    latitude: -34.908163,
    longitude: -56.207987,
  },

  // Business Hours
  openingHours: ['Mo-Fr 09:00-18:00', 'Sa 09:00-14:00'] as string[],

  // Business Details
  priceRange: '$$',

  // Assets
  logo: 'https://veloz.com.uy/veloz-logo-blue.png',
  logoAlt: 'https://veloz.com.uy/veloz-logo-carbon.png',

  // Social Media
  socialMedia: {
    instagram: 'https://instagram.com/veloz_uy',
    facebook: 'https://facebook.com/veloz.uy',
    instagramHandle: 'veloz_uy',
    facebookHandle: 'veloz_uy',
  },

  // Languages
  languages: ['Spanish', 'English'] as string[],

  // Contact Types
  contactTypes: {
    customerService: 'customer service',
  },
} as const;

/**
 * Helper functions to generate structured data objects
 */
export const businessHelpers = {
  /**
   * Generate base organization data
   */
  getOrganizationData(
    overrides: Partial<{
      name: string;
      description: string;
      logo: string;
      image: string;
    }> = {}
  ) {
    const config = { ...BUSINESS_CONFIG, ...overrides };
    return {
      '@context': 'https://schema.org' as const,
      '@type': 'Organization' as const,
      name: config.name,
      description: config.descriptionEn,
      url: config.website,
      logo: config.logo,
      image: config.logo,
      contactPoint: {
        '@type': 'ContactPoint' as const,
        telephone: config.phone,
        contactType: config.contactTypes.customerService,
        availableLanguage: config.languages,
      },
      address: {
        '@type': 'PostalAddress' as const,
        addressLocality: config.address.locality,
        addressCountry: config.address.country,
      },
      sameAs: [
        config.socialMedia.instagram,
        config.socialMedia.facebook,
      ] as string[],
    };
  },

  /**
   * Generate local business data
   */
  getLocalBusinessData(
    overrides: Partial<{
      name: string;
      description: string;
      logo: string;
      image: string;
    }> = {}
  ) {
    const config = { ...BUSINESS_CONFIG, ...overrides };
    return {
      '@context': 'https://schema.org' as const,
      '@type': 'LocalBusiness' as const,
      name: config.name,
      description: config.description,
      url: config.website,
      telephone: config.phone,
      logo: config.logo,
      image: config.logo,
      address: {
        '@type': 'PostalAddress' as const,
        addressLocality: config.address.locality,
        addressCountry: config.address.country,
      },
      geo: {
        '@type': 'GeoCoordinates' as const,
        latitude: config.coordinates.latitude,
        longitude: config.coordinates.longitude,
      },
      openingHours: config.openingHours,
      priceRange: config.priceRange,
      areaServed: {
        '@type': 'Country' as const,
        name: config.address.countryName,
      },
    };
  },

  /**
   * Generate contact point data
   */
  getContactPointData(
    overrides: Partial<{
      phone: string;
      contactTypes: { customerService: string };
      languages: string[];
      address: { countryName: string };
    }> = {}
  ) {
    const config = { ...BUSINESS_CONFIG, ...overrides };
    return {
      '@type': 'ContactPoint' as const,
      telephone: config.phone,
      contactType: config.contactTypes.customerService,
      availableLanguage: config.languages,
      areaServed: {
        '@type': 'Country' as const,
        name: config.address.countryName,
      },
    };
  },

  /**
   * Generate postal address data
   */
  getPostalAddressData(
    overrides: Partial<{
      address: { locality: string; country: string };
    }> = {}
  ) {
    const config = { ...BUSINESS_CONFIG, ...overrides };
    return {
      '@type': 'PostalAddress' as const,
      addressLocality: config.address.locality,
      addressCountry: config.address.country,
    };
  },
};
