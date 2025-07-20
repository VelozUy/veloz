'use client';

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
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
  adminMediaBlocks?: MediaBlock[]; // Add admin mediaBlocks for positioning lookup
}

// Grid dimensions (matching the editor)
const GRID_WIDTH = 16;
const GRID_HEIGHT = 9;

// Font family mappings (matching the admin editor)
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
  adminMediaBlocks = [], // Default to empty array
}: ProjectVisualGridProps) {
  // Create a map of media by ID for quick lookup
  const mediaMap = useMemo(() => {
    const map = new Map<string, ProjectMedia>();
    projectMedia.forEach(media => {
      map.set(media.id, media);
    });
    return map;
  }, [projectMedia]);

  // Create a map of admin mediaBlocks by mediaId for positioning lookup
  const adminMediaBlocksMap = useMemo(() => {
    const map = new Map<string, MediaBlock>();
    adminMediaBlocks.forEach(block => {
      if (block.mediaId) {
        map.set(block.mediaId, block);
      }
    });
    return map;
  }, [adminMediaBlocks]);

  // Function to get merged positioning data
  const getMergedBlockData = useCallback(
    (block: MediaBlock) => {
      // If the block already has positioning data, use it
      if (
        block.mediaOffsetX !== undefined &&
        block.mediaOffsetY !== undefined
      ) {
        return block;
      }

      // Otherwise, try to get positioning data from admin mediaBlocks
      if (block.mediaId) {
        const adminBlock = adminMediaBlocksMap.get(block.mediaId);
        if (
          adminBlock &&
          adminBlock.mediaOffsetX !== undefined &&
          adminBlock.mediaOffsetY !== undefined
        ) {
          return {
            ...block,
            mediaOffsetX: adminBlock.mediaOffsetX,
            mediaOffsetY: adminBlock.mediaOffsetY,
          };
        }
      }

      // Default to centered positioning
      return {
        ...block,
        mediaOffsetX: 0,
        mediaOffsetY: 0,
      };
    },
    [adminMediaBlocksMap]
  );

  // Sort blocks by z-index for proper layering
  const sortedBlocks = useMemo(() => {
    return [...mediaBlocks].sort((a, b) => a.zIndex - b.zIndex);
  }, [mediaBlocks]);

  // Use the provided gridHeight if available, otherwise calculate based on blocks
  const actualGridHeight = useMemo(() => {
    if (gridHeight) {
      return gridHeight;
    }

    // Only calculate if no gridHeight is provided
    if (!mediaBlocks.length) return GRID_HEIGHT;
    let maxY = 0;
    mediaBlocks.forEach(block => {
      const blockBottom = block.y + block.height;
      maxY = Math.max(maxY, blockBottom);
    });
    return Math.max(GRID_HEIGHT, Math.ceil(maxY));
  }, [gridHeight, mediaBlocks]);

  // Responsive grid container: use 100% width up to max, and calculate cell size/height
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Set grid width to container width (responsive), max 1200px
  const gridWidthPx = Math.min(containerWidth, 1200);
  const GRID_CELL_SIZE = gridWidthPx / GRID_WIDTH;
  const gridHeightPx = GRID_CELL_SIZE * actualGridHeight;

  // Helper to calculate scale for media (copied from admin)
  function calculateMaxOffset(block: MediaBlock, media: ProjectMedia) {
    if (block.type === 'title') return { maxX: 0, maxY: 0, scale: 1 };
    const blockWidth = block.width * GRID_CELL_SIZE;
    const blockHeight = block.height * GRID_CELL_SIZE;
    let aspectRatio = 1;
    if (media.aspectRatio) {
      if (typeof media.aspectRatio === 'string') {
        const parts = media.aspectRatio.split(':');
        aspectRatio = Number(parts[0]) / Number(parts[1]);
      } else {
        aspectRatio = media.aspectRatio;
      }
    }
    const containerAspectRatio = blockWidth / blockHeight;
    let mediaDisplayWidth = blockWidth;
    let mediaDisplayHeight = blockHeight;
    if (aspectRatio > containerAspectRatio) {
      mediaDisplayHeight = blockHeight;
      mediaDisplayWidth = blockHeight * aspectRatio;
    } else {
      mediaDisplayWidth = blockWidth;
      mediaDisplayHeight = blockWidth / aspectRatio;
    }
    const scaleX = mediaDisplayWidth / blockWidth;
    const scaleY = mediaDisplayHeight / blockHeight;
    const scale = Math.max(scaleX, scaleY, 1);
    const maxOffsetX = Math.max(
      0,
      ((mediaDisplayWidth - blockWidth) / 2 / blockWidth) * 100
    );
    const maxOffsetY = Math.max(
      0,
      ((mediaDisplayHeight - blockHeight) / 2 / blockHeight) * 100
    );
    return { maxX: maxOffsetX, maxY: maxOffsetY, scale };
  }

  if (!mediaBlocks.length) {
    // Fallback to simple grid when no custom layout exists
    return (
      <div className={cn('w-full', className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectMedia.slice(0, 6).map((media, index) => (
            <div
              key={media.id || index}
              className="aspect-square relative overflow-hidden rounded-none"
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

  // Render the grid with the same design as the admin editor
  return (
    <div className={cn('w-full flex justify-center', className)}>
      <div
        ref={containerRef}
        className="w-full max-w-[1200px]"
        style={{
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${gridWidthPx}px`,
            height: `${gridHeightPx}px`,
            position: 'relative',
            background: '#f3f4f6', // Light gray background like admin editor
            borderRadius: '8px',
            margin: '0 auto',
            overflow: 'hidden',
            border: '2px dashed #d1d5db', // Dashed border like admin editor
            transition: 'width 0.2s, height 0.2s',
          }}
        >
          {/* Grid Lines - matching admin editor */}
          {/* Vertical lines */}
          {Array.from({ length: GRID_WIDTH + 1 }).map((_, i) => (
            <div
              key={`v-${i}`}
              style={{
                position: 'absolute',
                top: 0,
                left: `${i * GRID_CELL_SIZE}px`,
                width: '1px',
                height: `${gridHeightPx}px`,
                background: '#e5e7eb',
                zIndex: 0,
                opacity: 0.5,
              }}
            />
          ))}
          {/* Horizontal lines */}
          {Array.from({ length: actualGridHeight + 1 }).map((_, i) => (
            <div
              key={`h-${i}`}
              style={{
                position: 'absolute',
                left: 0,
                top: `${i * GRID_CELL_SIZE}px`,
                width: `${gridWidthPx}px`,
                height: '1px',
                background: '#e5e7eb',
                zIndex: 0,
                opacity: 0.5,
              }}
            />
          ))}

          {/* Render each media block */}
          {sortedBlocks.map((block, index) => {
            const media = block.mediaId ? mediaMap.get(block.mediaId) : null;
            const mergedBlock = getMergedBlockData(block);
            const left = block.x * GRID_CELL_SIZE;
            const top = block.y * GRID_CELL_SIZE;
            const width = block.width * GRID_CELL_SIZE;
            const height = block.height * GRID_CELL_SIZE;

            const blockStyle = {
              position: 'absolute' as const,
              left: `${left}px`,
              top: `${top}px`,
              width: `${width}px`,
              height: `${height}px`,
              zIndex: block.zIndex,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              borderRadius: '4px',
            };

            return (
              <div key={block.id} className="absolute" style={blockStyle}>
                {block.type === 'title' ? (
                  // Title block
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      fontFamily: block.font
                        ? FONT_FAMILIES[block.font] || 'Inter, sans-serif'
                        : 'Inter, sans-serif',
                      fontSize: `clamp(0.5rem, ${Math.min(block.width, block.height) * 4}vw, 12rem)`,
                      color: block.color || '#000000',
                    }}
                  >
                    <div className="text-center font-bold whitespace-nowrap overflow-hidden w-full h-full flex items-center justify-center px-2">
                      {block.title || 'Título del Proyecto'}
                    </div>
                  </div>
                ) : media ? (
                  // Media block
                  <div className="w-full h-full relative">
                    {media.type === 'video' ? (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        autoPlay
                        preload={index < 4 ? 'auto' : 'metadata'}
                      />
                    ) : (
                      <Image
                        src={media.url}
                        alt={media.description?.es || projectTitle}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index < 4}
                        loading={index < 4 ? 'eager' : 'lazy'}
                      />
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">
                      Media no encontrado
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
