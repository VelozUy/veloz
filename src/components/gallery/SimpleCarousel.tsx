'use client';

import { useMemo, useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { getStaticContent } from '@/lib/utils';

interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  alt: string;
  width: number;
  height: number;
  projectTitle: string;
}

interface SimpleCarouselProps {
  className?: string;
  height?: string;
  speed?: number; // pixels per frame
  locale?: string;
  seed?: string;
  direction?: 'left' | 'right'; // Initial direction
}

export default function SimpleCarousel({
  className = '',
  height = 'h-full',
  speed = 0.5,
  locale = 'es',
  seed = 'default',
  direction = 'left', // 'left' or 'right' for initial direction
}: SimpleCarouselProps) {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [currentDirection, setCurrentDirection] = useState(
    direction === 'left' ? -1 : 1
  ); // 1 for right, -1 for left
  const [isInitialized, setIsInitialized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [visibleImages, setVisibleImages] = useState<number>(0);
  const [imageStates, setImageStates] = useState<{ [key: string]: boolean }>(
    {}
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Get static content for the specified locale
  const content = getStaticContent(locale);

  // Collect all media from published projects
  const allMedia = useMemo(() => {
    if (!content || !content.content || !content.content.projects) {
      return [];
    }

    const projects = content.content.projects || [];
    const publishedProjects = projects.filter(
      project => project.status === 'published'
    );

    const media: MediaItem[] = [];

    publishedProjects.forEach(project => {
      if (!project || !project.title) {
        return;
      }

      if (project.media && Array.isArray(project.media)) {
        project.media.forEach(item => {
          if (item && item.id && item.url && item.type && project.title) {
            media.push({
              id: item.id,
              url: item.url,
              type: item.type as 'photo' | 'video',
              alt: `${project.title} - ${item.type}`,
              width: item.width || 800,
              height: item.height || 600,
              projectTitle: project.title,
            });
          }
        });
      }
    });

    // Shuffle with seed
    const seededRandom = (seed: string) => {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return () => {
        hash = (hash * 9301 + 49297) % 233280;
        return hash / 233280;
      };
    };

    const random = seededRandom(seed);
    return media.sort(() => random() - 0.5);
  }, [content, seed]);

  // Progressive image fade-in - start after main content loads
  useEffect(() => {
    const timer = setTimeout(() => {
      // Fade in all images progressively
      allMedia.forEach((item, index) => {
        setTimeout(() => {
          setImageStates(prevStates => ({
            ...prevStates,
            [`${item.id}-${index}`]: true,
          }));
        }, index * 200);
      });
    }, 2000); // Wait 2 seconds after component mounts

    return () => clearTimeout(timer);
  }, [allMedia.length]);

  // Intersection Observer to pause animation when not visible
  useEffect(() => {
    // Temporarily disable intersection observer to prevent issues
    setIsVisible(true);

    // const observer = new IntersectionObserver(
    //   ([entry]) => {
    //     setIsVisible(entry.isIntersecting);
    //   },
    //   { threshold: 0.1 }
    // );

    // if (containerRef.current) {
    //   observer.observe(containerRef.current);
    // }

    // return () => observer.disconnect();
  }, []);

  // Initialize position for right direction
  useEffect(() => {
    if (direction === 'right' && !isInitialized && containerRef.current) {
      const maxScroll = -(
        allMedia.length * 200 -
        (containerRef.current.clientWidth || 0)
      );
      setCurrentPosition(maxScroll);
      setIsInitialized(true);
    }
  }, [direction, isInitialized, allMedia.length]);

  // Animation loop
  useEffect(() => {
    if (!isVisible) return;

    const animate = () => {
      setCurrentPosition(prev => {
        const newPosition = prev + currentDirection * speed;

        // Bounce back when reaching edges
        if (newPosition > 0) {
          setCurrentDirection(-1);
          return 0;
        }

        const maxScroll = -(
          allMedia.length * 200 -
          (containerRef.current?.clientWidth || 0)
        );
        if (newPosition < maxScroll) {
          setCurrentDirection(1);
          return maxScroll;
        }

        return newPosition;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, currentDirection, speed, allMedia.length]);

  if (allMedia.length === 0) {
    return (
      <div
        className={`${height} ${className} bg-background flex items-center justify-center`}
      >
        <div className="text-muted-foreground">No media available</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${height} ${className} relative overflow-hidden bg-background`}
    >
      <div
        className="absolute inset-0 flex items-center py-4"
        style={{
          transform: `translateX(${currentPosition}px)`,
          transition: 'transform 0.1s ease-linear',
          gap: '-5px',
        }}
      >
        {allMedia.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex-shrink-0 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 p-6"
            style={{ marginRight: '-1px' }}
          >
            <div className="w-full h-full relative overflow-hidden rounded-lg">
              <Image
                src={item.url}
                alt={item.alt}
                fill
                className={`object-cover transition-all duration-1500 ease-out ${
                  imageStates[`${item.id}-${index}`]
                    ? 'opacity-100 blur-0'
                    : 'opacity-0 blur-lg'
                }`}
                sizes="(max-width: 768px) 192px, (max-width: 1024px) 256px, 320px"
                priority={index < 3}
                onLoad={() => {
                  // Ensure image is marked as loaded when it actually loads
                  if (!imageStates[`${item.id}-${index}`]) {
                    setImageStates(prev => ({
                      ...prev,
                      [`${item.id}-${index}`]: true,
                    }));
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
