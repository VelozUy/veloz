'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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

interface InfiniteLoopingGalleryProps {
  media: ProjectMedia[];
  projectTitle: string;
  className?: string;
  columns?: number;
  gap?: number;
  autoPlay?: boolean;
  loopDelay?: number;
}

// Helper function to convert aspect ratio string to width/height
const parseAspectRatio = (aspectRatio?: string) => {
  if (!aspectRatio) return { width: 1, height: 1 }; // Default square
  
  const parts = aspectRatio.split(':');
  if (parts.length === 2) {
    const width = parseInt(parts[0]);
    const height = parseInt(parts[1]);
    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      return { width, height };
    }
  }
  
  // Fallback to square if parsing fails
  return { width: 1, height: 1 };
};

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// Subtle parallax levels
const getParallaxLevel = (index: number) => {
  const level = index % 3;
  return {
    zIndex: level === 0 ? 1 : level === 1 ? 10 : 20,
    speed: level === 0 ? 0.05 : level === 1 ? 0.1 : 0.15, // much more subtle
    scale: level === 0 ? 0.95 : level === 1 ? 1 : 1.05, // subtle scale
  };
};

export default function InfiniteLoopingGallery({
  media,
  projectTitle,
  className,
  columns = 3,
  gap = 16,
  autoPlay = true,
  loopDelay = 3000,
}: InfiniteLoopingGalleryProps) {
  const [scrollY, setScrollY] = useState(0);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // === Toolbar state for live tuning ===
  const [maxWidth, setMaxWidth] = useState(761); // px
  const [maxHeight, setMaxHeight] = useState(552); // px
  const [hGapFactor, setHGapFactor] = useState(3.74); // multiplier
  const [vGapConst, setVGapConst] = useState(422); // px
  const [jitter, setJitter] = useState(0.3); // fraction

  // Move getStaggeredGridPosition here so it can access state
  function getStaggeredGridPosition(index: number, total: number, viewportWidth: number, viewportHeight: number, itemWidth: number, itemHeight: number, offsetSeed: number) {
    // Calculate cell size to fit item + max jitter
    const jitterPadX = itemWidth * jitter;
    const jitterPadY = itemHeight * jitter;
    const cellWidth = itemWidth + jitterPadX;
    const cellHeight = itemHeight + jitterPadY;
    const colCount = Math.max(2, Math.floor(viewportWidth / (cellWidth * hGapFactor)));
    const rowCount = Math.ceil(total / colCount);
    const col = index % colCount;
    const row = Math.floor(index / colCount);
    const baseHGap = (viewportWidth - colCount * cellWidth) / (colCount + 1);
    const hGap = baseHGap * hGapFactor;
    const vGap = vGapConst;
    const maxStagger = Math.max(0, (hGap + cellWidth) / 2 - itemWidth / 2);
    const stagger = (row % 2 === 1) ? Math.min((cellWidth + hGap) / 2, maxStagger) : 0;
    // Clamp jitter so it cannot push item outside its cell
    const maxJitterX = (cellWidth - itemWidth) / 2;
    const maxJitterY = (cellHeight - itemHeight) / 2;
    const jitterX = (offsetSeed - 0.5) * 2 * Math.min(jitterPadX / 2, maxJitterX);
    const jitterY = (offsetSeed - 0.5) * 2 * Math.min(jitterPadY / 2, maxJitterY);
    const x = hGap + col * (cellWidth + hGap) + cellWidth / 2 + stagger + jitterX;
    const y = vGap + row * (cellHeight + vGap) + cellHeight / 2 + jitterY;
    const clampedX = clamp(x, itemWidth / 2, viewportWidth - itemWidth / 2);
    const clampedY = clamp(y, itemHeight / 2, containerHeight - itemHeight / 2);
    return { x: clampedX, y: clampedY };
  }

  // Handle scroll events for parallax with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle viewport size changes
  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  // Create masonry layout with varying sizes and stable random offsets
  // Not memoized so it always uses latest toolbar state
  let masonryItems: Array<ProjectMedia & {
    uniqueId: string;
    size: { width: number; height: number };
    setIndex: number;
    offsetSeed: number;
  }> = [];
  if (media.length) {
    const items = [];
    const mediaSets = 4; // Fewer sets for less density
    const totalItems = media.length * mediaSets;
    // Precompute a stable random offset for each item (0..1)
    const stableOffsets: number[] = Array.from({ length: totalItems }, (_, i) => {
      const mediaId = media[i % media.length].id;
      let hash = 0;
      for (let c = 0; c < mediaId.length; c++) hash += mediaId.charCodeAt(c);
      return Math.abs(Math.sin(i * 999 + hash)) % 1;
    });
    for (let i = 0; i < totalItems; i++) {
      const mediaIndex = i % media.length;
      const mediaItem = media[mediaIndex];
      const size = parseAspectRatio(mediaItem.aspectRatio);
      items.push({
        ...mediaItem,
        uniqueId: `${mediaItem.id}-${i}`,
        size,
        setIndex: Math.floor(i / media.length),
        offsetSeed: stableOffsets[i],
      });
    }
    masonryItems = items;
  }

  if (!media.length) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <p className="text-muted-foreground">No media available</p>
      </div>
    );
  }

  // Calculate container height dynamically
  let containerHeight = 0;
  if (media.length && viewportSize.width && viewportSize.height) {
    const maxW = Math.min(viewportSize.width * 0.9, maxWidth);
    const maxH = Math.min(viewportSize.height * 0.9, maxHeight);
    let itemWidth = maxW;
    let itemHeight = maxH;
    const refItem = masonryItems[0] || { size: { width: 1, height: 1 } };
    if (refItem.size.width > refItem.size.height) {
      itemHeight = (maxW * refItem.size.height) / refItem.size.width;
    } else {
      itemWidth = (maxH * refItem.size.width) / refItem.size.height;
    }
    const jitterPadY = itemHeight * jitter;
    const cellHeight = itemHeight + jitterPadY;
    const colCount = Math.max(2, Math.floor(viewportSize.width / ((itemWidth + itemWidth * jitter) * hGapFactor)));
    const rowCount = Math.ceil(masonryItems.length / colCount);
    const vGap = vGapConst;
    containerHeight = (cellHeight + vGap) * rowCount + vGap;
  } else {
    containerHeight = 4000; // fallback in px
  }

  return (
    <div className={cn('w-full relative', className)} ref={containerRef}>
      {/* Floating Toolbar for Live Tuning */}
      <div style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 10000,
        background: 'rgba(30,30,30,0.95)',
        color: '#fff',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
        minWidth: 260,
        fontSize: 14,
      }}>
        <div style={{fontWeight: 600, marginBottom: 8}}>Gallery Controls</div>
        <label>Max Width: {maxWidth}px
          <input type="range" min={100} max={viewportSize.width} value={maxWidth} onChange={e => setMaxWidth(Number(e.target.value))} style={{width: '100%'}} />
        </label>
        <label>Max Height: {maxHeight}px
          <input type="range" min={60} max={viewportSize.height} value={maxHeight} onChange={e => setMaxHeight(Number(e.target.value))} style={{width: '100%'}} />
        </label>
        <label>Horizontal Gap Factor: {hGapFactor.toFixed(2)}
          <input type="range" min={0.8} max={10.0} step={0.01} value={hGapFactor} onChange={e => setHGapFactor(Number(e.target.value))} style={{width: '100%'}} />
        </label>
        <label>Vertical Gap: {vGapConst}px
          <input type="range" min={0} max={1000} value={vGapConst} onChange={e => setVGapConst(Number(e.target.value))} style={{width: '100%'}} />
        </label>
        <label>Jitter: {jitter.toFixed(2)}
          <input type="range" min={0} max={0.3} step={0.01} value={jitter} onChange={e => setJitter(Number(e.target.value))} style={{width: '100%'}} />
        </label>
        <div style={{marginTop: 8, fontSize: 12, opacity: 0.7}}>
          <div>maxWidth: {maxWidth}</div>
          <div>maxHeight: {maxHeight}</div>
          <div>hGapFactor: {hGapFactor}</div>
          <div>vGap: {vGapConst}</div>
          <div>jitter: {jitter}</div>
        </div>
      </div>
      {/* Gallery Container - using absolute positioning for parallax */}
      <div
        className="relative w-full"
        style={{
          height: containerHeight,
          overflow: 'hidden',
        }}
      >
        {masonryItems.map((item, index) => {
          // Use toolbar state for sizing
          const maxW = Math.min(viewportSize.width * 0.9, maxWidth);
          const maxH = Math.min(viewportSize.height * 0.9, maxHeight);
          let itemWidth = maxW;
          let itemHeight = maxH;
          if (item.size.width > item.size.height) {
            itemHeight = (maxW * item.size.height) / item.size.width;
          } else {
            itemWidth = (maxH * item.size.width) / item.size.height;
          }

          // Use staggered grid for denser, organic layout
          const { x, y } = getStaggeredGridPosition(index, masonryItems.length, viewportSize.width, viewportSize.height, itemWidth, itemHeight, item.offsetSeed);
          const parallax = getParallaxLevel(index);
          const translateY = scrollY * parallax.speed;

          return (
            <div
              key={item.uniqueId}
              className="absolute rounded-lg overflow-hidden bg-muted"
              style={{
                left: `${x - itemWidth / 2}px`,
                top: `${y - itemHeight / 2 + translateY}px`,
                width: `${itemWidth}px`,
                height: `${itemHeight}px`,
                zIndex: parallax.zIndex,
                transform: `scale(${parallax.scale})`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              ) : (
                <Image
                  src={item.url}
                  alt={item.description?.es || projectTitle}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 