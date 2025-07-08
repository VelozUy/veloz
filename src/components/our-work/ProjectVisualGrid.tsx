'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface MediaBlock {
  id: string;
  mediaId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'image' | 'video' | 'title';
  zIndex: number;
  title?: string;
  font?: string;
  color?: string;
  mediaOffsetX?: number;
  mediaOffsetY?: number;
}

export interface ProjectMedia {
  id: string;
  projectId: string;
  type: 'photo' | 'video';
  url: string;
  description?: Record<string, string>;
  tags?: string[];
  aspectRatio?: '1:1' | '16:9' | '9:16';
  order: number;
}

interface ProjectVisualGridProps {
  mediaBlocks: MediaBlock[];
  projectMedia: ProjectMedia[];
  projectTitle: string;
  className?: string;
  gridHeight?: number;
}

// Grid dimensions (matching the editor)
const GRID_WIDTH = 16;
const GRID_HEIGHT = 9;

// Font family mappings
const FONT_FAMILIES: Record<string, string> = {
  inter: 'var(--font-inter)',
  roboto: 'var(--font-roboto)',
  opensans: 'var(--font-open-sans)',
  poppins: 'var(--font-poppins)',
  playfair: 'var(--font-playfair)',
  cormorant: 'var(--font-cormorant)',
  cinzel: 'var(--font-cinzel)',
  'libre-baskerville': 'var(--font-libre-baskerville)',
  montserrat: 'var(--font-montserrat)',
  raleway: 'var(--font-raleway)',
  quicksand: 'var(--font-quicksand)',
  nunito: 'var(--font-nunito)',
  oswald: 'var(--font-oswald)',
  anton: 'var(--font-anton)',
  'bebas-neue': 'var(--font-bebas-neue)',
  impact: 'Impact, sans-serif',
  lato: 'var(--font-lato)',
  'source-sans-pro': 'var(--font-source-sans)',
  ubuntu: 'var(--font-ubuntu)',
  'work-sans': 'var(--font-work-sans)',
  helvetica: 'Helvetica, Arial, sans-serif',
  arial: 'Arial, sans-serif',
  georgia: 'Georgia, serif',
  times: 'Times New Roman, serif',
};

export default function ProjectVisualGrid({
  mediaBlocks,
  projectMedia,
  projectTitle,
  className,
  gridHeight,
}: ProjectVisualGridProps) {
  // Create a map of media by ID for quick lookup
  const mediaMap = useMemo(() => {
    const map = new Map<string, ProjectMedia>();
    projectMedia.forEach(media => {
      map.set(media.id, media);
    });
    return map;
  }, [projectMedia]);

  // Sort blocks by z-index for proper layering
  const sortedBlocks = useMemo(() => {
    return [...mediaBlocks].sort((a, b) => a.zIndex - b.zIndex);
  }, [mediaBlocks]);

  // Calculate actual grid height based on blocks
  const calculatedGridHeight = useMemo(() => {
    if (!mediaBlocks.length) return GRID_HEIGHT;
    let maxY = 0;
    mediaBlocks.forEach(block => {
      const blockBottom = block.y + block.height;
      maxY = Math.max(maxY, blockBottom);
    });
    return Math.max(GRID_HEIGHT, Math.ceil(maxY));
  }, [mediaBlocks]);

  const actualGridHeight = gridHeight || calculatedGridHeight;

  if (!mediaBlocks.length) {
    // Fallback to simple grid when no custom layout exists
    return (
      <div className={cn('w-full', className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectMedia.slice(0, 6).map((media, index) => (
            <div
              key={media.id || index}
              className="aspect-square relative overflow-hidden rounded-lg"
            >
              {media.type === 'video' ? (
                <video
                  src={media.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              ) : (
                <Image
                  src={media.url}
                  alt={media.description?.es || projectTitle}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full', className)}>
      {/* Grid Container */}
      <div
        className="relative w-full"
        style={{
          aspectRatio: `${GRID_WIDTH}/${actualGridHeight}`,
        }}
      >
        {/* Render each media block */}
        {sortedBlocks.map(block => {
          const media = block.mediaId ? mediaMap.get(block.mediaId) : null;

          // Calculate block position and size as percentages
          const left = (block.x / GRID_WIDTH) * 100;
          const top = (block.y / actualGridHeight) * 100;
          const width = (block.width / GRID_WIDTH) * 100;
          const height = (block.height / actualGridHeight) * 100;

          const blockStyle = {
            position: 'absolute' as const,
            left: `${left}%`,
            top: `${top}%`,
            width: `${width}%`,
            height: `${height}%`,
            zIndex: block.zIndex,
          };

          if (block.type === 'title') {
            // Render title block
            return (
              <div
                key={block.id}
                style={blockStyle}
                className="flex items-center justify-center p-4 text-center"
              >
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    fontFamily: block.font
                      ? FONT_FAMILIES[block.font]
                      : undefined,
                    color: block.color || 'inherit',
                  }}
                >
                  <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold leading-tight">
                    {block.title || projectTitle}
                  </h2>
                </div>
              </div>
            );
          }

          if (block.type === 'image' && media) {
            // Render image block
            return (
              <div
                key={block.id}
                style={blockStyle}
                className="overflow-hidden"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={media.url}
                    alt={media.description?.es || projectTitle}
                    fill
                    className="object-cover"
                    sizes={`(max-width: 768px) ${width}vw, ${width * 0.8}vw`}
                    style={{
                      objectPosition:
                        block.mediaOffsetX !== undefined &&
                        block.mediaOffsetY !== undefined
                          ? `${50 + block.mediaOffsetX * 100}% ${50 + block.mediaOffsetY * 100}%`
                          : 'center',
                    }}
                  />
                </div>
              </div>
            );
          }

          if (block.type === 'video' && media) {
            // Render video block
            return (
              <div
                key={block.id}
                style={blockStyle}
                className="overflow-hidden"
              >
                <div className="relative w-full h-full">
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay
                    style={{
                      objectPosition:
                        block.mediaOffsetX !== undefined &&
                        block.mediaOffsetY !== undefined
                          ? `${50 + block.mediaOffsetX * 100}% ${50 + block.mediaOffsetY * 100}%`
                          : 'center',
                    }}
                  />
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
