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

// Media block interface
export interface MediaBlock {
  id: string;
  mediaId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'image' | 'video';
  zIndex: number;
}

interface VisualGridEditorProps {
  projectMedia: ProjectMedia[];
  mediaBlocks: MediaBlock[];
  onMediaBlocksChange: (blocks: MediaBlock[]) => void;
  disabled?: boolean;
}

export default function VisualGridEditor({
  projectMedia,
  mediaBlocks,
  onMediaBlocksChange,
  disabled = false,
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
  const [isDesktopOnly, setIsDesktopOnly] = useState(true);
  const [containerSize, setContainerSize] = useState({
    width: 900,
    height: 600,
  });
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

  // Enhanced handle mouse move with better resize constraints
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !selectedBlock || !gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      const block = mediaBlocks.find(b => b.id === selectedBlock);
      if (!block) return;

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
      selectedBlock,
      mediaBlocks,
      dragStart,
      resizeMode,
      snapToGrid,
      constrainToGrid,
      onMediaBlocksChange,
      initialBlockPos,
      GRID_CELL_SIZE,
    ]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setResizeMode('none');
  }, []);

  // Add event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

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
                    const media = getMediaById(block.mediaId);
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
                      >
                        {/* Media Content */}
                        <div className="w-full h-full relative overflow-hidden rounded">
                          {media ? (
                            media.type === 'video' ? (
                              <video
                                src={media.url}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                playsInline
                              />
                            ) : (
                              <Image
                                src={media.url}
                                alt={media.fileName || 'Media'}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                            )
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">
                                Media no encontrado
                              </span>
                            </div>
                          )}

                          {/* Media Type Badge */}
                          <div className="absolute top-1 left-1">
                            <Badge variant="secondary" className="text-xs">
                              {media?.type === 'video' ? '🎥' : '📷'}
                            </Badge>
                          </div>

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
                  derecha para redimensionar • Los bloques se ajustan
                  automáticamente a la cuadrícula y no pueden salir de los
                  límites
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
