'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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

  // Load images based on seed and locale
  useEffect(() => {
    console.log('Debug: SimpleCarousel useEffect triggered for image loading:', { seed, locale });
    
    // Use static images for immediate loading
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

    console.log('Debug: Setting images for carousel:', seed, 'with', staticImages.length, 'images');
    setImages(staticImages);
    setLoading(false);
  }, [seed, locale]);

  if (loading) {
    console.log('Debug: Carousel', seed, 'is in loading state');
    return (
      <div className={`${height} overflow-hidden bg-background`}>
        {/* Empty loading state - no spinner */}
      </div>
    );
  }

  if (!images.length) {
    console.log('Debug: Carousel', seed, 'has no images');
    return (
      <div
        className={`${height} overflow-hidden bg-background flex items-center justify-center`}
      >
        <div className="text-muted-foreground">No images available</div>
      </div>
    );
  }

  console.log('Debug: Carousel', seed, 'rendering with', images.length, 'images');
  
  // Simple static display of images without animation
  return (
    <div className={`${height} overflow-hidden bg-background relative`}>
      <div className="text-white bg-green-500 p-2 absolute top-0 left-0 z-10 text-xs">
        Debug: {seed} - {images.length} images loaded
      </div>
      <div className="flex h-full">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="flex-shrink-0 w-full h-full relative"
          >
            <div className="text-white bg-blue-500 p-1 absolute top-0 left-0 z-20 text-xs">
              Image {index + 1}
            </div>
            <Image
              src={image.url}
              alt={image.alt || 'Gallery image'}
              fill
              className="object-cover"
              loading={index < 1 ? 'eager' : 'lazy'}
              priority={priority && index < 1}
              quality={60}
              sizes="300px"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>
        ))}
      </div>
    </div>
  );
}
