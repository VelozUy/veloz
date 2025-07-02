'use client';

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
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
} from 'lucide-react';
import Image from 'next/image';

// Grid dimensions
const GRID_WIDTH = 18;
const GRID_HEIGHT = 12;
// We'll calculate cell size dynamically

// Font options for title blocks
export const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter', fontFamily: 'Inter, sans-serif' },
  {
    value: 'playfair',
    label: 'Playfair Display',
    fontFamily: 'Playfair Display, serif',
  },
  { value: 'roboto', label: 'Roboto', fontFamily: 'Roboto, sans-serif' },
  {
    value: 'montserrat',
    label: 'Montserrat',
    fontFamily: 'Montserrat, sans-serif',
  },
  {
    value: 'opensans',
    label: 'Open Sans',
    fontFamily: 'Open Sans, sans-serif',
  },
  { value: 'poppins', label: 'Poppins', fontFamily: 'Poppins, sans-serif' },
  { value: 'raleway', label: 'Raleway', fontFamily: 'Raleway, sans-serif' },
  { value: 'lato', label: 'Lato', fontFamily: 'Lato, sans-serif' },
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

interface VisualGridEditorProps {
  projectMedia: ProjectMedia[];
  mediaBlocks: MediaBlock[];
  onMediaBlocksChange: (blocks: MediaBlock[]) => void;
  disabled?: boolean;
  projectName?: string;
}

