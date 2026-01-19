import { MetadataRoute } from 'next';
import { getStaticContent } from '@/lib/utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://veloz.com.uy';
  const content = getStaticContent('es');
  const projects = content.content.projects || [];

  // Supported locales
  const locales = ['', 'en', 'pt']; // '' for Spanish (default)

  // Static pages for all locales
  const staticPages: MetadataRoute.Sitemap = [];

  locales.forEach(locale => {
    const prefix = locale ? `/${locale}` : '';

    staticPages.push(
      {
        url: `${baseUrl}${prefix}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}${prefix}/our-work`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}${prefix}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}${prefix}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}${prefix}/crew`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }
    );
  });

  // Project pages (only Spanish for now, as they're not localized)
  const projectPages = projects
    .filter(project => project.status === 'published')
    .map(project => ({
      url: `${baseUrl}/our-work/${project.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  // Crew member pages (only Spanish for now)
  const crewPages = [
    {
      url: `${baseUrl}/crew/veloz-team`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // Legal pages for all locales
  const legalPages: MetadataRoute.Sitemap = [];
  locales.forEach(locale => {
    const prefix = locale ? `/${locale}` : '';
    legalPages.push(
      {
        url: `${baseUrl}${prefix}/privacy`,
        lastModified: new Date(),
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}${prefix}/terms`,
        lastModified: new Date(),
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}${prefix}/cookies`,
        lastModified: new Date(),
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      }
    );
  });

  return [...staticPages, ...projectPages, ...crewPages, ...legalPages];
}
