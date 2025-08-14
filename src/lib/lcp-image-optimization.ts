/**
 * LCP Image Optimization Utilities
 * 
 * Specialized utilities for optimizing Largest Contentful Paint (LCP) images.
 * Focuses on critical image preloading, optimization, and delivery strategies.
 */

export interface LCPImageConfig {
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  sizes?: string;
  priority?: boolean;
  preload?: boolean;
  placeholder?: 'empty' | 'blur' | 'dominant-color';
  blurDataURL?: string;
}

export interface LCPImageResult {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'empty' | 'blur' | 'dominant-color';
  blurDataURL?: string;
  preloadUrl?: string;
}

/**
 * Critical LCP images that should be preloaded immediately
 */
const CRITICAL_LCP_IMAGES = [
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176',
];

/**
 * Generate optimized image URL with LCP-specific parameters
 */
export function generateLCPOptimizedUrl(
  originalUrl: string,
  config: LCPImageConfig = {}
): string {
  if (!originalUrl || typeof originalUrl !== 'string') return originalUrl;

  const { quality = 60, format = 'webp' } = config;

  // For Unsplash images, use their optimization API
  if (originalUrl.includes('images.unsplash.com')) {
    const url = new URL(originalUrl);
    url.searchParams.set('w', '300');
    url.searchParams.set('h', '300');
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('q', quality.toString());
    url.searchParams.set('fm', format);
    return url.toString();
  }

  // For Firebase Storage images, use our optimization
  if (originalUrl.includes('storage.googleapis.com')) {
    const urlParts = originalUrl.split('?')[0];
    const extension = urlParts.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')) {
      const optimizedUrl = urlParts.replace(
        new RegExp(`\\.${extension}$`, 'i'),
        `.${format}`
      );
      return optimizedUrl;
    }
  }

  return originalUrl;
}

/**
 * Generate responsive image URLs for LCP optimization
 */
export function generateLCPResponsiveUrls(
  originalUrl: string,
  config: LCPImageConfig = {}
): { [size: number]: string } {
  if (!originalUrl || typeof originalUrl !== 'string') return {};

  const { format = 'webp', quality = 60 } = config;
  const sizes = [150, 300, 600, 900]; // LCP-optimized sizes
  const responsiveUrls: { [size: number]: string } = {};

  // For Unsplash images
  if (originalUrl.includes('images.unsplash.com')) {
    sizes.forEach(size => {
      const url = new URL(originalUrl);
      url.searchParams.set('w', size.toString());
      url.searchParams.set('h', size.toString());
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('fm', format);
      responsiveUrls[size] = url.toString();
    });
    return responsiveUrls;
  }

  // For Firebase Storage images
  if (originalUrl.includes('storage.googleapis.com')) {
    const urlParts = originalUrl.split('?')[0];
    const extension = urlParts.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')) {
      const baseName = urlParts.replace(
        new RegExp(`\\.${extension}$`, 'i'),
        ''
      );
      
      sizes.forEach(size => {
        responsiveUrls[size] = `${baseName}-${size}.${format}`;
      });
    }
  }

  return responsiveUrls;
}

/**
 * Generate srcSet for LCP-optimized images
 */
export function generateLCPSrcSet(
  originalUrl: string,
  config: LCPImageConfig = {}
): string {
  const responsiveUrls = generateLCPResponsiveUrls(originalUrl, config);
  const sizes = Object.keys(responsiveUrls).map(Number).sort((a, b) => a - b);
  
  return sizes
    .map(size => `${responsiveUrls[size]} ${size}w`)
    .join(', ');
}

/**
 * Optimize image data specifically for LCP
 */
export function optimizeLCPImage(
  image: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    priority?: boolean;
    blurDataURL?: string;
  },
  config: LCPImageConfig = {}
): LCPImageResult {
  const {
    quality = 60,
    format = 'webp',
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    priority = true,
    preload = true,
    placeholder = 'blur',
    blurDataURL,
  } = config;

  // Generate optimized URL
  const optimizedSrc = generateLCPOptimizedUrl(image.src, { quality, format });
  
  // Generate srcSet for responsive images
  const srcSet = generateLCPSrcSet(image.src, { quality, format });
  
  // Determine if this should be preloaded
  const shouldPreload = preload && (
    priority || 
    CRITICAL_LCP_IMAGES.some(criticalUrl => image.src.includes(criticalUrl))
  );

  return {
    src: optimizedSrc,
    srcSet: srcSet || undefined,
    sizes,
    alt: image.alt,
    width: image.width,
    height: image.height,
    priority: image.priority || priority,
    placeholder,
    blurDataURL: image.blurDataURL || blurDataURL,
    preloadUrl: shouldPreload ? optimizedSrc : undefined,
  };
}

/**
 * Preload critical LCP images immediately
 */
export function preloadCriticalLCPImages(): void {
  if (typeof window === 'undefined') return;

  CRITICAL_LCP_IMAGES.forEach(url => {
    const optimizedUrl = generateLCPOptimizedUrl(url, { quality: 60, format: 'webp' });
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizedUrl;
    link.setAttribute('fetchPriority', 'high');
    document.head.appendChild(link);
  });

  console.log('🚀 Critical LCP images preloaded');
}

/**
 * Preload specific LCP image
 */
export function preloadLCPImage(url: string, config: LCPImageConfig = {}): void {
  if (typeof window === 'undefined') return;

  const optimizedUrl = generateLCPOptimizedUrl(url, config);
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = optimizedUrl;
  link.setAttribute('fetchPriority', 'high');
  document.head.appendChild(link);
}

/**
 * Batch preload multiple LCP images
 */
export function preloadLCPImages(urls: string[], config: LCPImageConfig = {}): void {
  urls.forEach(url => preloadLCPImage(url, config));
}

/**
 * Hook for LCP-optimized images
 */
export function useLCPOptimizedImage(
  originalUrl: string,
  alt: string,
  config: LCPImageConfig = {}
): LCPImageResult {
  return optimizeLCPImage(
    {
      src: originalUrl,
      alt,
    },
    config
  );
}

/**
 * Initialize LCP image optimization
 */
export function initializeLCPImageOptimization(): void {
  if (typeof window === 'undefined') return;

  // Preload critical LCP images immediately
  preloadCriticalLCPImages();

  // Add LCP image optimization to window for global access
  (window as any).preloadLCPImage = preloadLCPImage;
  (window as any).preloadLCPImages = preloadLCPImages;
  (window as any).optimizeLCPImage = optimizeLCPImage;

  console.log('🚀 LCP image optimization initialized');
}
