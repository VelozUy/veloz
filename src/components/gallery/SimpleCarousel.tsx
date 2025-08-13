'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { getCarouselImages, type GalleryImage } from '@/lib/gallery-utils';

interface SimpleCarouselProps {
  height: string;
  speed: number;
  locale: string;
  seed: string;
  direction?: 'left' | 'right';
}

export default function SimpleCarousel({
  height,
  speed,
  locale,
  seed,
  direction = 'left',
}: SimpleCarouselProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDirection, setCurrentDirection] = useState(direction);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const bounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load images based on seed and locale
  useEffect(() => {
    const loadImages = async () => {
      try {
        // Load project images from JSON files (reduced count for better performance)
        const projectImages = getCarouselImages(locale, seed, 12);

        console.log(
          `Loading carousel images for seed: ${seed}, locale: ${locale}`
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
            {
              id: '4',
              url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=300&fit=crop&q=60',
              alt: 'Event photography',
            },
            {
              id: '5',
              url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=300&fit=crop&q=60',
              alt: 'Wedding photography',
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
  }, [seed, locale]);

  // Handle individual image loading
  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  };

  // Bouncing effect - change direction when reaching the end
  useEffect(() => {
    if (!images.length) return; // Only check for images, not loading state

    // Calculate when the last image of the first set enters the screen
    const singleImageSetWidth = images.length * 300; // 12 images * 300px each
    const viewportWidth = 300; // Each image is 300px wide

    const checkForBounce = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const currentScrollLeft = container.scrollLeft;

        // Bounce when the last image of the first set enters the screen
        // This happens when we've scrolled enough to show the last image
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
          // Only bounce if we've actually scrolled left (not just at the start)
          setCurrentDirection('right');
          console.log(`Carousel ${seed} bouncing at start: left → right`);
        }
      }
    };

    // Check for bounce every 100ms
    const bounceCheckInterval = setInterval(checkForBounce, 100);

    return () => {
      clearInterval(bounceCheckInterval);
    };
  }, [images.length, currentDirection, seed]);

  // Animation loop
  useEffect(() => {
    if (!images.length) return; // Only check for images, not loading state

    console.log(`Starting animation for carousel ${seed}:`, {
      imagesLength: images.length,
      currentDirection,
      speed,
      isLoading,
    });

    const animate = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const scrollAmount = currentDirection === 'left' ? -1 : 1;

        container.scrollLeft += scrollAmount * speed;

        // Debug scroll position (reduced frequency to improve performance)
        if (Math.random() < 0.001) {
          // Log 0.1% of the time to reduce performance impact
          console.log(
            `Carousel ${seed} scrolling: scrollLeft=${container.scrollLeft}, scrollWidth=${container.scrollWidth}, direction=${currentDirection}`
          );
        }

        // No need for manual reset - bouncing is handled by the bounce effect
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    // Set initial scroll position based on direction
    if (containerRef.current) {
      const container = containerRef.current;
      if (currentDirection === 'left') {
        // Start from the end for left-moving carousel
        container.scrollLeft = container.scrollWidth / 3;
      } else {
        // Start from the beginning for right-moving carousel
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
        {/* Duplicate images for seamless loop */}
        {[...images, ...images, ...images].map((image, index) => {
          const imageKey = `${image.id}-${index}`;
          const isLoaded = loadedImages.has(imageKey);

          return (
            <div
              key={imageKey}
              className="flex-shrink-0 h-full flex items-center justify-center"
              style={{ width: '300px' }} // Fixed width for each image
            >
              <div
                className="relative w-full h-full flex items-center justify-center"
                style={{ aspectRatio: '1/1' }}
              >
                <div
                  className={`w-full h-full bg-muted transition-all duration-1000 ease-in-out ${
                    isLoaded ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <img
                  src={image.url}
                  alt={image.alt || 'Gallery image'}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                    isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
                  }`}
                  loading="lazy"
                  decoding="async"
                  onLoad={() => handleImageLoad(imageKey)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
