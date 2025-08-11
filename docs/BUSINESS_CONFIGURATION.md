# 🏢 Business Configuration System

## Overview

The Veloz project uses a centralized business configuration system to maintain consistency across all components and eliminate duplicate business information. This system ensures that all contact information, logos, addresses, and business details are managed from a single source of truth.

## 📁 File Structure

```
src/lib/business-config.ts  # Centralized business configuration
```

## 🎯 Key Features

### Single Source of Truth

All business information is stored in one place, making updates simple and ensuring consistency across the entire application.

### Type Safety

Full TypeScript support with proper validation and type checking for all business data.

### SEO Optimization

Consistent structured data generation for search engines with proper Schema.org markup.

### Helper Functions

Pre-built functions for generating structured data objects with optional overrides.

## 📋 Business Configuration

### Current Business Information

```typescript
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

  // Address & Geographic Information
  address: {
    locality: 'Montevideo',
    country: 'UY',
    countryName: 'Uruguay',
  },
  coordinates: {
    latitude: -34.908163,
    longitude: -56.207987,
  },

  // Business Hours & Details
  openingHours: ['Mo-Fr 09:00-18:00', 'Sa 09:00-14:00'],
  priceRange: '$$',

  // Brand Assets
  logo: 'https://veloz.com.uy/veloz-logo-blue.png',
  logoAlt: 'https://veloz.com.uy/veloz-logo-carbon.png',

  // Social Media
  socialMedia: {
    instagram: 'https://instagram.com/veloz_uy',
    facebook: 'https://facebook.com/veloz_uy',
    instagramHandle: 'veloz_uy',
    facebookHandle: 'veloz_uy',
  },

  // Languages & Contact Types
  languages: ['Spanish', 'English'],
  contactTypes: {
    customerService: 'customer service',
  },
} as const;
```

## 🔧 Helper Functions

### Available Functions

```typescript
export const businessHelpers = {
  // Generate Organization schema data
  getOrganizationData(overrides = {}) {
    /* ... */
  },

  // Generate LocalBusiness schema data
  getLocalBusinessData(overrides = {}) {
    /* ... */
  },

  // Generate ContactPoint schema data
  getContactPointData(overrides = {}) {
    /* ... */
  },

  // Generate PostalAddress schema data
  getPostalAddressData(overrides = {}) {
    /* ... */
  },
};
```

### Usage Examples

```typescript
import { BUSINESS_CONFIG, businessHelpers } from '@/lib/business-config';

// Use default organization data
const orgData = businessHelpers.getOrganizationData();

// Override specific fields
const customOrgData = businessHelpers.getOrganizationData({
  description: 'Custom description for this page',
});

// Use business config directly
const phone = BUSINESS_CONFIG.phone;
const logo = BUSINESS_CONFIG.logo;
```

## 📊 Structured Data Implementation

### Schema.org Schemas Supported

1. **Organization Schema** - Company information and branding
2. **LocalBusiness Schema** - Local business details with coordinates
3. **ContactPage Schema** - Contact page specific information
4. **Person Schema** - Individual team member information
5. **BreadcrumbList Schema** - Navigation breadcrumbs
6. **FAQPage Schema** - FAQ content for rich snippets

### Implementation in Components

```typescript
// In page components
import { StructuredData, organizationData } from '@/components/seo/StructuredData';

export default function MyPage() {
  return (
    <>
      <StructuredData type="organization" data={organizationData} />
      <StructuredData type="localBusiness" data={localBusinessData} />
      {/* Page content */}
    </>
  );
}
```

## 🔄 Updating Business Information

### How to Update

1. **Edit the configuration file**:

   ```typescript
   // In src/lib/business-config.ts
   export const BUSINESS_CONFIG = {
     phone: '+59895320541', // ← Change here
     // ... other fields
   };
   ```

2. **Run the build**:

   ```bash
   npm run build
   ```

3. **Verify changes**:
   - Check that all components display updated information
   - Verify structured data is updated
   - Test SEO tools to ensure proper markup

### What Gets Updated Automatically

- ✅ All structured data schemas
- ✅ Footer contact information
- ✅ Legal page contact details
- ✅ SEO meta tags and structured data
- ✅ Admin panel references
- ✅ Contact forms and widgets

## 🎯 Benefits

### For Developers

- **No More Duplication**: Business info defined once, used everywhere
- **Type Safety**: Full TypeScript support prevents errors
- **Easy Updates**: Change one file, update everywhere
- **Consistent API**: Standardized helper functions

### For SEO

- **Consistent Branding**: Same logo and contact info everywhere
- **Rich Snippets**: Proper structured data for search engines
- **Local SEO**: Accurate coordinates and business information
- **Social Media**: Consistent handles and links

### For Maintenance

- **Single Point of Control**: All business data in one place
- **Version Control**: Easy to track changes to business information
- **Rollback Capability**: Simple to revert business information changes
- **Documentation**: Self-documenting configuration

## 🚀 Best Practices

### When Adding New Business Information

1. **Add to the config first**: Always add new business data to `BUSINESS_CONFIG`
2. **Use helper functions**: Generate structured data using the provided helpers
3. **Test thoroughly**: Verify the information appears correctly across all components
4. **Update documentation**: Keep this file updated with new fields

### When Creating New Components

1. **Import the config**: Use `BUSINESS_CONFIG` for any business information
2. **Use structured data**: Include appropriate Schema.org markup
3. **Follow patterns**: Use existing components as templates
4. **Test SEO**: Verify structured data is generated correctly

## 🔍 Troubleshooting

### Common Issues

1. **Type Errors**: Ensure all overrides match the expected types
2. **Build Failures**: Check that all imports are correct
3. **SEO Issues**: Verify structured data is being generated properly
4. **Inconsistent Data**: Ensure you're using the centralized config everywhere

### Debugging

```typescript
// Check current business config
console.log(BUSINESS_CONFIG);

// Verify structured data generation
const orgData = businessHelpers.getOrganizationData();
console.log(JSON.stringify(orgData, null, 2));
```

## 📈 Future Enhancements

### Planned Improvements

- **Environment-specific configs**: Different data for dev/staging/prod
- **Admin interface**: Web-based business information management
- **Validation rules**: Enhanced validation for business data
- **Analytics integration**: Track business information usage
- **Multi-language support**: Business descriptions in multiple languages

### Extension Points

- **Additional schemas**: Support for more Schema.org types
- **Custom helpers**: Project-specific helper functions
- **Validation schemas**: Zod schemas for business data validation
- **Migration tools**: Automated migration of business information

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintainer**: Development Team
