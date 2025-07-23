'use client';

import Masonry from 'react-masonry-css';
import Image from 'next/image';

export interface ProjectMedia {
  id: string;
  projectId: string;
  type: 'photo' | 'video';
  url: string;
  description?: Record<string, string>;
  tags?: string[];
  aspectRatio?: '1:1' | '16:9' | '9:16';
  width?: number;
  height?: number;
  order: number;
}

interface MasonryGalleryProps {
  media: ProjectMedia[];
  projectTitle: string;
  className?: string;
}

// Helper function to convert aspect ratio string to width/height
const parseAspectRatio = (aspectRatio?: string) => {
  if (!aspectRatio) return { width: 1, height: 1 };
  const parts = aspectRatio.split(':');
  if (parts.length === 2) {
    const width = parseInt(parts[0]);
    const height = parseInt(parts[1]);
    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      return { width, height };
    }
  }
  return { width: 1, height: 1 };
};

export default function MasonryGallery({
  media,
  projectTitle,
  className,
}: MasonryGalleryProps) {
  if (!media.length) {
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

  // Debug: Show media info
  // (You can remove these logs if not needed)
  // console.log('MasonryGallery received media:', media.length, 'items');
  // media.forEach((item, index) => {
  //   console.log(`Item ${index}:`, {
  //     id: item.id,
  //     width: item.width,
  //     height: item.height,
  //     aspectRatio: item.aspectRatio,
  //     isVertical: item.width && item.height ? item.width < item.height : 'unknown'
  //   });
  // });

  // Responsive breakpoints for columns
  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    900: 2,
    600: 1,
  };

  return (
    <div
      className={className}
      style={{ width: '100vw', minHeight: '100vh', margin: 0, padding: 0 }}
    >
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {media.map(item => {
          // Calculate aspect ratio (height/width)
          let aspect = 1;
          if (item.width && item.height) {
            aspect = item.height / item.width;
          } else if (item.aspectRatio) {
            const { width, height } = parseAspectRatio(item.aspectRatio);
            aspect = height / width;
          }
          const paddingBottom = `${aspect * 100}%`;

          return (
            <div
              key={item.id}
              className="group cursor-pointer transition-all duration-300 ease-out hover:brightness-110"
              style={{
                width: '100%',
                position: 'relative',
                paddingBottom,
                margin: 0,
                overflow: 'hidden',
              }}
            >
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-300 ease-out"
                  muted
                  loop
                  playsInline
                  autoPlay
                  data-testid={`video-${item.id}`}
                  style={{ borderRadius: 0, background: 'black' }}
                />
              ) : (
                <Image
                  src={item.url}
                  alt={item.description?.es || projectTitle}
                  fill
                  className="object-cover transition-all duration-300 ease-out"
                  style={{ borderRadius: 0, background: 'black' }}
                  sizes="100vw"
                />
              )}
            </div>
          );
        })}
      </Masonry>
    </div>
  );
}

// Masonry CSS (add to global CSS or module):
// .masonry-grid { display: flex; margin-left: 0; width: 100vw; }
// .masonry-grid_column { background-clip: padding-box; }
// .masonry-grid_column > div { margin-bottom: 0; }
