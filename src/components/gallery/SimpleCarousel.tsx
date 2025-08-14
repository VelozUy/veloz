'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getCarouselImages, type GalleryImage } from '@/lib/gallery-utils';
import { OptimizedImage } from '@/components/shared';

interface SimpleCarouselProps {
  height: string;
  speed: number;
  locale: string;
  seed: string;
  direction?: 'left' | 'right';
  priority?: boolean; // New prop for priority loading
}

export default function SimpleCarousel({
  height,
  speed,
  locale,
  seed,
  direction = 'left',
  priority = false,
}: SimpleCarouselProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDirection, setCurrentDirection] = useState(direction);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const bounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Optimize image count based on priority - Balanced approach
  const imageCount = useMemo(() => {
    return priority ? 3 : 4; // Balanced image count
  }, [priority]);

  // Load images based on seed and locale
  useEffect(() => {
    const loadImages = async () => {
      try {
        // LCP Optimization: Use static fallback images for immediate loading
        const staticFallbackImages: GalleryImage[] = [
          {
            id: 'static-1',
            url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=300&fit=crop&q=60&fm=webp',
            alt: 'Event photography',
          },
          {
            id: 'static-2',
            url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=300&fit=crop&q=60&fm=webp',
            alt: 'Wedding photography',
          },
          {
            id: 'static-3',
            url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300&h=300&fit=crop&q=60&fm=webp',
            alt: 'Portrait photography',
          },
        ];

        // For priority carousels, use static images immediately for LCP
        if (priority) {
          setImages(staticFallbackImages);
          setLoading(false);
          return;
        }

        // For non-priority carousels, load dynamic images
        const loadedImages = await getCarouselImages(seed, locale, imageCount);
        setImages(loadedImages);
        setLoading(false);
      } catch (error) {
        console.error('Error loading images:', error);
        // Fallback to static images on error
        const staticFallbackImages: GalleryImage[] = [
          {
            id: 'static-1',
            url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=300&fit=crop&q=60&fm=webp',
            alt: 'Event photography',
          },
        ];
        setImages(staticFallbackImages);
        setLoading(false);
      }
    };

    loadImages();
  }, [seed, locale, imageCount, priority]);

  // Handle individual image loading
  const handleImageLoad = useCallback((imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  }, []);

  // Handle image load error
  const handleImageError = useCallback((imageId: string) => {
    // Error handling can be added here if needed
  }, []);

  // Intersection Observer for progressive loading - TBT Optimization
  useEffect(() => {
    if (!images.length || typeof window === 'undefined') return;

    // LCP: Make first 2 images visible immediately for better performance
    const immediateVisibleImages = new Set<string>();
    for (let i = 0; i < Math.min(2, images.length); i++) {
      immediateVisibleImages.add(`${images[i].id}-0`); // First set only
      immediateVisibleImages.add(`${images[i].id}-1`); // Second set (duplicated)
    }
    setVisibleImages(immediateVisibleImages);

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const imageId = entry.target.getAttribute('data-image-id');
            if (imageId) {
              setVisibleImages(prev => new Set([...prev, imageId]));
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1,
      }
    );

    // Observe all image containers
    const imageContainers =
      containerRef.current?.querySelectorAll('[data-image-id]');
    imageContainers?.forEach(container => {
      observer.observe(container);
    });

    return () => observer.disconnect();
  }, [images.length]);

  // Bouncing effect - change direction when reaching the end
  useEffect(() => {
    if (!images.length) return;

    // Calculate when the last image of the first set enters the screen
    const singleImageSetWidth = images.length * 300; // 6-8 images * 300px each
    const viewportWidth = 300; // Each image is 300px wide

    const checkForBounce = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const currentScrollLeft = container.scrollLeft;

        // Bounce when the last image of the first set enters the screen
        const bouncePoint = singleImageSetWidth - viewportWidth;

        if (currentDirection === 'right' && currentScrollLeft >= bouncePoint) {
          setCurrentDirection('left');
          console.log(
            `Carousel ${seed} bouncing when last image enters: right → left`
          );
        } else if (
          currentDirection === 'left' &&
          currentScrollLeft <= 0 &&
          currentScrollLeft > -10
        ) {
          setCurrentDirection('right');
          console.log(`Carousel ${seed} bouncing at start: left → right`);
        }
      }
    };

    // Check for bounce every 200ms (reduced frequency for better performance)
    const bounceCheckInterval = setInterval(checkForBounce, 200);

    return () => {
      clearInterval(bounceCheckInterval);
    };
  }, [images.length, currentDirection, seed]);

  // Animation loop with performance optimization
  useEffect(() => {
    if (!images.length) return;

    console.log(`Starting animation for carousel ${seed}:`, {
      imagesLength: images.length,
      currentDirection,
      speed,
      isLoading: loading,
    });

    let lastTime = 0;
    const targetFPS = 30; // Reduce FPS for better performance
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      if (currentTime - lastTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      lastTime = currentTime;

      if (containerRef.current) {
        const container = containerRef.current;
        const scrollAmount = currentDirection === 'left' ? -1 : 1;

        container.scrollLeft += scrollAmount * speed;

        // Debug scroll position (reduced frequency to improve performance)
        if (Math.random() < 0.0005) {
          // Reduced from 0.001 to 0.0005
          console.log(
            `Carousel ${seed} scrolling: scrollLeft=${container.scrollLeft}, scrollWidth=${container.scrollWidth}, direction=${currentDirection}`
          );
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    // Set initial scroll position based on direction
    if (containerRef.current) {
      const container = containerRef.current;
      if (currentDirection === 'left') {
        container.scrollLeft = container.scrollWidth / 3;
      } else {
        container.scrollLeft = 0;
      }
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentDirection, speed, images.length, loading, seed]);

  if (loading) {
    return (
      <div className={`${height} overflow-hidden bg-background`}>
        {/* Empty loading state - no spinner */}
      </div>
    );
  }

  if (!images.length) {
    return (
      <div
        className={`${height} overflow-hidden bg-background flex items-center justify-center`}
      >
        <div className="text-muted-foreground">No images available</div>
      </div>
    );
  }

  return (
    <div className={`${height} overflow-hidden bg-background`}>
      <div
        ref={containerRef}
        className="flex h-full transition-all duration-1000 ease-in-out"
        style={{ overflowX: 'hidden' }}
      >
        {/* Duplicate images for seamless loop - reduced to 2 sets for better performance */}
        {images.map((image, index) => {
          return (
            <div
              key={`${image.id}-${index}`}
              className={cn(
                'absolute inset-0 transition-opacity duration-1000',
                visibleImages.has(`${image.id}-${index}`)
                  ? 'opacity-100'
                  : 'opacity-0'
              )}
            >
              <OptimizedImage
                src={image.url}
                alt={image.alt || 'Gallery image'}
                fill
                className={cn(
                  'object-cover transition-all duration-1000',
                  isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
                )}
                loading={index < 2 ? 'eager' : 'lazy'} // LCP: Load first 2 images eagerly
                priority={priority && index < 2} // LCP: Priority for first 2 images
                fetchPriority={priority && index < 2 ? 'high' : 'auto'} // LCP: High priority for first 2 images
                quality={75} // Reduced quality for better performance
                sizes="300px"
                onLoad={() => setIsLoaded(true)}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
