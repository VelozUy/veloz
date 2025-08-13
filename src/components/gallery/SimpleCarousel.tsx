'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getCarouselImages, type GalleryImage } from '@/lib/gallery-utils';

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
  const [isLoading, setIsLoading] = useState(true);
  const [currentDirection, setCurrentDirection] = useState(direction);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const bounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Optimize image count based on priority
  const imageCount = useMemo(() => {
    return priority ? 8 : 6; // Reduce initial load for better performance
  }, [priority]);

  // Load images based on seed and locale
  useEffect(() => {
    const loadImages = async () => {
      try {
        // Load project images from JSON files (reduced count for better performance)
        const projectImages = getCarouselImages(locale, seed, imageCount);

        console.log(
          `Loading carousel images for seed: ${seed}, locale: ${locale}, count: ${imageCount}`
        );
        console.log(`Found ${projectImages.length} project images`);

        if (projectImages.length > 0) {
          setImages(projectImages);
        } else {
          // Fallback to placeholder images if no project images found
          const placeholderImages: GalleryImage[] = [
            {
              id: '1',
              url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=300&fit=crop&q=60',
              alt: 'Event photography',
            },
            {
              id: '2',
              url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=300&fit=crop&q=60',
              alt: 'Wedding photography',
            },
            {
              id: '3',
              url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300&h=300&fit=crop&q=60',
              alt: 'Corporate event',
            },
          ];
          setImages(placeholderImages);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading gallery images:', error);
        setIsLoading(false);
      }
    };

    loadImages();
  }, [seed, locale, imageCount]);

  // Handle individual image loading
  const handleImageLoad = useCallback((imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  }, []);

  // Handle image load error
  const handleImageError = useCallback((imageId: string) => {
    // Error handling can be added here if needed
  }, []);

  // Intersection Observer for progressive loading
  useEffect(() => {
    if (!images.length || typeof window === 'undefined') return;

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
      isLoading,
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
  }, [currentDirection, speed, images.length, isLoading, seed]);

  if (isLoading) {
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
        {[...images, ...images].map((image, index) => {
          const imageKey = `${image.id}-${index}`;
          const isLoaded = loadedImages.has(imageKey);
          const isVisible = visibleImages.has(imageKey);

          return (
            <div
              key={imageKey}
              data-image-id={imageKey}
              className="flex-shrink-0 h-full flex items-center justify-center"
              style={{ width: '300px' }}
            >
              <div
                className="relative w-full h-full flex items-center justify-center"
                style={{ aspectRatio: '1/1' }}
              >
                {/* Loading placeholder */}
                <div
                  className={cn(
                    'w-full h-full bg-muted transition-all duration-1000 ease-in-out',
                    isLoaded ? 'opacity-0' : 'opacity-100'
                  )}
                />

                {/* Optimized Next.js Image */}
                {isVisible && (
                  <Image
                    src={image.url}
                    alt={image.alt || 'Gallery image'}
                    fill
                    className={cn(
                      'object-cover transition-all duration-1000 ease-in-out',
                      isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
                    )}
                    loading={index < 4 ? 'eager' : 'lazy'}
                    priority={priority && index < 4}
                    quality={75} // Reduced quality for better performance
                    sizes="300px"
                    onLoad={() => handleImageLoad(imageKey)}
                    onError={() => handleImageError(imageKey)}
                    placeholder="blur"
                    blurDataURL={
                      image.blurDataURL ||
                      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
                    }
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
