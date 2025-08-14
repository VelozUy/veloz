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
  priority?: boolean;
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDirection, setCurrentDirection] = useState(direction);
  const [isLoaded, setIsLoaded] = useState(false);
  const [priorityImagesLoaded, setPriorityImagesLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Performance optimization: Load 3 priority images first, then rest
  const priorityImageCount = 3;
  const totalImageCount = 10;

  // Performance optimization: Load priority images first
  const loadPriorityImages = useCallback(async () => {
    try {
      // Load only 3 priority images first
      const priorityImages = getCarouselImages(
        locale,
        seed,
        priorityImageCount
      );
      console.log(
        'Debug: Loaded',
        priorityImages.length,
        'priority images for carousel:',
        seed
      );
      setImages(priorityImages);
      setPriorityImagesLoaded(true);
      setLoading(false);
    } catch (error) {
      console.error('Error loading priority images, using fallback:', error);
      // Performance optimization: 3 priority fallback images
      const priorityFallbackImages: GalleryImage[] = [
        {
          id: 'static-1',
          url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=300&fit=crop&q=50&fm=webp',
          alt: 'Event photography',
        },
        {
          id: 'static-2',
          url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=300&fit=crop&q=50&fm=webp',
          alt: 'Wedding photography',
        },
        {
          id: 'static-3',
          url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300&h=300&fit=crop&q=50&fm=webp',
          alt: 'Corporate event photography',
        },
      ];
      setImages(priorityFallbackImages);
      setPriorityImagesLoaded(true);
      setLoading(false);
    }
  }, [locale, seed]);

  // Load remaining images after priority images are loaded
  const loadRemainingImages = useCallback(async () => {
    if (!priorityImagesLoaded) return;

    try {
      // Load full set of images (at least 10)
      const allImages = getCarouselImages(locale, seed, totalImageCount);
      console.log(
        'Debug: Loaded',
        allImages.length,
        'total images for carousel:',
        seed
      );
      setImages(allImages);
    } catch (error) {
      console.error('Error loading remaining images:', error);
      // Keep priority images if loading fails
    }
  }, [locale, seed, priorityImagesLoaded]);

  // Load priority images immediately
  useEffect(() => {
    loadPriorityImages();
  }, [loadPriorityImages]);

  // Load remaining images after priority images are loaded
  useEffect(() => {
    if (priorityImagesLoaded) {
      // Performance optimization: Use requestIdleCallback for non-critical loading
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(() => loadRemainingImages(), { timeout: 2000 });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(loadRemainingImages, 100);
      }
    }
  }, [loadRemainingImages, priorityImagesLoaded]);

  // Performance optimization: Optimized animation with reduced FPS
  useEffect(() => {
    if (!images.length) return;

    let lastTime = 0;
    const targetFPS = 30; // Reduced FPS for better performance
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

        // Performance optimization: Simplified bounce detection without duplicates
        const maxScroll = container.scrollWidth - container.clientWidth;

        if (currentDirection === 'left' && container.scrollLeft <= 0) {
          setCurrentDirection('right');
        } else if (
          currentDirection === 'right' &&
          container.scrollLeft >= maxScroll
        ) {
          setCurrentDirection('left');
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    // Performance optimization: Start animation after priority images are loaded
    const startAnimation = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        // Start from beginning since we don't have duplicates
        container.scrollLeft = 0;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    // Performance optimization: Start animation after a short delay
    const timeoutId = setTimeout(startAnimation, 200);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentDirection, speed, images.length, seed]);

  // Performance optimization: Early return for loading state
  if (loading) {
    return (
      <div
        className={`${height} overflow-hidden`}
        style={{ backgroundColor: 'hsl(var(--background))' }}
      >
        {/* Loading state with matching background color */}
      </div>
    );
  }

  if (!images.length) {
    return (
      <div
        className={`${height} overflow-hidden flex items-center justify-center`}
        style={{ backgroundColor: 'hsl(var(--background))' }}
      >
        <div className="text-muted-foreground">No images available</div>
      </div>
    );
  }

  return (
    <div className={`${height} overflow-hidden bg-background relative`}>
      <div
        ref={containerRef}
        className="flex h-full transition-all duration-1000 ease-in-out"
        style={{
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Performance optimization: No duplicates - only unique images with animation */}
        {images.map((image, index) => (
          <div
            key={`${image.id}-${index}`}
            className="flex-shrink-0 w-80 h-full relative mx-1 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
            data-image-id={`${image.id}-${index}`}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <OptimizedImage
              src={image.url}
              alt={image.alt || 'Gallery image'}
              fill
              className="object-cover rounded-lg transition-all duration-300"
              loading={index < 3 ? 'eager' : 'lazy'} // Performance: First 3 images eager
              priority={priority && index < 2} // Performance: First 2 images priority
              quality={70} // Performance: Good quality for variety
              sizes="320px"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>
        ))}
      </div>
    </div>
  );
}
