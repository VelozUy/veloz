/**
 * Image Optimization Utilities
 * 
 * Automatically serves optimized WebP images when available,
 * with fallback to original images for better performance.
 */

export interface OptimizedImageConfig {
  quality?: number;
  priority?: boolean;
  sizes?: string;
  placeholder?: 'empty' | 'blur';
  blurDataURL?: string;
}

export interface OptimizedImageResult {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'empty' | 'blur';
  blurDataURL?: string;
}

/**
 * Check if the browser supports WebP format
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return true; // Server-side, assume support
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
}

/**
 * Convert a Firebase Storage URL to its optimized WebP version
 */
export function getOptimizedImageUrl(originalUrl: string): string {
  if (!originalUrl || typeof originalUrl !== 'string') return originalUrl;
  
  // Check if it's already a WebP URL
  if (originalUrl.includes('.webp')) return originalUrl;
  
  // Check if it's a Firebase Storage URL
  if (!originalUrl.includes('storage.googleapis.com')) return originalUrl;
  
  // Convert to optimized WebP URL
  // The optimization script creates .webp versions with the same path structure
  const urlParts = originalUrl.split('?')[0]; // Remove query parameters
  const extension = urlParts.split('.').pop()?.toLowerCase();
  
  // Only convert image formats that can be optimized
  if (!['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')) {
    return originalUrl;
  }
  
  // Replace extension with .webp
  const optimizedUrl = urlParts.replace(new RegExp(`\\.${extension}$`, 'i'), '.webp');
  
  // Add back query parameters if they exist
  const queryParams = originalUrl.includes('?') ? originalUrl.split('?')[1] : '';
  return queryParams ? `${optimizedUrl}?${queryParams}` : optimizedUrl;
}

/**
 * Get responsive image URLs for different screen sizes
 */
export function getResponsiveImageUrls(originalUrl: string): {
  [size: number]: string;
} {
  if (!originalUrl || typeof originalUrl !== 'string') return {};
  
  // Check if it's a Firebase Storage URL
  if (!originalUrl.includes('storage.googleapis.com')) return {};
  
  const urlParts = originalUrl.split('?')[0];
  const extension = urlParts.split('.').pop()?.toLowerCase();
  
  // Only generate responsive URLs for optimizable images
  if (!['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')) return {};
  
  const baseName = urlParts.replace(new RegExp(`\\.${extension}$`, 'i'), '');
  const queryParams = originalUrl.includes('?') ? originalUrl.split('?')[1] : '';
  
  // Generate responsive URLs for common breakpoints
  const sizes = [200, 400, 800, 1200];
  const responsiveUrls: { [size: number]: string } = {};
  
  sizes.forEach(size => {
    const responsiveUrl = `${baseName}-${size}.webp`;
    responsiveUrls[size] = queryParams ? `${responsiveUrl}?${queryParams}` : responsiveUrl;
  });
  
  return responsiveUrls;
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(originalUrl: string): string {
  const responsiveUrls = getResponsiveImageUrls(originalUrl);
  const sizes = Object.keys(responsiveUrls).map(Number).sort((a, b) => a - b);
  
  return sizes
    .map(size => `${responsiveUrls[size]} ${size}w`)
    .join(', ');
}

/**
 * Optimize image data for use in components
 */
export function optimizeImageData(
  image: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    priority?: boolean;
    blurDataURL?: string;
  },
  config: OptimizedImageConfig = {}
): OptimizedImageResult {
  const {
    quality = 85,
    priority = false,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    placeholder = 'empty',
    blurDataURL,
  } = config;
  
  // Get optimized URL
  const optimizedSrc = getOptimizedImageUrl(image.src);
  
  // Generate srcSet for responsive images
  const srcSet = generateSrcSet(image.src);
  
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
  };
}

/**
 * Hook to get optimized image data
 */
export function useOptimizedImage(
  originalUrl: string,
  alt: string,
  config: OptimizedImageConfig = {}
): OptimizedImageResult {
  return optimizeImageData(
    {
      src: originalUrl,
      alt,
    },
    config
  );
}

/**
 * Preload optimized images for critical images
 */
export function preloadOptimizedImage(url: string): void {
  if (typeof window === 'undefined') return; // Server-side
  
  const optimizedUrl = getOptimizedImageUrl(url);
  if (optimizedUrl === url) return; // No optimization available
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = optimizedUrl;
  document.head.appendChild(link);
}

/**
 * Batch preload multiple optimized images
 */
export function preloadOptimizedImages(urls: string[]): void {
  urls.forEach(url => preloadOptimizedImage(url));
}
