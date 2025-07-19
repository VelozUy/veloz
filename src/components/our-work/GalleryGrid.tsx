'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export interface ProjectMedia {
  id: string;
  projectId: string;
  type: 'photo' | 'video';
  url: string;
  description?: Record<string, string>;
  tags?: string[];
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5';
  width?: number;
  height?: number;
  order: number;
  blurDataURL?: string;
  poster?: string;
}

interface GalleryGridProps {
  media: ProjectMedia[];
  projectTitle: string;
  layout?: 'masonry' | 'grid' | 'timeline';
  columns?: number;
  gap?: number;
  className?: string;
}

/**
 * GalleryGrid Component
 *
 * Modern portfolio-quality gallery grid with masonry layout.
 * Implements responsive design with optimized image loading.
 *
 * Features:
 * - Responsive columns (4 desktop → 3 tablet → 2 mobile → 1 small mobile)
 * - Masonry layout for dynamic presentation
 * - Image optimization with Next.js Image component
 * - Hover effects and animations
 * - GLightbox integration for full-screen viewing
 * - Lazy loading with Intersection Observer
 * - Progressive image loading with blur-up effects
 */
export default function GalleryGrid({
  media,
  projectTitle,
  layout = 'masonry',
  columns = 4,
  gap = 6,
  className = '',
}: GalleryGridProps) {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Sort media by order
  const sortedMedia = useMemo(() => {
    return [...media].sort((a, b) => a.order - b.order);
  }, [media]);

  // Initialize Intersection Observer for lazy loading
  useEffect(() => {
    if (typeof window === 'undefined') return;

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const itemId = entry.target.getAttribute('data-item-id');
            if (itemId) {
              setVisibleItems(prev => new Set([...prev, itemId]));
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Observe gallery items
  useEffect(() => {
    if (!observerRef.current) return;

    const items = document.querySelectorAll('[data-item-id]');
    items.forEach(item => {
      observerRef.current?.observe(item);
    });

    return () => {
      items.forEach(item => {
        observerRef.current?.unobserve(item);
      });
    };
  }, [sortedMedia]);

  if (!sortedMedia.length) {
    return (
      <div
        className={className}
        style={{
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p className="text-muted-foreground">No media available</p>
      </div>
    );
  }

  // Responsive breakpoints for columns
  const breakpointColumnsObj = {
    default: columns,
    1200: Math.min(columns, 3),
    900: Math.min(columns, 2),
    600: 1,
  };

  // Calculate aspect ratio for responsive sizing
  const getAspectRatio = (media: ProjectMedia) => {
    if (media.width && media.height) {
      return media.width / media.height;
    }

    // Fallback to aspectRatio property
    switch (media.aspectRatio) {
      case '16:9':
        return 16 / 9;
      case '9:16':
        return 9 / 16;
      case '4:5':
        return 4 / 5;
      case '1:1':
      default:
        return 1;
    }
  };

  // Determine grid span based on aspect ratio
  const getGridSpan = (media: ProjectMedia) => {
    const aspectRatio = getAspectRatio(media);

    if (aspectRatio > 1.5) {
      // Wide images span 2 columns
      return 'col-span-1 md:col-span-2';
    } else if (aspectRatio < 0.7) {
      // Tall images can span 2 rows
      return 'col-span-1 row-span-2';
    }

    return 'col-span-1';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Gallery Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
          Galería del Proyecto
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explora los momentos capturados en {projectTitle}
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {sortedMedia.map((item, index) => {
          const aspectRatio = getAspectRatio(item);
          const gridSpan = getGridSpan(item);
          const paddingBottom = `${(1 / aspectRatio) * 100}%`;
          const isVisible = visibleItems.has(item.id);

          return (
            <motion.div
              key={item.id}
              data-item-id={item.id}
              className={`group cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] hover:brightness-110 hover:shadow-lg ${gridSpan}`}
              style={{
                width: '100%',
                position: 'relative',
                paddingBottom,
                margin: 0,
                overflow: 'hidden',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* GLightbox link - covers entire item */}
              <a
                href={item.url}
                className="absolute inset-0 glightbox z-10"
                data-gallery={`project-${item.projectId}`}
                data-type={item.type === 'video' ? 'video' : 'image'}
                data-effect="fade"
                data-desc={
                  item.description?.es || `${projectTitle} - ${item.type}`
                }
              />

              {/* Media container with hover effects */}
              <figure className="absolute inset-0 group-hover:opacity-90 transition-opacity duration-700">
                {item.type === 'video' ? (
                  <div className="w-full h-full relative overflow-hidden">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      autoPlay
                      poster={item.poster}
                      data-testid={`video-${item.id}`}
                    />
                    {/* Play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={item.url}
                    alt={
                      item.description?.es || `${projectTitle} - ${item.type}`
                    }
                    fill
                    className="object-cover transition-all duration-300 ease-out group-hover:scale-105"
                    sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    priority={index < 4} // Prioritize first 4 images
                    placeholder={item.blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={item.blurDataURL}
                    loading={index < 4 ? 'eager' : 'lazy'}
                    onLoad={() => {
                      // Trigger animation when image loads
                      if (!isVisible) {
                        setVisibleItems(prev => new Set([...prev, item.id]));
                      }
                    }}
                  />
                )}
              </figure>

              {/* Loading skeleton for images not yet visible */}
              {!isVisible && item.type === 'photo' && (
                <div className="absolute inset-0 bg-muted animate-pulse">
                  {item.blurDataURL && (
                    <Image
                      src={item.blurDataURL}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  )}
                </div>
              )}

              {/* Caption overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end">
                <div className="w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-medium truncate">
                    {item.description?.es || `${projectTitle} - ${item.type}`}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Gallery Footer */}
      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          Haz clic en cualquier imagen para ver en pantalla completa
        </p>
      </div>
    </div>
  );
}
