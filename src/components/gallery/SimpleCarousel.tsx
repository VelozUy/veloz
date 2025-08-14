'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { loadProjectImages } from '@/lib/gallery-utils';

interface GalleryImage {
  id: string;
  url: string;
  alt?: string;
}

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
  console.log('Debug: SimpleCarousel rendering with props:', { height, speed, locale, seed, direction, priority });
  
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>();

  // Load actual project images
  useEffect(() => {
    console.log('Debug: SimpleCarousel useEffect triggered for image loading:', { seed, locale });
    
    const loadImages = () => {
      try {
        const projectImages = loadProjectImages(locale, seed);
        const carouselImages = projectImages.slice(0, 8); // Get first 8 images
        console.log('Debug: Loaded', carouselImages.length, 'project images for carousel:', seed);
        setImages(carouselImages);
        setLoading(false);
      } catch (error) {
        console.error('Error loading carousel images:', error);
        // Fallback to static images if project images fail to load
        const staticImages: GalleryImage[] = [
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
        setImages(staticImages);
        setLoading(false);
      }
    };

    loadImages();
  }, [seed, locale]);

  // Carousel animation
  useEffect(() => {
    if (!images.length || loading) return;

    const animate = () => {
      if (!containerRef.current) return;

      setIsAnimating(true);
      
      const container = containerRef.current;
      const totalWidth = container.scrollWidth;
      const visibleWidth = container.clientWidth;
      const maxScroll = totalWidth - visibleWidth;
      
      let currentScroll = direction === 'left' ? 0 : maxScroll;
      const scrollStep = speed * 2; // Adjust speed
      
      const animateScroll = () => {
        if (direction === 'left') {
          currentScroll += scrollStep;
          if (currentScroll >= maxScroll) {
            // Bounce at the end
            currentScroll = maxScroll - (currentScroll - maxScroll) * 0.3;
            if (currentScroll <= maxScroll - 50) {
              // Reset to start
              currentScroll = 0;
            }
          }
        } else {
          currentScroll -= scrollStep;
          if (currentScroll <= 0) {
            // Bounce at the end
            currentScroll = Math.abs(currentScroll) * 0.3;
            if (currentScroll >= 50) {
              // Reset to end
              currentScroll = maxScroll;
            }
          }
        }
        
        container.scrollLeft = currentScroll;
        animationRef.current = requestAnimationFrame(animateScroll);
      };
      
      animateScroll();
    };

    // Start animation after a short delay
    const timeoutId = setTimeout(animate, 1000);
    
    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [images, loading, direction, speed]);

  if (loading) {
    return (
      <div className={`${height} overflow-hidden bg-background flex items-center justify-center`}>
        <div className="text-muted-foreground">Loading carousel...</div>
      </div>
    );
  }

  if (!images.length) {
    return (
      <div className={`${height} overflow-hidden bg-background flex items-center justify-center`}>
        <div className="text-muted-foreground">No images available</div>
      </div>
    );
  }

  console.log('Debug: Carousel', seed, 'rendering with', images.length, 'images');
  
  return (
    <div className={`${height} overflow-hidden bg-background relative`}>
      <div
        ref={containerRef}
        className="flex h-full overflow-x-auto scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className="flex-shrink-0 w-80 h-full relative mx-1"
          >
            <Image
              src={image.url}
              alt={image.alt || 'Gallery image'}
              fill
              className="object-cover rounded-lg"
              loading={index < 2 ? 'eager' : 'lazy'}
              priority={priority && index < 2}
              quality={80}
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
