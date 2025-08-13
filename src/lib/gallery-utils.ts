import { getStaticContent } from '@/lib/utils';

// Generate optimized image URL for carousel (small, low-quality images)
function generateOptimizedImageUrl(
  originalUrl: string,
  width: number,
  height: number
): string {
  // If it's an external URL (like Unsplash), add optimization parameters
  if (originalUrl.includes('unsplash.com')) {
    return `${originalUrl}?w=${width}&h=${height}&fit=crop&q=60`;
  }

  // If it's a local image or other URL, return as is for now
  // In a real implementation, you might want to use an image optimization service
  return originalUrl;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  projectId?: string;
  projectTitle?: string;
}

export interface Project {
  id: string;
  slug?: string;
  title: string;
  eventType?: string;
  status?: string;
  media?: Array<{
    id: string;
    type: 'photo' | 'video';
    url: string;
    width?: number;
    height?: number;
    featured?: boolean;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5';
    projectId?: string;
    description?: { [key: string]: string };
    tags?: string[];
  }>;
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Load project images using the same system as our-work page
export function loadProjectImages(
  locale: string,
  seed?: string
): GalleryImage[] {
  try {
    const content = getStaticContent(locale);
    const projects = content.content.projects || [];

    // Filter only published projects
    const publishedProjects = projects.filter(
      (project: Project) => project.status === 'published'
    );

    // Collect all media from published projects (same logic as our-work page)
    const allMedia: GalleryImage[] = [];

    publishedProjects.forEach((project: Project) => {
      if (project.media && Array.isArray(project.media)) {
        project.media.forEach(media => {
          // Only include photos (not videos for now)
          if (media.type === 'photo' && media.url) {
            // Use actual dimensions if available, otherwise use better defaults
            const width = media.width || 1200;
            const height = media.height || 800;

            // Enhanced alt text generation for better SEO (same as our-work page)
            const generateAltText = () => {
              // Use description if available (prioritize current locale)
              if (
                media.description &&
                media.description[locale as keyof typeof media.description]
              ) {
                const desc =
                  media.description[locale as keyof typeof media.description];
                // Clean up description and make it more SEO-friendly
                const cleanDesc = desc
                  .replace(/Contrata|Hire|Contrate/gi, '')
                  .trim();
                return `${cleanDesc} - ${project.title} - Veloz Fotografía`;
              }

              // Use tags if available - create more descriptive alt text
              if (media.tags && media.tags.length > 0) {
                const tagString = media.tags.slice(0, 4).join(', ');
                const eventType = project.eventType || 'evento';
                return `${project.title} - ${tagString} - ${eventType} - Fotografía profesional en Montevideo`;
              }

              // Fallback with event type and location
              const eventType = project.eventType || 'evento';
              return `${project.title} - ${eventType} - Fotografía profesional por Veloz en Montevideo, Uruguay`;
            };

            // Generate optimized URL for carousel (small square images)
            const optimizedUrl = generateOptimizedImageUrl(media.url, 300, 300);

            allMedia.push({
              id: media.id,
              url: optimizedUrl,
              alt: generateAltText(),
              width: 300,
              height: 300,
              projectId: project.id,
              projectTitle: project.title,
            });
          }
        });
      }
    });

    // Use seed for consistent randomization if provided
    if (seed) {
      // Simple hash function for seed
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }

      // Use hash to seed Math.random
      const seededRandom = (min: number, max: number) => {
        const x = Math.sin(hash++) * 10000;
        return min + (x - Math.floor(x)) * (max - min);
      };

      // Shuffle with seeded random
      const shuffled = [...allMedia];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(0, i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return shuffled;
    }

    // Return shuffled array
    return shuffleArray(allMedia);
  } catch (error) {
    console.error('Error loading project images:', error);
    return [];
  }
}

// Get a subset of images for carousel
export function getCarouselImages(
  locale: string,
  seed: string,
  count: number = 20
): GalleryImage[] {
  const allImages = loadProjectImages(locale, seed);
  return allImages.slice(0, count);
}
