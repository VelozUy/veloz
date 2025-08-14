/**
 * LCP (Largest Contentful Paint) Optimization Utilities
 * 
 * Critical performance optimizations to reduce LCP from 8.7s to <2.5s
 * Based on Lighthouse report analysis
 */

export interface LCPOptimizationConfig {
  preloadCount: number;
  fetchPriority: 'high' | 'low' | 'auto';
  loading: 'eager' | 'lazy';
  quality: number;
  format: 'webp' | 'avif' | 'auto';
}

export interface OptimizedImageData {
  src: string;
  alt: string;
  priority: boolean;
  loading: 'eager' | 'lazy';
  fetchPriority: 'high' | 'low' | 'auto';
  sizes: string;
  quality: number;
  format: string;
  blurDataURL?: string;
  width?: number;
  height?: number;
}

/**
 * Optimize image data for LCP improvement
 */
export function optimizeImageForLCP(
  image: any,
  index: number,
  config: Partial<LCPOptimizationConfig> = {}
): OptimizedImageData {
  const {
    preloadCount = 8,
    fetchPriority = 'high',
    loading = 'eager',
    quality = 85,
    format = 'webp'
  } = config;

  const isPriority = index < preloadCount;
  
  return {
    src: image.url || image.src,
    alt: image.alt || image.description?.es || 'Gallery image',
    priority: isPriority,
    loading: isPriority ? 'eager' : loading,
    fetchPriority: isPriority ? 'high' : 'auto',
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    quality,
    format,
    blurDataURL: image.blurDataURL,
    width: image.width,
    height: image.height
  };
}

/**
 * Preload critical images for LCP improvement
 */
export function preloadCriticalImages(imageUrls: string[]): void {
  if (typeof window === 'undefined') return;

  // Preload first 4 critical images
  imageUrls.slice(0, 4).forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  });
}

/**
 * Add critical resource hints for LCP improvement
 */
export function addCriticalResourceHints(): void {
  if (typeof window === 'undefined') return;

  const criticalHints = [
    // Preload critical fonts
    {
      rel: 'preload',
      href: '/redjola/Redjola.ttf',
      as: 'font',
      type: 'font/ttf',
      crossorigin: 'anonymous'
    },
    // DNS prefetch for external resources
    {
      rel: 'dns-prefetch',
      href: 'https://firebasestorage.googleapis.com'
    },
    // Preconnect to Firebase
    {
      rel: 'preconnect',
      href: 'https://firebasestorage.googleapis.com'
    }
  ];

  criticalHints.forEach(hint => {
    const link = document.createElement('link');
    Object.assign(link, hint);
    document.head.appendChild(link);
  });
}

/**
 * Optimize image loading strategy for LCP
 */
export function optimizeImageLoadingStrategy(): void {
  if (typeof window === 'undefined') return;

  // Add loading="eager" to above-the-fold images
  const aboveFoldImages = document.querySelectorAll('img[data-above-fold="true"]');
  aboveFoldImages.forEach(img => {
    (img as HTMLImageElement).loading = 'eager';
    (img as HTMLImageElement).fetchPriority = 'high';
  });

  // Add decoding="async" for better performance
  const allImages = document.querySelectorAll('img');
  allImages.forEach(img => {
    (img as HTMLImageElement).decoding = 'async';
  });
}

/**
 * Implement progressive image loading for LCP
 */
export function implementProgressiveImageLoading(): void {
  if (typeof window === 'undefined') return;

  const images = document.querySelectorAll('img[data-progressive]');
  
  images.forEach(img => {
    const lowResSrc = img.getAttribute('data-low-res');
    const highResSrc = img.getAttribute('data-high-res');
    
    if (lowResSrc && highResSrc) {
      // Start with low-res image
      (img as HTMLImageElement).src = lowResSrc;
      
      // Load high-res image
      const highResImg = new Image();
      highResImg.onload = () => {
        (img as HTMLImageElement).src = highResSrc;
      };
      highResImg.src = highResSrc;
    }
  });
}

/**
 * Optimize Next.js Image component for LCP
 */
export function getOptimizedImageProps(
  image: any,
  index: number,
  isLCP: boolean = false
) {
  const props: any = {
    src: image.url,
    alt: image.alt || image.description?.es || 'Gallery image',
    fill: true,
    priority: isLCP || index < 8,
    loading: isLCP || index < 8 ? 'eager' : 'lazy',
    fetchPriority: isLCP || index < 8 ? 'high' : 'auto',
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    quality: 85,
    placeholder: image.blurDataURL ? 'blur' : 'empty',
    blurDataURL: image.blurDataURL,
  };

  return props;
}

/**
 * Monitor LCP performance
 */
export function monitorLCP(): void {
  if (typeof window === 'undefined') return;

  // Use Performance Observer to track LCP
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    console.log('LCP:', lastEntry.startTime, 'ms');
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: 'LCP',
        value: Math.round(lastEntry.startTime),
      });
    }
  });

  observer.observe({ entryTypes: ['largest-contentful-paint'] });
}

/**
 * Initialize all LCP optimizations
 */
export function initializeLCPOptimizations(): void {
  addCriticalResourceHints();
  optimizeImageLoadingStrategy();
  monitorLCP();
}