export default function VisualGridEditor({
  projectMedia,
  mediaBlocks,
  onMediaBlocksChange,
  disabled = false,
  projectName,
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
  const containerRef = useRef<HTMLDivElement>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const selectedBlockRef = useRef<HTMLDivElement>(null);

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
      const maxHeight = GRID_HEIGHT;

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
    [GRID_CELL_SIZE]
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
  const calculateMaxOffset = useCallback(
    (block: MediaBlock, media: ProjectMedia) => {
      if (block.type === 'title') return { maxX: 0, maxY: 0 };

      // Get block dimensions
      const blockWidth = block.width * GRID_CELL_SIZE;
      const blockHeight = block.height * GRID_CELL_SIZE;
      const blockAspectRatio = blockWidth / blockHeight;

      // Since we're scaling the image to 1.5x, we can allow more movement
      // The image is 50% larger than the block, so we can move it up to 25% in each direction
      // This ensures there's always image content visible in the block
      const maxOffset = 25; // 25% of block size in each direction

      return {
        maxX: maxOffset,
        maxY: maxOffset,
      };
    },
    [GRID_CELL_SIZE]
  );

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
          : { maxX: 15, maxY: 15 };

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

        onMediaBlocksChange(updatedBlocks);
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

        // Apply constraints to resize operation
        const maxWidth = GRID_WIDTH - block.x;
        const maxHeight = GRID_HEIGHT - block.y;

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

      onMediaBlocksChange(updatedBlocks);
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

    onMediaBlocksChange([...mediaBlocks, { ...newBlock, ...constrained }]);
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

      onMediaBlocksChange([...mediaBlocks, { ...newBlock, ...constrained }]);
    },
    [mediaBlocks, onMediaBlocksChange, disabled, constrainToGrid]
  );

  // Remove media block
  const removeMediaBlock = useCallback(
    (blockId: string) => {
      if (disabled) return;

      const updatedBlocks = mediaBlocks.filter(b => b.id !== blockId);
      onMediaBlocksChange(updatedBlocks);
      setSelectedBlock(null);
    },
    [mediaBlocks, onMediaBlocksChange, disabled]
  );

  // Clear all blocks
  const clearAllBlocks = useCallback(() => {
    if (disabled) return;

    onMediaBlocksChange([]);
    setSelectedBlock(null);
  }, [onMediaBlocksChange, disabled]);

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
      onMediaBlocksChange(updatedBlocks);

      // Update the editingTitleBlock state to reflect changes
      if (editingTitleBlock && editingTitleBlock.id === blockId) {
        setEditingTitleBlock({ ...editingTitleBlock, ...updates });
      }
    },
    [mediaBlocks, onMediaBlocksChange, editingTitleBlock]
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
      onMediaBlocksChange(fixedBlocks);
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
                <div className="mb-3 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
                  <div className="flex items-center justify-end mb-2">
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
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        id="title"
                        value={editingTitleBlock.title || ''}
                        onChange={e =>
                          updateTitleBlock(editingTitleBlock.id, {
                            title: e.target.value,
                          })
                        }
                        placeholder="Título"
                        className="text-xs h-7 bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500"
                      />
                    </div>

                    <Select
                      value={editingTitleBlock.font || 'inter'}
                      onValueChange={value =>
                        updateTitleBlock(editingTitleBlock.id, { font: value })
                      }
                    >
                      <SelectTrigger className="text-xs h-8 w-24 bg-gray-800 border-gray-600 text-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {FONT_OPTIONS.map(font => (
                          <SelectItem
                            key={font.value}
                            value={font.value}
                            className="text-gray-200 hover:bg-gray-700"
                          >
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1">
                      <Input
                        id="color"
                        type="color"
                        value={editingTitleBlock.color || '#000000'}
                        onChange={e =>
                          updateTitleBlock(editingTitleBlock.id, {
                            color: e.target.value,
                          })
                        }
                        className="w-8 h-8 p-1 bg-gray-800 border-gray-600"
                      />
                      <span className="text-xs text-gray-400 w-12">
                        {editingTitleBlock.color || '#000000'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {/* Z-Index Toolbar */}
              {selectedBlock && (
                <div className="mb-2 flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-lg w-fit">
                  <span className="text-xs text-gray-300 mr-2">
                    Orden de superposición:
                  </span>
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
                      onMediaBlocksChange(updatedBlocks);
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
                      if (!block) return;
                      const minZ = Math.min(...mediaBlocks.map(b => b.zIndex));
                      if (block.zIndex === minZ) return;
                      const updatedBlocks = mediaBlocks.map(b => {
                        if (b.id === block.id)
                          return { ...b, zIndex: b.zIndex - 1 };
                        if (b.zIndex === block.zIndex - 1)
                          return { ...b, zIndex: b.zIndex + 1 };
                        return b;
                      });
                      onMediaBlocksChange(updatedBlocks);
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
                </div>
              )}
              {/* Responsive Grid Container */}
              <div
                ref={containerRef}
                className="w-full h-[70vh] border border-gray-200 rounded-lg bg-white flex items-center justify-center"
              >
                <div
                  ref={gridRef}
                  className="relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                  style={{
                    width: GRID_WIDTH * GRID_CELL_SIZE,
                    height: GRID_HEIGHT * GRID_CELL_SIZE,
                    maxWidth: '100%',
                    maxHeight: '100%',
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
                    {Array.from({ length: GRID_HEIGHT + 1 }).map((_, i) => (
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
                            ? 'ring-2 ring-primary ring-offset-2'
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
                        {/* Drag Handle */}
                        {!disabled && (
                          <div
                            className="absolute top-1 left-1 w-6 h-6 bg-primary/80 hover:bg-primary cursor-move rounded-sm flex items-center justify-center z-10"
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
                        )}

                        {/* Media Content */}
                        <div className="w-full h-full relative overflow-hidden rounded">
                          {block.type === 'title' ? (
                            // Title block
                            <div
                              className="w-full h-full flex items-center justify-center p-4"
                              style={{
                                fontFamily: block.font
                                  ? FONT_OPTIONS.find(
                                      f => f.value === block.font
                                    )?.fontFamily
                                  : 'Inter, sans-serif',
                                fontSize: `${Math.min(block.width, block.height) * 3}vw`,
                                color: block.color || '#000000',
                              }}
                            >
                              <div className="text-center font-bold break-words">
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
                                    transform: `translate(${block.mediaOffsetX || 0}%, ${block.mediaOffsetY || 0}%) scale(1.5)`,
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
                                    transform: `translate(${block.mediaOffsetX || 0}%, ${block.mediaOffsetY || 0}%) scale(1.5)`,
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

                          {/* Remove Button */}
                          {!disabled && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 w-6 h-6 p-0"
                              onClick={e => {
                                e.stopPropagation();
                                removeMediaBlock(block.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
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
                    {GRID_WIDTH}×{GRID_HEIGHT} Grid • {mediaBlocks.length}{' '}
                    bloques
                  </div>
                </div>
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
