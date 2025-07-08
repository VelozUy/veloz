'use client';

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectMedia } from '@/services/firebase';
import {
  Grid,
  Move,
  Maximize2,
  Minimize2,
  Trash2,
  Monitor,
  Smartphone,
  ChevronFirst,
  ChevronLast,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import Image from 'next/image';

// Grid dimensions
const GRID_WIDTH = 16;
const GRID_HEIGHT = 9;
// We'll calculate cell size dynamically

// Font options for title blocks - categorized by project type
export const FONT_OPTIONS = [
  // Modern & Clean (Corporate, Tech, Business)
  {
    value: 'inter',
    label: 'Inter',
    fontFamily: 'var(--font-inter)',
    category: 'modern',
  },
  {
    value: 'roboto',
    label: 'Roboto',
    fontFamily: 'var(--font-roboto)',
    category: 'modern',
  },
  {
    value: 'opensans',
    label: 'Open Sans',
    fontFamily: 'var(--font-open-sans)',
    category: 'modern',
  },
  {
    value: 'poppins',
    label: 'Poppins',
    fontFamily: 'var(--font-poppins)',
    category: 'modern',
  },

  // Elegant & Luxury (Fashion, Beauty, Premium)
  {
    value: 'playfair',
    label: 'Playfair Display',
    fontFamily: 'var(--font-playfair)',
    category: 'elegant',
  },
  {
    value: 'cormorant',
    label: 'Cormorant Garamond',
    fontFamily: 'var(--font-cormorant)',
    category: 'elegant',
  },
  {
    value: 'cinzel',
    label: 'Cinzel',
    fontFamily: 'var(--font-cinzel)',
    category: 'elegant',
  },
  {
    value: 'libre-baskerville',
    label: 'Libre Baskerville',
    fontFamily: 'var(--font-libre-baskerville)',
    category: 'elegant',
  },

  // Creative & Artistic (Design, Art, Creative)
  {
    value: 'montserrat',
    label: 'Montserrat',
    fontFamily: 'var(--font-montserrat)',
    category: 'creative',
  },
  {
    value: 'raleway',
    label: 'Raleway',
    fontFamily: 'var(--font-raleway)',
    category: 'creative',
  },
  {
    value: 'quicksand',
    label: 'Quicksand',
    fontFamily: 'var(--font-quicksand)',
    category: 'creative',
  },
  {
    value: 'nunito',
    label: 'Nunito',
    fontFamily: 'var(--font-nunito)',
    category: 'creative',
  },

  // Bold & Impact (Sports, Action, Dynamic)
  {
    value: 'oswald',
    label: 'Oswald',
    fontFamily: 'var(--font-oswald)',
    category: 'bold',
  },
  {
    value: 'anton',
    label: 'Anton',
    fontFamily: 'var(--font-anton)',
    category: 'bold',
  },
  {
    value: 'bebas-neue',
    label: 'Bebas Neue',
    fontFamily: 'var(--font-bebas-neue)',
    category: 'bold',
  },
  {
    value: 'impact',
    label: 'Impact',
    fontFamily: 'Impact, sans-serif',
    category: 'bold',
  },

  // Friendly & Approachable (Food, Lifestyle, Family)
  {
    value: 'lato',
    label: 'Lato',
    fontFamily: 'var(--font-lato)',
    category: 'friendly',
  },
  {
    value: 'source-sans-pro',
    label: 'Source Sans Pro',
    fontFamily: 'var(--font-source-sans)',
    category: 'friendly',
  },
  {
    value: 'ubuntu',
    label: 'Ubuntu',
    fontFamily: 'var(--font-ubuntu)',
    category: 'friendly',
  },
  {
    value: 'work-sans',
    label: 'Work Sans',
    fontFamily: 'var(--font-work-sans)',
    category: 'friendly',
  },

  // Minimalist & Clean (Architecture, Interior Design)
  {
    value: 'helvetica',
    label: 'Helvetica',
    fontFamily: 'Helvetica, Arial, sans-serif',
    category: 'minimalist',
  },
  {
    value: 'arial',
    label: 'Arial',
    fontFamily: 'Arial, sans-serif',
    category: 'minimalist',
  },
  {
    value: 'georgia',
    label: 'Georgia',
    fontFamily: 'Georgia, serif',
    category: 'minimalist',
  },
  {
    value: 'times',
    label: 'Times New Roman',
    fontFamily: 'Times New Roman, serif',
    category: 'minimalist',
  },
] as const;

// Media block interface
export interface MediaBlock {
  id: string;
  mediaId?: string; // Optional for title blocks
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'image' | 'video' | 'title';
  zIndex: number;
  // Title-specific properties
  title?: string;
  font?: string;
  color?: string;
  // Media positioning within block (for image/video blocks)
  mediaOffsetX?: number; // Offset from center (0 = centered)
  mediaOffsetY?: number; // Offset from center (0 = centered)
}

interface GridConfig {
  width: number;
  height: number;
}

interface VisualGridEditorProps {
  projectMedia: ProjectMedia[];
  mediaBlocks: MediaBlock[];
  onMediaBlocksChange: (blocks: MediaBlock[], gridConfig?: GridConfig) => void;
  disabled?: boolean;
  projectName?: string;
  expandable?: boolean;
  initialGridConfig?: GridConfig;
}

export default function VisualGridEditor({
  projectMedia,
  mediaBlocks,
  onMediaBlocksChange,
  disabled = false,
  projectName,
  expandable = false,
  initialGridConfig,
}: VisualGridEditorProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialBlockPos, setInitialBlockPos] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [resizeMode, setResizeMode] = useState<
    'none' | 'width' | 'height' | 'corner'
  >('none');
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const [mediaDragStart, setMediaDragStart] = useState({ x: 0, y: 0 });
  const [initialMediaOffset, setInitialMediaOffset] = useState({ x: 0, y: 0 });
  const [isDesktopOnly, setIsDesktopOnly] = useState(true);
  const [containerSize, setContainerSize] = useState({
    width: 900,
    height: 600,
  });
  const [editingTitleBlock, setEditingTitleBlock] = useState<MediaBlock | null>(
    null
  );
  const [showTitleToolbar, setShowTitleToolbar] = useState(false);
  const [additionalRows, setAdditionalRows] = useState(() => {
    // Initialize additionalRows based on initialGridConfig
    if (initialGridConfig) {
      const calculated = Math.max(0, initialGridConfig.height - GRID_HEIGHT);
      console.log('🔍 VisualGridEditor - Initializing additionalRows:', {
        initialGridConfig,
        GRID_HEIGHT,
        calculated,
      });
      return calculated;
    }
    console.log(
      '🔍 VisualGridEditor - No initialGridConfig, using 0 additionalRows'
    );
    return 0;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const selectedBlockRef = useRef<HTMLDivElement>(null);

  // Update additionalRows when initialGridConfig changes
  useEffect(() => {
    if (initialGridConfig) {
      const calculated = Math.max(0, initialGridConfig.height - GRID_HEIGHT);
      console.log('🔍 VisualGridEditor - useEffect updating additionalRows:', {
        initialGridConfig,
        currentAdditionalRows: additionalRows,
        calculated,
        willUpdate: calculated !== additionalRows,
      });
      setAdditionalRows(calculated);
    }
  }, [initialGridConfig]);

  // Helper function to get current grid configuration
  const getCurrentGridConfig = useCallback((): GridConfig => {
    const config = {
      width: GRID_WIDTH,
      height: GRID_HEIGHT + additionalRows,
    };
    console.log('🔍 VisualGridEditor - getCurrentGridConfig:', {
      GRID_WIDTH,
      GRID_HEIGHT,
      additionalRows,
      config,
    });
    return config;
  }, [additionalRows]);

  // Helper function to call onMediaBlocksChange with grid config
  const updateMediaBlocks = useCallback(
    (blocks: MediaBlock[]) => {
      const gridConfig = getCurrentGridConfig();
      console.log('🔍 VisualGridEditor - updateMediaBlocks called:', {
        blocks,
        gridConfig,
      });
      onMediaBlocksChange(blocks, gridConfig);
    },
    [onMediaBlocksChange, getCurrentGridConfig]
  );

  // Expansion handlers
  const handleAddRow = () => {
    const newAdditionalRows = additionalRows + 1;
    setAdditionalRows(newAdditionalRows);
    const gridConfig: GridConfig = {
      width: GRID_WIDTH,
      height: GRID_HEIGHT + newAdditionalRows,
    };
    console.log('🔍 VisualGridEditor - handleAddRow called:', {
      additionalRows,
      newAdditionalRows,
      gridConfig,
      mediaBlocks: mediaBlocks.length,
    });
    onMediaBlocksChange(mediaBlocks, gridConfig);
  };

  const handleAddNineRows = () => {
    const newAdditionalRows = additionalRows + 9;
    setAdditionalRows(newAdditionalRows);
    const gridConfig: GridConfig = {
      width: GRID_WIDTH,
      height: GRID_HEIGHT + newAdditionalRows,
    };
    console.log('🔍 VisualGridEditor - handleAddNineRows called:', {
      additionalRows,
      newAdditionalRows,
      gridConfig,
      mediaBlocks: mediaBlocks.length,
    });
    onMediaBlocksChange(mediaBlocks, gridConfig);
  };

  const handleRemoveRow = () => {
    const newAdditionalRows = Math.max(0, additionalRows - 1);
    setAdditionalRows(newAdditionalRows);
    const gridConfig: GridConfig = {
      width: GRID_WIDTH,
      height: GRID_HEIGHT + newAdditionalRows,
    };
    onMediaBlocksChange(mediaBlocks, gridConfig);
  };

  // Auto-populate grid with all media
  const handleAutoPopulate = () => {
    if (projectMedia.length === 0) return;

    // Use stable ordering based on media ID to prevent constant reordering
    const sortedMedia = [...projectMedia].sort((a, b) => {
      // Sort by media ID for consistent ordering
      return (a.id || '').localeCompare(b.id || '');
    });

    // Calculate block dimensions based on media aspect ratio
    const calculateBlockSize = (media: ProjectMedia) => {
      let blockWidth = 4; // Default size doubled
      let blockHeight = 4;

      if (media.aspectRatio) {
        let aspectRatio: number;
        if (typeof media.aspectRatio === 'string') {
          const parts = media.aspectRatio.split(':');
          const width = Number(parts[0]);
          const height = Number(parts[1]);
          aspectRatio = width / height;
        } else {
          aspectRatio = media.aspectRatio as number;
        }

        // Base size doubled for larger layout
        const baseSize = 6;

        if (aspectRatio > 1) {
          // Wide media (landscape)
          blockWidth = Math.min(8, Math.ceil(baseSize * aspectRatio));
          blockHeight = Math.max(4, Math.ceil(blockWidth / aspectRatio));
        } else {
          // Tall media (portrait)
          blockHeight = Math.min(8, Math.ceil(baseSize / aspectRatio));
          blockWidth = Math.max(4, Math.ceil(blockHeight * aspectRatio));
        }
      } else {
        // Default sizing doubled
        blockWidth = 6;
        blockHeight = 6;
      }

      return { width: blockWidth, height: blockHeight };
    };

    // Two-pass algorithm: first pass places all media, second pass fills gaps
    const newBlocks: MediaBlock[] = [];
    let x = 0;
    let y = 0;
    let maxY = 0;

    // Track occupied positions to avoid overlaps
    const occupied = new Set<string>();

    const isOccupied = (
      startX: number,
      startY: number,
      width: number,
      height: number
    ) => {
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          const key = `${startX + dx},${startY + dy}`;
          if (occupied.has(key)) return true;
        }
      }
      return false;
    };

    const markOccupied = (
      startX: number,
      startY: number,
      width: number,
      height: number
    ) => {
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          const key = `${startX + dx},${startY + dy}`;
          occupied.add(key);
        }
      }
    };

    // FIRST PASS: Place all media sequentially
    sortedMedia.forEach((media: ProjectMedia, index: number) => {
      const { width: blockWidth, height: blockHeight } =
        calculateBlockSize(media);

      // Check if current position fits
      if (x + blockWidth > GRID_WIDTH) {
        const remainingSpace = GRID_WIDTH - x;

        // Try to fit in remaining space with different sizes
        if (remainingSpace >= 2) {
          let finalWidth = remainingSpace;
          const finalHeight = Math.min(remainingSpace, blockHeight);
          if (finalWidth >= 6) finalWidth = 6;
          else if (finalWidth >= 4) finalWidth = 4;
          else if (finalWidth >= 3) finalWidth = 3;
          else finalWidth = 2;

          const block: MediaBlock = {
            id: `auto-${index}`,
            mediaId: media.id,
            x: x,
            y: y,
            width: finalWidth,
            height: finalHeight,
            type: media.type === 'video' ? 'video' : 'image',
            zIndex: index,
          };
          newBlocks.push(block);
          markOccupied(x, y, finalWidth, finalHeight);
          x += finalWidth;
        } else {
          // Move to next row
          x = 0;
          y = maxY;
          const block: MediaBlock = {
            id: `auto-${index}`,
            mediaId: media.id,
            x: x,
            y: y,
            width: blockWidth,
            height: blockHeight,
            type: media.type === 'video' ? 'video' : 'image',
            zIndex: index,
          };
          newBlocks.push(block);
          markOccupied(x, y, blockWidth, blockHeight);
          x += blockWidth;
        }
      } else {
        const block: MediaBlock = {
          id: `auto-${index}`,
          mediaId: media.id,
          x: x,
          y: y,
          width: blockWidth,
          height: blockHeight,
          type: media.type === 'video' ? 'video' : 'image',
          zIndex: index,
        };
        newBlocks.push(block);
        markOccupied(x, y, blockWidth, blockHeight);
        x += blockWidth;
      }

      maxY = Math.max(maxY, y + blockHeight);
    });

    // SECOND PASS: Find gaps and fill them with appropriate media
    const findGaps = () => {
      const gaps: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        ratio: number;
      }> = [];

      for (let row = 0; row < maxY; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
          if (!isOccupied(col, row, 1, 1)) {
            // Find the size of this gap
            let gapWidth = 0;
            let gapHeight = 0;

            // Find width
            for (
              let dx = 0;
              col + dx < GRID_WIDTH && !isOccupied(col + dx, row, 1, 1);
              dx++
            ) {
              gapWidth++;
            }

            // Find height
            for (
              let dy = 0;
              row + dy < maxY && !isOccupied(col, row + dy, gapWidth, 1);
              dy++
            ) {
              gapHeight++;
            }

            if (gapWidth >= 2 && gapHeight >= 2) {
              const ratio = gapWidth / gapHeight;
              gaps.push({
                x: col,
                y: row,
                width: gapWidth,
                height: gapHeight,
                ratio,
              });
            }
          }
        }
      }

      return gaps;
    };

    const findMediaForGap = (gapRatio: number, usedMediaIds: Set<string>) => {
      // Find media that hasn't been used yet and has a similar aspect ratio
      for (let i = sortedMedia.length - 1; i >= 0; i--) {
        const media = sortedMedia[i];
        if (usedMediaIds.has(media.id || '')) continue;

        let mediaRatio = 1;
        if (media.aspectRatio) {
          if (typeof media.aspectRatio === 'string') {
            const parts = media.aspectRatio.split(':');
            const width = Number(parts[0]);
            const height = Number(parts[1]);
            mediaRatio = width / height;
          } else {
            mediaRatio = media.aspectRatio as number;
          }
        }

        // Check if aspect ratios are similar (within 50% difference)
        const ratioDiff =
          Math.abs(mediaRatio - gapRatio) / Math.max(mediaRatio, gapRatio);
        if (ratioDiff < 0.5) {
          return media;
        }
      }
      return null;
    };

    // Fill gaps with appropriate media
    const usedMediaIds = new Set<string>();
    newBlocks.forEach(block => {
      if (block.mediaId) usedMediaIds.add(block.mediaId);
    });

    const gaps = findGaps();
    gaps.forEach(gap => {
      const media = findMediaForGap(gap.ratio, usedMediaIds);
      if (media) {
        const block: MediaBlock = {
          id: `gap-${Date.now()}-${Math.random()}`,
          mediaId: media.id,
          x: gap.x,
          y: gap.y,
          width: gap.width,
          height: gap.height,
          type: media.type === 'video' ? 'video' : 'image',
          zIndex: 1000, // High z-index to ensure it's on top
        };
        newBlocks.push(block);
        usedMediaIds.add(media.id || '');
      }
    });

    // Calculate additional rows needed, but respect existing grid height if it's larger
    const additionalRowsNeeded = Math.max(0, maxY - GRID_HEIGHT);
    const currentTotalRows = GRID_HEIGHT + additionalRows;
    const newTotalRows = Math.max(
      currentTotalRows,
      GRID_HEIGHT + additionalRowsNeeded
    );
    const newAdditionalRows = newTotalRows - GRID_HEIGHT;

    console.log('🔍 VisualGridEditor - handleAutoPopulate grid calculation:', {
      maxY,
      additionalRowsNeeded,
      currentTotalRows,
      newTotalRows,
      newAdditionalRows,
      existingAdditionalRows: additionalRows,
    });

    setAdditionalRows(newAdditionalRows);

    // Update media blocks with ALL media and the correct grid config
    const gridConfig: GridConfig = {
      width: GRID_WIDTH,
      height: GRID_HEIGHT + newAdditionalRows,
    };
    console.log(
      '🔍 VisualGridEditor - handleAutoPopulate calling onMediaBlocksChange with gridConfig:',
      gridConfig
    );
    onMediaBlocksChange(newBlocks, gridConfig);
  };

  // Dynamically calculate cell size to fit the grid in the container
  const cellWidth = containerSize.width / GRID_WIDTH;
  const cellHeight = containerSize.height / GRID_HEIGHT;
  const GRID_CELL_SIZE = Math.floor(Math.min(cellWidth, cellHeight));

  // Snap to grid function
  const snapToGrid = useCallback(
    (value: number): number => {
      return Math.round(value / GRID_CELL_SIZE) * GRID_CELL_SIZE;
    },
    [GRID_CELL_SIZE]
  );

  // Enhanced constrain to grid bounds with better logic
  const constrainToGrid = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const maxWidth = GRID_WIDTH;
      const maxHeight = GRID_HEIGHT + additionalRows;

      // Ensure minimum size of 1 grid cell
      const minSize = 1;
      let constrainedWidth = Math.max(minSize, width);
      let constrainedHeight = Math.max(minSize, height);

      // Constrain width and height to grid bounds
      constrainedWidth = Math.min(constrainedWidth, maxWidth);
      constrainedHeight = Math.min(constrainedHeight, maxHeight);

      // Constrain position to ensure block stays within grid
      const maxX = maxWidth - constrainedWidth;
      const maxY = maxHeight - constrainedHeight;

      const constrainedX = Math.max(0, Math.min(x, maxX));
      const constrainedY = Math.max(0, Math.min(y, maxY));

      // Final check: ensure the block doesn't extend beyond grid boundaries
      const finalX = Math.min(constrainedX, maxWidth - constrainedWidth);
      const finalY = Math.min(constrainedY, maxHeight - constrainedHeight);

      return {
        x: Math.max(0, finalX),
        y: Math.max(0, finalY),
        width: constrainedWidth,
        height: constrainedHeight,
      };
    },
    [GRID_CELL_SIZE, additionalRows]
  );

  // Handle mouse down on media block
  const handleMouseDown = useCallback(
    (
      e: React.MouseEvent,
      blockId: string,
      mode: 'drag' | 'resize' = 'drag'
    ) => {
      if (disabled) return;

      e.preventDefault();
      e.stopPropagation();

      setSelectedBlock(blockId);
      setIsDragging(true);
      setResizeMode(mode === 'resize' ? 'corner' : 'none');

      const rect = gridRef.current?.getBoundingClientRect();
      if (rect) {
        setDragStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      // Store the initial block position for smooth dragging
      const block = mediaBlocks.find(b => b.id === blockId);
      if (block) {
        // Store the block's current position in grid coordinates
        setInitialBlockPos({
          x: block.x,
          y: block.y,
        });
      }
    },
    [disabled, mediaBlocks, GRID_CELL_SIZE]
  );

  // Handle mouse down on media content (for repositioning within block)
  const handleMediaMouseDown = useCallback(
    (e: React.MouseEvent, blockId: string) => {
      if (disabled) return;

      e.preventDefault();
      e.stopPropagation();

      const block = mediaBlocks.find(b => b.id === blockId);
      if (!block || block.type === 'title') return;

      setSelectedBlock(blockId);
      setIsDraggingMedia(true);

      const rect = gridRef.current?.getBoundingClientRect();
      if (rect) {
        setMediaDragStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }

      // Store the initial media offset
      setInitialMediaOffset({
        x: block.mediaOffsetX || 0,
        y: block.mediaOffsetY || 0,
      });
    },
    [disabled, mediaBlocks]
  );

  // Calculate maximum allowed offset for media positioning
  const calculateMaxOffset = useMemo(() => {
    return (block: MediaBlock, media: ProjectMedia) => {
      if (block.type === 'title') return { maxX: 0, maxY: 0 };

      // Get block dimensions
      const blockWidth = block.width * GRID_CELL_SIZE;
      const blockHeight = block.height * GRID_CELL_SIZE;

      // Media aspect ratio
      let aspectRatio = 1;
      if (media.aspectRatio) {
        if (typeof media.aspectRatio === 'string') {
          const parts = media.aspectRatio.split(':');
          const width = Number(parts[0]);
          const height = Number(parts[1]);
          aspectRatio = width / height;
        } else {
          aspectRatio = media.aspectRatio as number;
        }
      }

      // Calculate scaled media dimensions (object-cover)
      const containerAspectRatio = blockWidth / blockHeight;
      let mediaDisplayWidth = blockWidth;
      let mediaDisplayHeight = blockHeight;
      if (aspectRatio > containerAspectRatio) {
        // Media is wider: fit height
        mediaDisplayHeight = blockHeight;
        mediaDisplayWidth = blockHeight * aspectRatio;
      } else {
        // Media is taller or equal: fit width
        mediaDisplayWidth = blockWidth;
        mediaDisplayHeight = blockWidth / aspectRatio;
      }

      // Calculate the scale needed to ensure the full media content is available for repositioning
      // The scale should be the ratio of the larger dimension to ensure no content is lost
      const scaleX = mediaDisplayWidth / blockWidth;
      const scaleY = mediaDisplayHeight / blockHeight;
      const scale = Math.max(scaleX, scaleY, 1); // At least 1x scale

      // The max offset is the distance from center to the edge, in percent of container size
      // You can move the media so that its edge is flush with the container edge, but not beyond
      // This prevents showing blank space when dragging
      const maxOffsetX = Math.max(
        0,
        ((mediaDisplayWidth - blockWidth) / 2 / blockWidth) * 100
      );
      const maxOffsetY = Math.max(
        0,
        ((mediaDisplayHeight - blockHeight) / 2 / blockHeight) * 100
      );

      return { maxX: maxOffsetX, maxY: maxOffsetY, scale };
    };
  }, [GRID_CELL_SIZE]);

  // Enhanced handle mouse move with better resize constraints
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging && !isDraggingMedia) return;
      if (!selectedBlock || !gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      const block = mediaBlocks.find(b => b.id === selectedBlock);
      if (!block) return;

      if (isDraggingMedia && block.type !== 'title') {
        // Media dragging mode - adjust media position within block
        const deltaX = currentX - mediaDragStart.x;
        const deltaY = currentY - mediaDragStart.y;

        // Convert delta to percentage of block size
        const blockWidthPx = block.width * GRID_CELL_SIZE;
        const blockHeightPx = block.height * GRID_CELL_SIZE;

        const newOffsetX = initialMediaOffset.x + (deltaX / blockWidthPx) * 100;
        const newOffsetY =
          initialMediaOffset.y + (deltaY / blockHeightPx) * 100;

        // Get the media to calculate proper limits
        const media = block.mediaId ? getMediaById(block.mediaId) : null;
        const { maxX, maxY } = media
          ? calculateMaxOffset(block, media)
          : { maxX: 0, maxY: 0 };

        // Constrain offset to calculated bounds
        const constrainedOffsetX = Math.max(-maxX, Math.min(maxX, newOffsetX));
        const constrainedOffsetY = Math.max(-maxY, Math.min(maxY, newOffsetY));

        const updatedBlocks = mediaBlocks.map(b =>
          b.id === selectedBlock
            ? {
                ...b,
                mediaOffsetX: constrainedOffsetX,
                mediaOffsetY: constrainedOffsetY,
              }
            : b
        );

        updateMediaBlocks(updatedBlocks);
        return;
      }

      // Block dragging/resizing mode
      let newX = block.x;
      let newY = block.y;
      let newWidth = block.width;
      let newHeight = block.height;

      if (resizeMode === 'corner') {
        // Resize mode - calculate new size based on current mouse position
        // Convert current mouse position to grid coordinates
        const mouseXInGrid = currentX / GRID_CELL_SIZE;
        const mouseYInGrid = currentY / GRID_CELL_SIZE;

        // Calculate new width and height based on mouse position relative to block position
        const proposedWidth = Math.max(1, Math.round(mouseXInGrid - block.x));
        const proposedHeight = Math.max(1, Math.round(mouseYInGrid - block.y));

        // Apply constraints to resize operation - use the expanded grid height
        const maxWidth = GRID_WIDTH - block.x;
        const maxHeight = GRID_HEIGHT + additionalRows - block.y;

        newWidth = Math.min(proposedWidth, maxWidth);
        newHeight = Math.min(proposedHeight, maxHeight);

        // Ensure minimum size
        newWidth = Math.max(1, newWidth);
        newHeight = Math.max(1, newHeight);
      } else {
        // Drag mode - use initial block position for smooth movement
        const deltaX = currentX - dragStart.x;
        const deltaY = currentY - dragStart.y;

        // Convert delta to grid coordinates and snap
        const deltaXInGrid = deltaX / GRID_CELL_SIZE;
        const deltaYInGrid = deltaY / GRID_CELL_SIZE;

        newX = Math.round(initialBlockPos.x + deltaXInGrid);
        newY = Math.round(initialBlockPos.y + deltaYInGrid);
      }

      // Apply final constraints to ensure block stays within grid
      const constrained = constrainToGrid(newX, newY, newWidth, newHeight);

      const updatedBlocks = mediaBlocks.map(b =>
        b.id === selectedBlock
          ? {
              ...b,
              x: constrained.x,
              y: constrained.y,
              width: constrained.width,
              height: constrained.height,
            }
          : b
      );

      updateMediaBlocks(updatedBlocks);
    },
    [
      isDragging,
      isDraggingMedia,
      selectedBlock,
      mediaBlocks,
      dragStart,
      mediaDragStart,
      initialMediaOffset,
      resizeMode,
      snapToGrid,
      constrainToGrid,
      onMediaBlocksChange,
      initialBlockPos,
      GRID_CELL_SIZE,
      calculateMaxOffset,
    ]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsDraggingMedia(false);
    setResizeMode('none');
  }, []);

  // Add event listeners
  useEffect(() => {
    if (isDragging || isDraggingMedia) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isDraggingMedia, handleMouseMove, handleMouseUp]);

  // Add title block with proper grid constraints
  const addTitleBlock = useCallback(() => {
    if (disabled) return;

    // Find a valid position for the new title block (in grid coordinates)
    const defaultWidth = 6; // 6 grid cells for title
    const defaultHeight = 2; // 2 grid cells for title

    // Try to place the block at (0,0) first, then find next available position
    let placementX = 0;
    let placementY = 0;

    // Simple collision detection to find available space
    const maxAttempts = 20;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const wouldCollide = mediaBlocks.some(block => {
        return (
          placementX < block.x + block.width &&
          placementX + defaultWidth > block.x &&
          placementY < block.y + block.height &&
          placementY + defaultHeight > block.y
        );
      });

      if (!wouldCollide) {
        break;
      }

      // Move to next position
      placementX += 1; // 1 grid cell
      if (placementX + defaultWidth > GRID_WIDTH) {
        placementX = 0;
        placementY += 1; // 1 grid cell
      }

      attempts++;
    }

    const newBlock: MediaBlock = {
      id: `title-${Date.now()}`,
      x: placementX,
      y: placementY,
      width: defaultWidth,
      height: defaultHeight,
      type: 'title',
      zIndex: mediaBlocks.length + 1,
      title: projectName || 'Título del Proyecto',
      font: 'inter',
      color: '#000000',
    };

    // Apply constraints to ensure the block is within grid bounds
    const constrained = constrainToGrid(
      newBlock.x,
      newBlock.y,
      newBlock.width,
      newBlock.height
    );

    updateMediaBlocks([...mediaBlocks, { ...newBlock, ...constrained }]);
  }, [mediaBlocks, onMediaBlocksChange, disabled, constrainToGrid]);

  // Add media block with proper grid constraints
  const addMediaBlock = useCallback(
    (media: ProjectMedia) => {
      if (disabled) return;

      // Find a valid position for the new block (in grid coordinates)
      const defaultWidth = 2; // 2 grid cells
      const defaultHeight = 2; // 2 grid cells

      // Try to place the block at (0,0) first, then find next available position
      let placementX = 0;
      let placementY = 0;

      // Simple collision detection to find available space
      const maxAttempts = 10;
      let attempts = 0;

      while (attempts < maxAttempts) {
        const wouldCollide = mediaBlocks.some(block => {
          return (
            placementX < block.x + block.width &&
            placementX + defaultWidth > block.x &&
            placementY < block.y + block.height &&
            placementY + defaultHeight > block.y
          );
        });

        if (!wouldCollide) {
          break;
        }

        // Move to next position
        placementX += 1; // 1 grid cell
        if (placementX + defaultWidth > GRID_WIDTH) {
          placementX = 0;
          placementY += 1; // 1 grid cell
        }

        attempts++;
      }

      const newBlock: MediaBlock = {
        id: `block-${Date.now()}`,
        mediaId: media.id || '',
        x: placementX,
        y: placementY,
        width: defaultWidth,
        height: defaultHeight,
        type: media.type === 'photo' ? 'image' : 'video',
        zIndex: mediaBlocks.length + 1,
      };

      // Apply constraints to ensure the block is within grid bounds
      const constrained = constrainToGrid(
        newBlock.x,
        newBlock.y,
        newBlock.width,
        newBlock.height
      );

      updateMediaBlocks([...mediaBlocks, { ...newBlock, ...constrained }]);
    },
    [mediaBlocks, onMediaBlocksChange, disabled, constrainToGrid]
  );

  // Remove media block
  const removeMediaBlock = useCallback(
    (blockId: string) => {
      if (disabled) return;

      const updatedBlocks = mediaBlocks.filter(b => b.id !== blockId);
      updateMediaBlocks(updatedBlocks);
      setSelectedBlock(null);
    },
    [mediaBlocks, updateMediaBlocks, disabled]
  );

  // Clear all blocks
  const clearAllBlocks = useCallback(() => {
    if (disabled) return;

    updateMediaBlocks([]);
    setSelectedBlock(null);
  }, [updateMediaBlocks, disabled]);

  // Get media by ID
  const getMediaById = useCallback(
    (mediaId: string) => {
      return projectMedia.find(m => m.id === mediaId);
    },
    [projectMedia]
  );

  // Available media (not yet placed in grid)
  const availableMedia = projectMedia.filter(
    media => !mediaBlocks.some(block => block.mediaId === media.id)
  );

  // Update title block
  const updateTitleBlock = useCallback(
    (blockId: string, updates: Partial<MediaBlock>) => {
      const updatedBlocks = mediaBlocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      );
      updateMediaBlocks(updatedBlocks);

      // Update the editingTitleBlock state to reflect changes
      if (editingTitleBlock && editingTitleBlock.id === blockId) {
        setEditingTitleBlock({ ...editingTitleBlock, ...updates });
      }
    },
    [mediaBlocks, updateMediaBlocks, editingTitleBlock]
  );

  // Validate and fix existing blocks on mount
  useEffect(() => {
    const maxWidth = GRID_WIDTH;
    const maxHeight = GRID_HEIGHT;

    const hasInvalidBlocks = mediaBlocks.some(
      block =>
        block.width > maxWidth ||
        block.height > maxHeight ||
        block.x + block.width > maxWidth ||
        block.y + block.height > maxHeight ||
        block.x < 0 ||
        block.y < 0
    );

    if (hasInvalidBlocks) {
      const fixedBlocks = mediaBlocks.map(block => {
        const constrained = constrainToGrid(
          block.x,
          block.y,
          block.width,
          block.height
        );
        return { ...block, ...constrained };
      });
      updateMediaBlocks(fixedBlocks);
    }
  }, []); // Only run on mount

  // Resize observer to update container size
  useLayoutEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Grid className="w-5 h-5" />
            Editor Visual de Disposición
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Monitor className="w-3 h-3" />
            Solo Desktop
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllBlocks}
            disabled={disabled || mediaBlocks.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Limpiar Todo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {/* Title Block Toolbar */}
              {showTitleToolbar && editingTitleBlock && (
                <div className="mb-3 p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-200">
                      Editar Título
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
                      onClick={() => {
                        setShowTitleToolbar(false);
                        setEditingTitleBlock(null);
                      }}
                    >
                      ✕
                    </Button>
                  </div>

                  {/* Live Preview */}
                  <div className="mb-3 p-3 bg-gray-800 rounded border border-gray-600">
                    <div className="text-xs text-gray-400 mb-1">
                      Vista previa:
                    </div>
                    <div
                      className="text-center font-bold break-words"
                      style={{
                        fontFamily:
                          FONT_OPTIONS.find(
                            f => f.value === editingTitleBlock.font
                          )?.fontFamily || 'Inter, sans-serif',
                        fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                        color: editingTitleBlock.color || '#000000',
                        minHeight: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {editingTitleBlock.title || 'Título del Proyecto'}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Title Input */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">
                        Texto del título:
                      </label>
                      <Input
                        id="title"
                        value={editingTitleBlock.title || ''}
                        onChange={e =>
                          updateTitleBlock(editingTitleBlock.id, {
                            title: e.target.value,
                          })
                        }
                        placeholder="Título del proyecto"
                        className="text-sm h-8 bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500"
                      />
                    </div>

                    {/* Font Selection */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">
                        Fuente:
                      </label>
                      <Select
                        value={editingTitleBlock.font || 'inter'}
                        onValueChange={value =>
                          updateTitleBlock(editingTitleBlock.id, {
                            font: value,
                          })
                        }
                      >
                        <SelectTrigger className="text-sm h-8 bg-gray-800 border-gray-600 text-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                          {Object.entries(
                            FONT_OPTIONS.reduce(
                              (acc, font) => {
                                if (!acc[font.category])
                                  acc[font.category] = [];
                                acc[font.category].push(font);
                                return acc;
                              },
                              {} as Record<
                                string,
                                Array<(typeof FONT_OPTIONS)[number]>
                              >
                            )
                          ).map(([category, fonts]) => (
                            <div key={category}>
                              <div className="px-2 py-1 text-xs font-medium text-gray-400 bg-gray-700">
                                {category === 'modern' && 'Moderno & Limpio'}
                                {category === 'elegant' && 'Elegante & Lujoso'}
                                {category === 'creative' &&
                                  'Creativo & Artístico'}
                                {category === 'bold' && 'Audaz & Impactante'}
                                {category === 'friendly' &&
                                  'Amigable & Accesible'}
                                {category === 'minimalist' &&
                                  'Minimalista & Limpio'}
                              </div>
                              {fonts.map(font => (
                                <SelectItem
                                  key={font.value}
                                  value={font.value}
                                  className="text-gray-200 hover:bg-gray-700"
                                >
                                  <span style={{ fontFamily: font.fontFamily }}>
                                    {font.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Color Selection */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">
                        Color:
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="color"
                          type="color"
                          value={editingTitleBlock.color || '#000000'}
                          onChange={e =>
                            updateTitleBlock(editingTitleBlock.id, {
                              color: e.target.value,
                            })
                          }
                          className="w-10 h-8 p-1 bg-gray-800 border-gray-600"
                        />
                        <span className="text-xs text-gray-400 font-mono">
                          {editingTitleBlock.color || '#000000'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Block Controls Toolbar */}
              {selectedBlock && (
                <div className="mb-2 flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-lg w-fit">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-gray-400 hover:text-white"
                    onClick={() => {
                      // Move block up (increase zIndex)
                      const block = mediaBlocks.find(
                        b => b.id === selectedBlock
                      );
                      if (!block) return;
                      const maxZ = Math.max(...mediaBlocks.map(b => b.zIndex));
                      if (block.zIndex === maxZ) return;
                      const updatedBlocks = mediaBlocks.map(b => {
                        if (b.id === block.id)
                          return { ...b, zIndex: b.zIndex + 1 };
                        if (b.zIndex === block.zIndex + 1)
                          return { ...b, zIndex: b.zIndex - 1 };
                        return b;
                      });
                      updateMediaBlocks(updatedBlocks);
                    }}
                    disabled={(() => {
                      const block = mediaBlocks.find(
                        b => b.id === selectedBlock
                      );
                      if (!block) return true;
                      const maxZ = Math.max(...mediaBlocks.map(b => b.zIndex));
                      return block.zIndex === maxZ;
                    })()}
                    title="Subir"
                  >
                    ▲
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-gray-400 hover:text-white"
                    onClick={() => {
                      // Move block down (decrease zIndex)
                      const block = mediaBlocks.find(
                        b => b.id === selectedBlock
                      );
                      if (!block) return true;
                      const minZ = Math.min(...mediaBlocks.map(b => b.zIndex));
                      if (block.zIndex === minZ) return;
                      const updatedBlocks = mediaBlocks.map(b => {
                        if (b.id === block.id)
                          return { ...b, zIndex: b.zIndex - 1 };
                        if (b.zIndex === block.zIndex - 1)
                          return { ...b, zIndex: b.zIndex + 1 };
                        return b;
                      });
                      updateMediaBlocks(updatedBlocks);
                    }}
                    disabled={(() => {
                      const block = mediaBlocks.find(
                        b => b.id === selectedBlock
                      );
                      if (!block) return true;
                      const minZ = Math.min(...mediaBlocks.map(b => b.zIndex));
                      return block.zIndex === minZ;
                    })()}
                    title="Bajar"
                  >
                    ▼
                  </Button>

                  <div className="w-px h-6 bg-gray-600 mx-2"></div>

                  {/* Move Controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-gray-400 hover:text-white"
                      onClick={() => {
                        const block = mediaBlocks.find(
                          b => b.id === selectedBlock
                        );
                        if (!block || block.x <= 0) return;
                        const updatedBlocks = mediaBlocks.map(b =>
                          b.id === selectedBlock ? { ...b, x: b.x - 1 } : b
                        );
                        updateMediaBlocks(updatedBlocks);
                      }}
                      disabled={(() => {
                        const block = mediaBlocks.find(
                          b => b.id === selectedBlock
                        );
                        return !block || block.x <= 0;
                      })()}
                      title="Mover izquierda"
                    >
                      <span className="text-lg">←</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-gray-400 hover:text-white"
                      onClick={() => {
                        const block = mediaBlocks.find(
                          b => b.id === selectedBlock
                        );
                        if (!block || block.x + block.width >= 16) return;
                        const updatedBlocks = mediaBlocks.map(b =>
                          b.id === selectedBlock ? { ...b, x: b.x + 1 } : b
                        );
                        updateMediaBlocks(updatedBlocks);
                      }}
                      disabled={(() => {
                        const block = mediaBlocks.find(
                          b => b.id === selectedBlock
                        );
                        return !block || block.x + block.width >= 16;
                      })()}
                      title="Mover derecha"
                    >
                      <span className="text-lg">→</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-gray-400 hover:text-white"
                      onClick={() => {
                        const block = mediaBlocks.find(
                          b => b.id === selectedBlock
                        );
                        if (!block || block.y <= 0) return;
                        const updatedBlocks = mediaBlocks.map(b =>
                          b.id === selectedBlock ? { ...b, y: b.y - 1 } : b
                        );
                        updateMediaBlocks(updatedBlocks);
                      }}
                      disabled={(() => {
                        const block = mediaBlocks.find(
                          b => b.id === selectedBlock
                        );
                        return !block || block.y <= 0;
                      })()}
                      title="Mover arriba"
                    >
                      <span className="text-lg">↑</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-gray-400 hover:text-white"
                      onClick={() => {
                        const block = mediaBlocks.find(
                          b => b.id === selectedBlock
                        );
                        if (!block || block.y + block.height >= 9) return;
                        const updatedBlocks = mediaBlocks.map(b =>
                          b.id === selectedBlock ? { ...b, y: b.y + 1 } : b
                        );
                        updateMediaBlocks(updatedBlocks);
                      }}
                      disabled={(() => {
                        const block = mediaBlocks.find(
                          b => b.id === selectedBlock
                        );
                        return !block || block.y + block.height >= 9;
                      })()}
                      title="Mover abajo"
                    >
                      <span className="text-lg">↓</span>
                    </Button>
                  </div>

                  <div className="w-px h-6 bg-gray-600 mx-1"></div>

                  {/* Resize Controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-gray-400 hover:text-white"
                      onClick={() => {
                        const block = mediaBlocks.find(
                          b => b.id === selectedBlock
                        );
                        if (!block || block.width <= 1) return;
                        const updatedBlocks = mediaBlocks.map(b =>
                          b.id === selectedBlock
                            ? { ...b, width: b.width - 1 }
                            : b
                        );
                        updateMediaBlocks(updatedBlocks);
                      }}
                      disabled={(() => {
                        const block = mediaBlocks.find(
                          b => b.id === selectedBlock
                        );
                        return !block || block.width <= 1;
                      })()}
                      title="Reducir ancho"
                    >
                      <span className="text-lg">↤</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-gray-400 hover:text-white"
                      onClick={() => {
                        const block = mediaBlocks.find(
                          b => b.id === selectedBlock
                        );
                        if (!block || block.width >= 16) return;
                        const updatedBlocks = mediaBlocks.map(b =>
                          b.id === selectedBlock
                            ? { ...b, width: b.width + 1 }
                            : b
                        );
                        updateMediaBlocks(updatedBlocks);
                      }}
                      disabled={(() => {
                        const block = mediaBlocks.find(
                          b => b.id === selectedBlock
                        );
                        return !block || block.width >= 16;
                      })()}
                      title="Aumentar ancho"
                    >
                      <span className="text-lg">↦</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-gray-400 hover:text-white"
                      onClick={() => {
                        const block = mediaBlocks.find(
                          b => b.id === selectedBlock
                        );
                        if (!block || block.height <= 1) return;
                        const updatedBlocks = mediaBlocks.map(b =>
                          b.id === selectedBlock
                            ? { ...b, height: b.height - 1 }
                            : b
                        );
                        updateMediaBlocks(updatedBlocks);
                      }}
                      disabled={(() => {
                        const block = mediaBlocks.find(
                          b => b.id === selectedBlock
                        );
                        return !block || block.height <= 1;
                      })()}
                      title="Reducir alto"
                    >
                      <span className="text-lg">↥</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-gray-400 hover:text-white"
                      onClick={() => {
                        const block = mediaBlocks.find(
                          b => b.id === selectedBlock
                        );
                        if (!block || block.height >= 9) return;
                        const updatedBlocks = mediaBlocks.map(b =>
                          b.id === selectedBlock
                            ? { ...b, height: b.height + 1 }
                            : b
                        );
                        updateMediaBlocks(updatedBlocks);
                      }}
                      disabled={(() => {
                        const block = mediaBlocks.find(
                          b => b.id === selectedBlock
                        );
                        return !block || block.height >= 9;
                      })()}
                      title="Aumentar alto"
                    >
                      <span className="text-lg">↧</span>
                    </Button>
                  </div>

                  <div className="w-px h-6 bg-gray-600 mx-2"></div>

                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 px-3 text-xs"
                    onClick={() => {
                      removeMediaBlock(selectedBlock);
                    }}
                    title="Eliminar bloque"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Eliminar
                  </Button>
                </div>
              )}

              {/* Responsive Grid Container */}
              <div
                ref={containerRef}
                className="w-full border border-gray-200 rounded-lg bg-white flex flex-col items-center justify-center"
                style={{
                  minHeight: expandable
                    ? `${(GRID_HEIGHT + additionalRows) * GRID_CELL_SIZE + 80}px`
                    : '70vh',
                }}
              >
                <div
                  ref={gridRef}
                  className="relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg"
                  style={{
                    width: GRID_WIDTH * GRID_CELL_SIZE,
                    height: (GRID_HEIGHT + additionalRows) * GRID_CELL_SIZE,
                    maxWidth: '100%',
                  }}
                >
                  {/* Grid Lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: GRID_WIDTH + 1 }).map((_, i) => (
                      <div
                        key={`v-${i}`}
                        className="absolute top-0 bottom-0 border-l border-gray-200"
                        style={{ left: i * GRID_CELL_SIZE }}
                      />
                    ))}
                    {Array.from({
                      length: GRID_HEIGHT + additionalRows + 1,
                    }).map((_, i) => (
                      <div
                        key={`h-${i}`}
                        className="absolute left-0 right-0 border-t border-gray-200"
                        style={{ top: i * GRID_CELL_SIZE }}
                      />
                    ))}
                  </div>

                  {/* Media Blocks */}
                  {mediaBlocks.map(block => {
                    const media = block.mediaId
                      ? getMediaById(block.mediaId)
                      : null;
                    const isSelected = selectedBlock === block.id;

                    return (
                      <div
                        key={block.id}
                        ref={isSelected ? selectedBlockRef : null}
                        className={`absolute cursor-move transition-all duration-200 ${
                          isSelected
                            ? 'ring-3 ring-yellow-400 ring-offset-2'
                            : 'hover:ring-2 hover:ring-primary/50'
                        } ${disabled ? 'pointer-events-none' : ''}`}
                        style={{
                          left: block.x * GRID_CELL_SIZE,
                          top: block.y * GRID_CELL_SIZE,
                          width: block.width * GRID_CELL_SIZE,
                          height: block.height * GRID_CELL_SIZE,
                          zIndex: block.zIndex,
                        }}
                        onMouseDown={e => handleMouseDown(e, block.id, 'drag')}
                        onDoubleClick={e => {
                          if (block.type === 'title') {
                            e.stopPropagation();
                            setEditingTitleBlock(block);
                            setShowTitleToolbar(true);
                          }
                        }}
                      >
                        {/* Drag Handle and Delete Button */}
                        {!disabled && (
                          <div className="absolute top-1 left-1 flex gap-1 z-10">
                            <div
                              className="w-6 h-6 bg-primary/80 hover:bg-primary cursor-move rounded-sm flex items-center justify-center"
                              onMouseDown={e => {
                                e.stopPropagation();
                                handleMouseDown(e, block.id, 'drag');
                              }}
                              title="Mover bloque"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-white"
                              >
                                <circle cx="9" cy="5" r="1" />
                                <circle cx="9" cy="12" r="1" />
                                <circle cx="9" cy="19" r="1" />
                                <circle cx="15" cy="5" r="1" />
                                <circle cx="15" cy="12" r="1" />
                                <circle cx="15" cy="19" r="1" />
                              </svg>
                            </div>
                            <button
                              className="w-6 h-6 bg-red-500 hover:bg-red-600 cursor-pointer rounded-sm flex items-center justify-center transition-colors"
                              onClick={e => {
                                e.stopPropagation();
                                const updatedBlocks = mediaBlocks.filter(
                                  b => b.id !== block.id
                                );
                                updateMediaBlocks(updatedBlocks);
                              }}
                              title="Eliminar bloque"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-white"
                              >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        )}

                        {/* Media Content */}
                        <div className="w-full h-full relative overflow-hidden rounded">
                          {block.type === 'title' ? (
                            // Title block
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{
                                fontFamily: block.font
                                  ? FONT_OPTIONS.find(
                                      f => f.value === block.font
                                    )?.fontFamily
                                  : 'Inter, sans-serif',
                                fontSize: `clamp(0.5rem, ${Math.min(block.width, block.height) * 4}vw, 12rem)`,
                                color: block.color || '#000000',
                              }}
                            >
                              <div className="text-center font-bold break-words w-full h-full flex items-center justify-center px-2">
                                {block.title || 'Título del Proyecto'}
                              </div>
                            </div>
                          ) : media ? (
                            <div
                              className="w-full h-full relative"
                              onMouseDown={e =>
                                handleMediaMouseDown(e, block.id)
                              }
                              style={{
                                cursor:
                                  isDraggingMedia && selectedBlock === block.id
                                    ? 'grabbing'
                                    : 'grab',
                              }}
                            >
                              {media.type === 'video' ? (
                                <video
                                  src={media.url}
                                  className="w-full h-full object-cover"
                                  muted
                                  loop
                                  playsInline
                                  autoPlay
                                  style={{
                                    transform: `translate(${block.mediaOffsetX || 0}%, ${block.mediaOffsetY || 0}%) scale(${media ? calculateMaxOffset(block, media).scale : 1})`,
                                  }}
                                />
                              ) : (
                                <Image
                                  src={media.url}
                                  alt={media.fileName || 'Media'}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                  style={{
                                    transform: `translate(${block.mediaOffsetX || 0}%, ${block.mediaOffsetY || 0}%) scale(${media ? calculateMaxOffset(block, media).scale : 1})`,
                                    objectPosition: 'center',
                                  }}
                                />
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">
                                Media no encontrado
                              </span>
                            </div>
                          )}

                          {/* Resize Handle */}
                          {!disabled && (
                            <div
                              className="absolute bottom-0 right-0 w-4 h-4 bg-primary cursor-se-resize"
                              onMouseDown={e => {
                                e.stopPropagation();
                                handleMouseDown(e, block.id, 'resize');
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Grid Info */}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {GRID_WIDTH}×{GRID_HEIGHT + additionalRows} Grid •{' '}
                    {mediaBlocks.length} bloques
                  </div>
                </div>

                {/* Expansion Controls - Bottom */}
                {expandable && (
                  <div className="flex items-center justify-center gap-2 mt-4 p-4 bg-gray-50 rounded-lg border">
                    <button
                      onClick={handleRemoveRow}
                      disabled={additionalRows === 0}
                      className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      -1 Fila
                    </button>
                    <button
                      onClick={handleAddRow}
                      className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      +1 Fila
                    </button>
                    <button
                      onClick={handleAddNineRows}
                      className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      +9 Filas
                    </button>
                    <span className="text-sm text-muted-foreground ml-4 px-3 py-2 bg-white rounded border">
                      Filas adicionales: {additionalRows}
                    </span>
                  </div>
                )}

                {/* Auto-populate Button */}
                {expandable && projectMedia.length > 0 && (
                  <div className="flex items-center justify-center mt-4">
                    <button
                      onClick={handleAutoPopulate}
                      disabled={disabled}
                      className="px-6 py-3 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      🎯 Auto-popular Grid con Todo el Media
                    </button>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-4 text-sm text-muted-foreground">
                <p>
                  • Arrastra los bloques para moverlos • Usa la esquina inferior
                  derecha para redimensionar • Haz doble clic en bloques de
                  título para editar • Los bloques se ajustan automáticamente a
                  la cuadrícula y no pueden salir de los límites
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Media Library */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Biblioteca de Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Title Block Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={addTitleBlock}
                disabled={disabled}
              >
                <span className="mr-2">📝</span>
                Agregar Título
              </Button>

              {availableMedia.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Todos los media han sido colocados en la cuadrícula</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableMedia.map(media => (
                    <div
                      key={media.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => addMediaBlock(media)}
                    >
                      <div className="relative w-12 h-12 overflow-hidden rounded">
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
                            alt={media.fileName || 'Media'}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {media.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {media.type === 'video' ? 'Video' : 'Imagen'}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          addMediaBlock(media);
                        }}
                        disabled={disabled}
                      >
                        <Move className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
