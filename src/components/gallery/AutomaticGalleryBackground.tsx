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

interface AutomaticGalleryBackgroundProps {
  className?: string;
  speed?: number; // pixels per frame
  height?: string;
  showOverlay?: boolean;
  overlayOpacity?: number;
  pauseOnHover?: boolean;
  showProjectTitles?: boolean;
  locale?: string;
  direction?: 'left' | 'right'; // Direction of movement
  seed?: string; // Seed for randomization to ensure different orders
}

export default function AutomaticGalleryBackground({
  className = '',
  speed = 1,
  height = 'h-screen',
  showOverlay = true,
  overlayOpacity = 0.3,
  pauseOnHover = true,
  showProjectTitles = false,
  locale = 'es',
  direction = 'left',
  seed = 'default',
}: AutomaticGalleryBackgroundProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get static content for the specified locale
  const content = getStaticContent(locale);

  // Collect all media from published projects and randomize them
  const allMedia = useMemo(() => {
    const projects = content.content.projects || [];
    const publishedProjects = projects.filter(
      project => project.status === 'published'
    );

    const media: MediaItem[] = [];

    publishedProjects.forEach(project => {
      if (project.media && Array.isArray(project.media)) {
        project.media.forEach(item => {
          media.push({
            id: item.id,
            url: item.url,
            type: item.type as 'photo' | 'video',
            alt: `${project.title} - ${item.type}`,
            width: item.width || 800,
            height: item.height || 600,
            projectTitle: project.title,
          });
        });
      }
    });

    // Create a seeded random number generator
    const seededRandom = (seed: string) => {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return () => {
        hash = (hash * 9301 + 49297) % 233280;
        return hash / 233280;
      };
    };

    // Shuffle the media array using seeded randomization
    const shuffledMedia = [...media];
    const random = seededRandom(seed);
    for (let i = shuffledMedia.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffledMedia[i], shuffledMedia[j]] = [
        shuffledMedia[j],
        shuffledMedia[i],
      ];
    }

    return shuffledMedia;
  }, [content, locale, seed]);

  // Intersection Observer to pause when not visible
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    if (!isPlaying || !isVisible) return;

    let animationId: number;
    let lastTime = 0;

    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= 16) {
        // Cap at ~60fps
        setScrollPosition(prev => {
          // Calculate total width of all items
          const totalWidth = allMedia.length * 400; // 400px per item including gap
          const maxScroll = Math.max(
            0,
            totalWidth - (containerRef.current?.offsetWidth || 0)
          );

          if (direction === 'left') {
            // Move left to right (default)
            if (prev >= maxScroll) {
              return 0;
            }
            return prev + speed;
          } else {
            // Move right to left
            if (prev <= 0) {
              return maxScroll;
            }
            return prev - speed;
          }
        });
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, isVisible, allMedia.length, speed, direction]);

  // Pause on hover
  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPlaying(false);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPlaying(true);
    }
  };

  // If no media available, show fallback
  if (allMedia.length === 0) {
    return (
      <div className={`relative w-full ${height} bg-muted ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">No media available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${height} overflow-hidden bg-background ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Scrolling Gallery */}
      <div
        className="flex gap-4 h-full items-center transition-transform duration-100 ease-linear"
        style={{
          transform: `translateX(-${scrollPosition}px)`,
          width: `${allMedia.length * 400}px`, // 400px per item including gap
        }}
      >
        {allMedia.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex-shrink-0 w-96 h-80 relative group"
          >
            <div className="w-full h-full bg-background rounded-lg overflow-hidden shadow-lg">
              {item.type === 'photo' ? (
                <Image
                  src={item.url}
                  alt={item.alt}
                  width={384}
                  height={320}
                  className="w-full h-full object-cover"
                  sizes="384px"
                  priority={index < 6} // Prioritize first 6 images
                />
              ) : (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              )}

              {/* Project title overlay (optional) */}
              {showProjectTitles && (
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-background text-sm font-medium truncate">
                      {item.projectTitle}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Gradient overlays for smooth edges */}
      <div className="absolute left-0 top-0 w-8 sm:w-16 h-full bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 w-8 sm:w-16 h-full bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />

      {/* Optional overlay for text readability */}
      {showOverlay && (
        <div
          className="absolute inset-0 bg-foreground pointer-events-none z-20"
          style={{ opacity: overlayOpacity }}
        />
      )}
    </div>
  );
}
