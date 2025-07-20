import { MetadataRoute } from 'next';
import { getStaticContent } from '@/lib/utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://veloz.com.uy';

  // Supported languages
  const languages = ['es', 'en', 'pt'];

  // Collect all project pages for all languages
  const projectPages: Array<MetadataRoute.Sitemap[number]> = [];
  const seenUrls = new Set<string>();

  for (const lang of languages) {
    const content = getStaticContent(lang);
    const projects = content.content.projects || [];
    for (const project of projects) {
      const url =
        `${baseUrl}/${lang === 'es' ? '' : lang + '/'}projects/${project.slug || project.id}`.replace(
          /\/our-work\//,
          '/our-work/'
        );
      if (!seenUrls.has(url)) {
        projectPages.push({
          url,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        });
        seenUrls.add(url);
      }
    }
  }

  // Base pages
  const basePages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/our-work`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Language-specific base pages
  const languagePages = languages
    .filter(lang => lang !== 'es')
    .flatMap(lang => [
      {
        url: `${baseUrl}/${lang}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/${lang}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/${lang}/gallery`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/${lang}/our-work`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/${lang}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
    ]);

  return [...basePages, ...projectPages, ...languagePages];
}
